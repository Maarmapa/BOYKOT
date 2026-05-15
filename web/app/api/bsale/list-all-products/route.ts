// GET /api/bsale/list-all-products
//
// Pagina TODOS los productos en BSale (solo id + name, sin variant counts
// para que la corrida quepa en 55s). Output ordenado por nombre.
// Sirve para encontrar manualmente brands que el discover-brands no agarró
// porque BSale usa nombres distintos a los nuestros.
//
// Filtro opcional: ?q=Angelus solo trae los que contienen "Angelus" (lowercase).

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

interface BsaleProduct { id?: number; name?: string }

async function call(url: string, token: string): Promise<{
  items?: BsaleProduct[];
  next?: string;
  count?: number;
}> {
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

  const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();

  const all: Array<{ id: number; name: string }> = [];
  let next: string | null = `${BASE}/products.json?limit=50&offset=0`;
  let pages = 0;
  const start = Date.now();

  while (next && Date.now() - start < 55_000) {
    const data = await call(next, token);
    for (const p of data.items ?? []) {
      if (typeof p.id !== 'number' || !p.name) continue;
      if (q && !p.name.toLowerCase().includes(q)) continue;
      all.push({ id: p.id, name: p.name });
    }
    pages++;
    next = data.next ?? null;
  }

  all.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({
    query: q || '(all)',
    pages_fetched: pages,
    total_returned: all.length,
    took_ms: Date.now() - start,
    timeout: !!next, // true si quedó paginación pendiente
    items: all,
  }, { headers: { 'cache-control': 'no-store' } });
}
