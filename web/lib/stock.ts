// Stock fetcher with cache tags so the BSale webhook can invalidate per-variant.
// Tag conventions:
//   stock:all                 — invalidate every stock page
//   stock:variant:{variantId} — invalidate a specific variant
//   stock:product:{productId} — invalidate all variants of a product

import { reservedFor } from './cart';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://boykot-api.onrender.com';

export interface StockRow {
  variant_id: number;
  stock: number;        // raw BSale stock
  reserved: number;     // sum of active soft reservations in Supabase
  available: number;    // max(0, stock - reserved)
}

export async function getProductStock(productId: number): Promise<StockRow[]> {
  const res = await fetch(`${API}/api/stock/product/${productId}`, {
    next: { tags: ['stock:all', `stock:product:${productId}`], revalidate: 3600 },
  });
  if (!res.ok) return [];
  const rows = (await res.json()) as Array<{ variant_id: number; stock: number }>;

  const enriched = await Promise.all(
    rows.map(async (r) => {
      const reserved = await reservedFor(r.variant_id);
      return {
        variant_id: r.variant_id,
        stock: r.stock,
        reserved,
        available: Math.max(0, r.stock - reserved),
      };
    })
  );
  return enriched;
}

export async function getVariantStock(variantId: number): Promise<StockRow | null> {
  const res = await fetch(`${API}/api/stock/variant/${variantId}`, {
    next: { tags: ['stock:all', `stock:variant:${variantId}`], revalidate: 3600 },
  });
  if (!res.ok) return null;
  const { stock } = (await res.json()) as { stock: number };
  const reserved = await reservedFor(variantId);
  return { variant_id: variantId, stock, reserved, available: Math.max(0, stock - reserved) };
}
