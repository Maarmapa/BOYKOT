// GET /api/admin/product-lookup?q=...
//
// Combina busqueda en wc-products.json (3.6k) + lookup de stock real-time
// desde BSale via lib/stock.ts. Devuelve top 12 matches con:
//   - slug, name, sku, brand, image, price (de products.json)
//   - stock real-time (cuando matchea SKU contra bsale-variants-all.json)
//   - URL completa para copiar al DM
//
// Auth: requireAdmin (cookie firmada).

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import productsData from '@/data/products.json';
import wcVariantsAll from '@/data/bsale-variants-all.json';
import { getVariantStock } from '@/lib/stock';

interface SlimProduct {
  slug: string;
  name: string;
  sku: string | null;
  url: string | null;
  price: number | null;
  availability: string;
  image: string | null;
  brand: string | null;
}

const PRODUCTS = productsData as unknown as Record<string, SlimProduct>;
const SLUGS = Object.keys(PRODUCTS);

// Index sku -> variant_id desde bsale-variants-all.json
const SKU_TO_VARIANT: Record<string, number> = {};
const variantsByBrand = (wcVariantsAll as { by_brand: Record<string, Record<string, number>> }).by_brand;
for (const brandSlug of Object.keys(variantsByBrand)) {
  for (const [sku, vid] of Object.entries(variantsByBrand[brandSlug])) {
    SKU_TO_VARIANT[sku.toUpperCase()] = vid;
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const q = (req.nextUrl.searchParams.get('q') || '').toLowerCase().trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], total: 0 });
  }

  // Match: nombre/sku/slug/brand
  const matches: SlimProduct[] = [];
  for (const slug of SLUGS) {
    const p = PRODUCTS[slug];
    const hay = `${p.name} ${p.sku || ''} ${slug} ${p.brand || ''}`.toLowerCase();
    if (hay.includes(q)) matches.push(p);
    if (matches.length >= 20) break;
  }

  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

  // Para los top 12, intentar stock live desde BSale
  const top = matches.slice(0, 12);
  const enriched = await Promise.all(
    top.map(async p => {
      const variantId = p.sku ? SKU_TO_VARIANT[p.sku.toUpperCase()] : undefined;
      let stock: number | null = null;
      let available: number | null = null;
      if (variantId) {
        try {
          const row = await getVariantStock(variantId);
          if (row) {
            stock = row.stock;
            available = row.available;
          }
        } catch {
          // network/timeout — caemos a products.json availability
        }
      }
      return {
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        price: p.price,
        image: p.image,
        availability_static: p.availability, // de products.json snapshot
        stock_live: stock, // de BSale en vivo
        available_live: available, // stock - reservas Supabase
        url: `${SITE}/producto/${p.slug}`,
        variantId: variantId || null,
      };
    }),
  );

  return NextResponse.json({
    results: enriched,
    total: matches.length,
    query: q,
  });
}
