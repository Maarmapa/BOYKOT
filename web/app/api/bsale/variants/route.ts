// GET /api/bsale/variants?productid=2167 — lista todas las variants de un
// producto BSale paginadas. Devuelve {variantId, description, code (sku),
// barCode} por cada variante.
//
// Sirve para mapear color-codes (B00, BG13) a variantIds reales en BSale,
// que es lo que necesitamos para fetchVariantStock y fetchVariantPrice.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

async function call(url: string, token: string): Promise<{
  items?: Array<{ id?: number; description?: string; code?: string; barCode?: string }>;
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

  const productId = req.nextUrl.searchParams.get('productid') || '2167';

  const all: Array<{ id: number; description: string; code: string; barCode: string }> = [];
  let next: string | null = `${BASE}/variants.json?productid=${productId}&limit=50&offset=0`;
  let pages = 0;
  const start = Date.now();

  while (next && Date.now() - start < 55_000) {
    const data = await call(next, token);
    for (const v of data.items ?? []) {
      if (typeof v.id !== 'number') continue;
      all.push({
        id: v.id,
        description: v.description ?? '',
        code: v.code ?? '',
        barCode: v.barCode ?? '',
      });
    }
    pages++;
    next = data.next ?? null;
  }

  return NextResponse.json(
    {
      product_id: Number(productId),
      total_variants: all.length,
      pages_fetched: pages,
      took_ms: Date.now() - start,
      variants_sample: all.slice(0, 50),
      variants: all,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
