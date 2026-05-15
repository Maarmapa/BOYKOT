// Direct client for BSale's public API (https://api.bsale.io/v1).
//
// We hit BSale directly from Next.js server functions and rely on Next's
// fetch cache + the BSale webhook (app/api/webhooks/bsale) to invalidate
// per-variant tags when stock/prices/products change. This replaces the
// boykot-api.onrender.com wrapper that had broken endpoints.
//
// ENV needed:
//   BSALE_ACCESS_TOKEN — from BSale admin → Configuración → Integraciones
//
// Cache tags:
//   stock:all
//   stock:variant:{variantId}
//   stock:product:{productId}
//   prices:all
//   product:{productId}

const BASE = 'https://api.bsale.io/v1';
const DEFAULT_REVALIDATE = 3600;

function token(): string {
  const t = process.env.BSALE_ACCESS_TOKEN;
  if (!t) throw new Error('BSALE_ACCESS_TOKEN missing');
  return t;
}

interface BsaleListResponse<T> {
  href: string;
  count: number;
  limit: number;
  offset: number;
  items: T[];
  next?: string;
  previous?: string;
}

async function call<T>(
  pathAndQuery: string,
  opts: { tags?: string[]; revalidate?: number } = {},
): Promise<T> {
  const url = pathAndQuery.startsWith('http') ? pathAndQuery : `${BASE}${pathAndQuery}`;
  const res = await fetch(url, {
    headers: {
      access_token: token(),
      accept: 'application/json',
    },
    next: {
      tags: opts.tags,
      revalidate: opts.revalidate ?? DEFAULT_REVALIDATE,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`BSale ${res.status} ${pathAndQuery}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ───────────────────────── stocks ─────────────────────────

export interface BsaleStockItem {
  href: string;
  id: number;
  quantity: number;
  quantityReserved: number;
  quantityAvailable: number;
  variant?: { href: string; id: number };
  office?: { href: string; id: number };
}

export interface VariantStock {
  variantId: number;
  available: number; // BSale quantityAvailable (already net of BSale-side reserves)
  raw: number;
}

/**
 * Sum stock across all offices for a single variant.
 * Filter by officeid via opts.officeId if you only care about Providencia.
 */
export async function fetchVariantStock(
  variantId: number,
  opts: { officeId?: number } = {},
): Promise<VariantStock | null> {
  const params = new URLSearchParams({ variantid: String(variantId), limit: '25' });
  if (opts.officeId) params.set('officeid', String(opts.officeId));
  try {
    const data = await call<BsaleListResponse<BsaleStockItem>>(
      `/stocks.json?${params}`,
      { tags: ['stock:all', `stock:variant:${variantId}`] },
    );
    if (!data.items?.length) return null;
    const available = data.items.reduce((s, x) => s + (x.quantityAvailable ?? 0), 0);
    const raw = data.items.reduce((s, x) => s + (x.quantity ?? 0), 0);
    return { variantId, available, raw };
  } catch (e) {
    console.error('[bsale] fetchVariantStock', variantId, e);
    return null;
  }
}

/**
 * Stock for all variants of a product, paginated through BSale until exhausted.
 * Returns a map { variantId: availableQty }.
 */
export async function fetchProductStock(
  productId: number,
  opts: { officeId?: number } = {},
): Promise<Map<number, number>> {
  const out = new Map<number, number>();
  const params = new URLSearchParams({ productid: String(productId), limit: '50' });
  if (opts.officeId) params.set('officeid', String(opts.officeId));
  let next: string | null = `/stocks.json?${params}`;
  let safety = 20; // 50 * 20 = 1000 variants ceiling
  while (next && safety-- > 0) {
    try {
      const data: BsaleListResponse<BsaleStockItem> = await call(next, {
        tags: ['stock:all', `stock:product:${productId}`],
      });
      for (const item of data.items ?? []) {
        const vid = item.variant?.id;
        if (!vid) continue;
        // Usamos `quantity` (físico) en vez de `quantityAvailable` porque
        // Centry/Loading Play reserva todo el stock para marketplaces y nos
        // dejaba available=0. La reserva real para nuestro carro vive en
        // Supabase (stock_reservations) y se descuenta en lib/stock.ts.
        out.set(vid, (out.get(vid) ?? 0) + (item.quantity ?? 0));
      }
      next = data.next ?? null;
    } catch (e) {
      console.error('[bsale] fetchProductStock', productId, e);
      break;
    }
  }
  return out;
}

// ───────────────────────── variants / products ─────────────────────────

export interface BsaleVariant {
  href: string;
  id: number;
  description: string;
  code: string;
  barCode: string;
  unlimitedStock: number;
  product?: { href: string; id: number };
}

export interface BsaleProduct {
  href: string;
  id: number;
  name: string;
  description: string;
  classification: number;
}

/**
 * Find a variant by its SKU (BSale's `code` field, e.g. EAN 13).
 * Useful when matching scraped Boykot products to BSale stock records.
 */
export async function findVariantByCode(code: string): Promise<BsaleVariant | null> {
  if (!code) return null;
  const data = await call<BsaleListResponse<BsaleVariant>>(
    `/variants.json?code=${encodeURIComponent(code)}&limit=1`,
    { tags: ['variants:all'] },
  );
  return data.items?.[0] ?? null;
}

export async function getProduct(productId: number): Promise<BsaleProduct | null> {
  try {
    return await call<BsaleProduct>(`/products/${productId}.json`, {
      tags: [`product:${productId}`],
    });
  } catch {
    return null;
  }
}

// ───────────────────────── prices ─────────────────────────

export interface BsalePrice {
  href: string;
  id: number;
  variantValue: number;
  variantValueWithTaxes: number;
  variant?: { href: string; id: number };
  priceList?: { href: string; id: number };
}

/**
 * Price for a given variant at the default (priceListId = 1) or supplied price list.
 * Returns CLP including taxes.
 */
export async function fetchVariantPrice(
  variantId: number,
  priceListId = 1,
): Promise<number | null> {
  try {
    const data = await call<BsaleListResponse<BsalePrice>>(
      `/price_lists/${priceListId}/details.json?variantid=${variantId}&limit=1`,
      { tags: ['prices:all', `price:${variantId}`] },
    );
    const item = data.items?.[0];
    if (!item) return null;
    return Math.round(item.variantValueWithTaxes);
  } catch (e) {
    console.error('[bsale] fetchVariantPrice', variantId, e);
    return null;
  }
}
