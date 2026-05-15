// Stock module — wraps the direct BSale client (lib/bsale-api.ts) and layers
// our Supabase soft-reservations on top.
//
// Tag conventions are set by lib/bsale-api.ts so the BSale webhook can
// invalidate per-variant.

import { fetchVariantStock, fetchProductStock } from './bsale-api';
import { reservedFor } from './cart';

export interface StockRow {
  variant_id: number;
  stock: number;        // BSale raw (sum across offices)
  reserved: number;     // sum of active soft reservations in Supabase
  available: number;    // max(0, stock - reserved)
}

const OFFICE_ID = process.env.BSALE_OFFICE_ID ? Number(process.env.BSALE_OFFICE_ID) : undefined;

export async function getProductStock(productId: number): Promise<StockRow[]> {
  const map = await fetchProductStock(productId, { officeId: OFFICE_ID });
  return Promise.all(
    Array.from(map.entries()).map(async ([variant_id, stock]) => {
      const reserved = await reservedFor(variant_id);
      return {
        variant_id,
        stock,
        reserved,
        available: Math.max(0, stock - reserved),
      };
    }),
  );
}

export async function getVariantStock(variantId: number): Promise<StockRow | null> {
  const row = await fetchVariantStock(variantId, { officeId: OFFICE_ID });
  if (!row) return null;
  const reserved = await reservedFor(variantId);
  return {
    variant_id: variantId,
    stock: row.available,
    reserved,
    available: Math.max(0, row.available - reserved),
  };
}
