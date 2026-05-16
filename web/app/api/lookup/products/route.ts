// GET /api/lookup/products?q=...&with_stock=true
//
// PUBLIC product lookup. Sin auth. Consumido por:
//   - Hermes bot (interno)
//   - x402 agent endpoint
//   - ChatWidget cliente
//   - Cualquier integración externa (Meta Catalog feed, etc)
//
// Rate-limit: ninguno por ahora. Si abusan, agregar Vercel Edge Middleware.

import { NextRequest, NextResponse } from 'next/server';
import { findProducts, findWithStock } from '@/lib/lookup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Permitimos CORS para agentes externos
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const limit = Math.min(20, parseInt(req.nextUrl.searchParams.get('limit') || '8', 10));
  const withStock = req.nextUrl.searchParams.get('with_stock') === 'true';

  if (q.length < 2) {
    return NextResponse.json(
      { results: [], total: 0, query: q },
      { headers: CORS },
    );
  }

  const results = withStock
    ? await findWithStock(q, limit)
    : await findProducts(q, limit);

  return NextResponse.json(
    { results, total: results.length, query: q, with_stock: withStock },
    { headers: CORS },
  );
}
