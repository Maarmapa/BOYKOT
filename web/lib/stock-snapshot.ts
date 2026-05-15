// Stock snapshot — espejo local del stock BSale en Supabase. Se refresca
// via cron Vercel + webhook BSale. Brand pages leen de acá (50ms) en
// lugar de fetchear BSale directo (7s para Copic Sketch con 358 variants).
//
// Storage: tabla Supabase bsale_stock_snapshot (PK variant_id).

import { supabaseAdmin } from './supabase';
import { fetchVariantStock } from './bsale-api';

export interface SnapshotRow {
  variant_id: number;
  product_id: number | null;
  qty: number;
  updated_at: string;
}

/**
 * Lee qty desde el snapshot para una lista de variantIds. Devuelve Map.
 * Si una variant no está en el snapshot, no aparece en el Map (fallback
 * lo decide el caller).
 */
export async function readSnapshot(variantIds: number[]): Promise<Map<number, number>> {
  if (variantIds.length === 0) return new Map();
  const out = new Map<number, number>();
  try {
    // Supabase IN limit ~1000, chunked por las dudas
    const CHUNK = 500;
    for (let i = 0; i < variantIds.length; i += CHUNK) {
      const slice = variantIds.slice(i, i + CHUNK);
      const { data, error } = await supabaseAdmin()
        .from('bsale_stock_snapshot')
        .select('variant_id, qty')
        .in('variant_id', slice);
      if (error) {
        console.warn('[stock-snapshot] readSnapshot:', error.message);
        continue;
      }
      for (const r of (data ?? []) as { variant_id: number; qty: number }[]) {
        out.set(r.variant_id, r.qty);
      }
    }
  } catch (e) {
    console.warn('[stock-snapshot] readSnapshot error:', (e as Error).message);
  }
  return out;
}

/**
 * Refresh: para una lista de (variantId, productId), fetcha live stock
 * desde BSale (parallel chunked), upserta a Supabase. Devuelve stats.
 */
export interface RefreshStats {
  attempted: number;
  refreshed: number;
  failed: number;
  took_ms: number;
}

export async function refreshSnapshot(
  variants: { variantId: number; productId?: number }[],
): Promise<RefreshStats> {
  const start = Date.now();
  let refreshed = 0;
  let failed = 0;
  const CHUNK_PARALLEL = 12;

  // Acumular rows para batch upsert
  const rows: Array<{ variant_id: number; product_id: number | null; qty: number; updated_at: string }> = [];
  const now = new Date().toISOString();

  for (let i = 0; i < variants.length; i += CHUNK_PARALLEL) {
    const slice = variants.slice(i, i + CHUNK_PARALLEL);
    const results = await Promise.all(
      slice.map(v => fetchVariantStock(v.variantId).catch(() => null)),
    );
    for (let j = 0; j < slice.length; j++) {
      const v = slice[j];
      const r = results[j];
      if (r) {
        rows.push({ variant_id: v.variantId, product_id: v.productId ?? null, qty: r.raw, updated_at: now });
        refreshed++;
      } else {
        failed++;
      }
    }
  }

  // Batch upsert (Supabase limit ~1000 rows por insert)
  if (rows.length > 0) {
    const UPSERT_CHUNK = 500;
    for (let i = 0; i < rows.length; i += UPSERT_CHUNK) {
      const slice = rows.slice(i, i + UPSERT_CHUNK);
      const { error } = await supabaseAdmin()
        .from('bsale_stock_snapshot')
        .upsert(slice, { onConflict: 'variant_id' });
      if (error) {
        console.error('[stock-snapshot] upsert error:', error.message);
      }
    }
  }

  return {
    attempted: variants.length,
    refreshed,
    failed,
    took_ms: Date.now() - start,
  };
}

/**
 * Refresh por productId — usado por webhook BSale cuando hay cambios.
 * Necesita la lista de variantIds del producto (la sacamos del JSON local).
 */
export async function refreshSnapshotForVariants(variantIds: number[]): Promise<RefreshStats> {
  return refreshSnapshot(variantIds.map(vid => ({ variantId: vid })));
}
