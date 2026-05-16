// Supabase Full-Text Search wrapper. Reemplaza el naive string-match en
// /api/search por websearch_to_tsquery contra products_fts.search_doc.
//
// Fallback: si la tabla products_fts está vacía o falla, devuelve [].
// El call site puede caer al string-match anterior si quiere.

import 'server-only';
import { supabaseAdmin } from './supabase';

export interface FtsHit {
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  category: string | null;
  price_clp: number | null;
  image: string | null;
  availability: string | null;
  rank: number;
}

export async function ftsSearch(q: string, limit = 20): Promise<FtsHit[]> {
  if (!q || q.trim().length < 2) return [];
  // Sanitizar: solo word chars + espacios. Postgres websearch_to_tsquery
  // ya parsea quotas/operadores pero limitamos por seguridad.
  const cleaned = q.replace(/[^\p{L}\p{N}\s\-]/gu, ' ').trim();
  if (!cleaned) return [];

  // RPC personalizada o usar select directo. Para mantenerlo simple uso
  // raw SQL via from() con order ts_rank_cd descendente.
  const { data, error } = await supabaseAdmin().rpc('search_products_fts', {
    query: cleaned,
    max_results: limit,
  });
  if (error) {
    console.warn('[fts] RPC failed, fallback empty:', error.message);
    return [];
  }
  return (data ?? []) as FtsHit[];
}
