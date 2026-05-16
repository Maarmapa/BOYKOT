// Canonical product lookup layer. UNICA fuente de verdad para:
//   - /admin/buscar (humano)
//   - /api/lookup/* (bot Hermes, x402, public)
//   - ChatWidget (cliente final)
//
// Combina:
//   - data/products.json (snapshot WC con name/sku/price/image/url)
//   - data/wp-archive/wc-products.json (HTML rico + variantes)
//   - data/bsale-variants-all.json (SKU -> variant_id map)
//   - lib/stock.ts → BSale live stock + Supabase reservations
//   - Supabase FTS via search_products_fts RPC

import 'server-only';
import productsData from '../data/products.json';
import bsaleVariantsAll from '../data/bsale-variants-all.json';
import { ftsSearch } from './search-fts';
import { getVariantStock } from './stock';

export interface LookupProduct {
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  price: number | null;
  image: string | null;
  category: string | null;
  url: string;
  /** BSale variant_id si matchea por SKU */
  variantId: number | null;
  /** Snapshot availability from products.json */
  availability: 'InStock' | 'OutOfStock';
}

export interface LookupProductWithStock extends LookupProduct {
  stock: {
    bsale_raw: number | null;
    reserved: number | null;
    available: number | null;
    fresh_at: string; // ISO
  } | null;
}

interface SlimProduct {
  slug: string;
  name: string;
  sku: string | null;
  url: string | null;
  price: number | null;
  availability: string;
  image: string | null;
  cat: string | null;
  brand: string | null;
}

const PRODUCTS = productsData as unknown as Record<string, SlimProduct>;

// Index sku -> variantId desde bsale-variants-all.json
const SKU_TO_VARIANT: Record<string, number> = {};
const variantsByBrand = (bsaleVariantsAll as { by_brand: Record<string, Record<string, number>> }).by_brand;
for (const brandSlug of Object.keys(variantsByBrand)) {
  for (const [sku, vid] of Object.entries(variantsByBrand[brandSlug])) {
    SKU_TO_VARIANT[sku.toUpperCase()] = vid;
  }
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

function shape(p: SlimProduct, categoryOverride?: string): LookupProduct {
  const variantId = p.sku ? SKU_TO_VARIANT[p.sku.toUpperCase()] || null : null;
  return {
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    price: p.price,
    image: p.image,
    category: categoryOverride ?? p.cat ?? null,
    url: `${SITE}/producto/${p.slug}`,
    variantId,
    availability: (p.availability as 'InStock' | 'OutOfStock') || 'InStock',
  };
}

/**
 * Search by name/SKU/brand/category. Uses Supabase FTS if available
 * (better ranking), falls back to local string-match.
 */
export async function findProducts(query: string, limit = 12): Promise<LookupProduct[]> {
  if (!query || query.trim().length < 2) return [];

  // 1) FTS primero (ranking superior)
  try {
    const fts = await ftsSearch(query, limit);
    if (fts.length > 0) {
      return fts
        .map(r => PRODUCTS[r.slug])
        .filter(Boolean)
        .map((p, i) => shape(p, fts[i].category ?? undefined));
    }
  } catch {
    // fall through to string-match
  }

  // 2) Fallback string-match (case-insensitive)
  const q = query.toLowerCase().trim();
  const hits: LookupProduct[] = [];
  for (const slug of Object.keys(PRODUCTS)) {
    const p = PRODUCTS[slug];
    const hay = `${p.name} ${p.sku || ''} ${slug} ${p.brand || ''}`.toLowerCase();
    if (hay.includes(q)) hits.push(shape(p));
    if (hits.length >= limit * 2) break;
  }

  // Rank: name starts > name includes > sku exact > rest
  hits.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aStart = aName.startsWith(q) ? 10 : 0;
    const bStart = bName.startsWith(q) ? 10 : 0;
    const aSku = a.sku?.toLowerCase() === q ? 20 : 0;
    const bSku = b.sku?.toLowerCase() === q ? 20 : 0;
    return (bStart + bSku) - (aStart + aSku);
  });
  return hits.slice(0, limit);
}

/** Get a product by exact slug */
export function getProductBySlug(slug: string): LookupProduct | null {
  const p = PRODUCTS[slug];
  if (!p) return null;
  return shape(p);
}

/** Find product by SKU (exact, case-insensitive) */
export function getProductBySku(sku: string): LookupProduct | null {
  const target = sku.toUpperCase().trim();
  for (const slug of Object.keys(PRODUCTS)) {
    const p = PRODUCTS[slug];
    if (p.sku?.toUpperCase() === target) return shape(p);
  }
  return null;
}

/**
 * Enrich a product (or list) with live stock from BSale + Supabase reservations.
 * Best-effort: si BSale falla, devuelve stock=null y se mantiene la availability snapshot.
 */
export async function enrichWithStock(products: LookupProduct[]): Promise<LookupProductWithStock[]> {
  return Promise.all(
    products.map(async p => {
      if (!p.variantId) {
        return { ...p, stock: null };
      }
      try {
        const row = await getVariantStock(p.variantId);
        if (!row) return { ...p, stock: null };
        return {
          ...p,
          stock: {
            bsale_raw: row.stock,
            reserved: row.reserved,
            available: row.available,
            fresh_at: new Date().toISOString(),
          },
        };
      } catch {
        return { ...p, stock: null };
      }
    }),
  );
}

/** One-shot helper for the bot: search + enrich top N with stock */
export async function findWithStock(query: string, limit = 5): Promise<LookupProductWithStock[]> {
  const hits = await findProducts(query, limit);
  return enrichWithStock(hits);
}

/** Build a human-friendly message ready to send to a customer via DM/WhatsApp */
export function formatProductReply(p: LookupProductWithStock, contact = 'WhatsApp'): string {
  const stock = p.stock?.available ?? p.stock?.bsale_raw;
  const stockLine =
    stock != null && stock > 0
      ? `Sí, tenemos stock (${stock} disponibles).`
      : p.availability === 'OutOfStock'
      ? 'Por ahora está agotado. Te puedo avisar cuando vuelva.'
      : 'Tenemos stock.';

  const price = p.price
    ? `$${p.price.toLocaleString('es-CL')} CLP (IVA incluido)`
    : 'Te paso precio por privado';

  return `${stockLine}

${p.name} — ${price}

🔗 ${p.url}

Despacho 24-48hrs a todo Chile o retiro en Av Providencia 2251 (Metro Los Leones). ¿Te lo dejo apartado?`;
}
