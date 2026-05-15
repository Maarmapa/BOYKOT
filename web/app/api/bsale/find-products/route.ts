// GET /api/bsale/find-products?q=Sketch — busca productos por nombre.
// Útil para encontrar el productId real de cada línea Copic, Angelus, etc.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

interface BsaleProduct { id?: number; name?: string; classification?: number }

async function call(url: string, token: string): Promise<{ items?: BsaleProduct[]; next?: string; count?: number }> {
  const res = await fetch(url, {
    headers: { access_token: token, accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BSale ${res.status} ${url}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'BSALE_ACCESS_TOKEN missing' }, { status: 500 });

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const wholeList = req.nextUrl.searchParams.get('list') === '1';

  // BSale soporta filtros como ?name=Sketch (búsqueda parcial case-insensitive)
  const url = wholeList
    ? `${BASE}/products.json?limit=50&offset=0`
    : `${BASE}/products.json?name=${encodeURIComponent(q)}&limit=50&offset=0`;

  const data = await call(url, token);
  const items = data.items ?? [];

  // Para cada uno, pedimos cuántas variants tiene
  const enriched = await Promise.all(
    items.slice(0, 25).map(async (p) => {
      let variantCount = 0;
      if (typeof p.id === 'number') {
        try {
          const v = await call(`${BASE}/variants.json?productid=${p.id}&limit=1`, token);
          variantCount = v.count ?? 0;
        } catch { /* keep 0 */ }
      }
      return {
        id: p.id,
        name: p.name,
        classification: p.classification,
        variant_count: variantCount,
      };
    }),
  );

  return NextResponse.json({
    query: q || '(full list)',
    total_matched: data.count ?? items.length,
    returned: enriched.length,
    items: enriched,
  }, { headers: { 'cache-control': 'no-store' } });
}
