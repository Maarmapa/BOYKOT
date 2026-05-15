// Stock module — wraps the direct BSale client (lib/bsale-api.ts) and layers
// our Supabase soft-reservations on top.
//
// Tag conventions are set by lib/bsale-api.ts so the BSale webhook can
// invalidate per-variant.

import { fetchVariantStock, fetchProductStock } from './bsale-api';
import { reservedFor } from './cart';
import { readSnapshot } from './stock-snapshot';

export interface StockRow {
  variant_id: number;
  stock: number;        // BSale raw (sum across offices)
  reserved: number;     // sum of active soft reservations in Supabase
  available: number;    // max(0, stock - reserved)
}

// BSALE_OFFICE_ID intencionalmente NO se usa para sumar stock — queremos
// stock de TODAS las offices (bodega central + tienda física + cualquier
// otra) porque despachamos online. Si en el futuro queremos limitar a una
// office específica para reservas, podemos volver a wirearlo.

export async function getProductStock(
  productId: number,
  variantIds?: number[],
): Promise<StockRow[]> {
  // Fast path: si tenemos variantIds, leer del snapshot Supabase (50ms).
  // Solo caer al live BSale fetch si el snapshot no tiene esos IDs.
  if (variantIds && variantIds.length > 0) {
    const snapshot = await readSnapshot(variantIds);
    const missing = variantIds.filter(vid => !snapshot.has(vid));

    // Para los que no están en snapshot, fetcheamos live (lento) y los
    // agregamos al map. Esto cubre la primera ejecución antes del cron.
    let liveMap = new Map<number, number>();
    if (missing.length > 0) {
      liveMap = await fetchProductStock(productId, { variantIds: missing });
    }

    return Promise.all(
      variantIds.map(async vid => {
        const stock = snapshot.get(vid) ?? liveMap.get(vid) ?? 0;
        const reserved = await reservedFor(vid);
        return {
          variant_id: vid,
          stock,
          reserved,
          available: Math.max(0, stock - reserved),
        };
      }),
    );
  }

  // Fallback legacy: sin variantIds, productId filter (broken para muchos products).
  const map = await fetchProductStock(productId);
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
  const row = await fetchVariantStock(variantId);
  if (!row) return null;
  const reserved = await reservedFor(variantId);
  return {
    variant_id: variantId,
    stock: row.available,
    reserved,
    available: Math.max(0, row.available - reserved),
  };
}
