// GET /api/bsale/dump-variants?productid=2262
//
// Devuelve TODAS las descriptions raw de un producto BSale, sin parseo.
// Sirve para diseñar parsers cuando un product mete múltiples sub-lineas
// (ej. Angelus Pintura Cuero tiene Standard/Pearl/Neon × 1oz/4oz todo junto).

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

interface BsaleVariant { id?: number; description?: string; code?: string }

async function call(url: string, token: string): Promise<{
  items?: BsaleVariant[];
  next?: string;
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

  const productId = req.nextUrl.searchParams.get('productid') || '2262';

  const all: Array<{ id: number; description: string; code: string }> = [];
  let next: string | null = `${BASE}/variants.json?productid=${productId}&limit=50&offset=0`;
  const start = Date.now();

  while (next && Date.now() - start < 55_000) {
    const data = await call(next, token);
    for (const v of data.items ?? []) {
      if (typeof v.id !== 'number') continue;
      all.push({
        id: v.id,
        description: v.description ?? '',
        code: v.code ?? '',
      });
    }
    next = data.next ?? null;
  }

  return NextResponse.json({
    product_id: Number(productId),
    total: all.length,
    took_ms: Date.now() - start,
    variants: all,
  }, { headers: { 'cache-control': 'no-store' } });
}
