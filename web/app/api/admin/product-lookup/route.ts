// GET /api/admin/product-lookup?q=...
// Admin DM helper. Igual que /api/lookup/products pero con auth admin (cookie).

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { findWithStock } from '@/lib/lookup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const q = req.nextUrl.searchParams.get('q') || '';
  const limit = Math.min(20, parseInt(req.nextUrl.searchParams.get('limit') || '12', 10));
  if (q.length < 2) return NextResponse.json({ results: [], total: 0 });

  const results = await findWithStock(q, limit);
  // Adaptar al shape que el cliente /admin/buscar espera (legacy keys)
  const legacy = results.map(p => ({
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    price: p.price,
    image: p.image,
    availability_static: p.availability,
    stock_live: p.stock?.bsale_raw ?? null,
    available_live: p.stock?.available ?? null,
    url: p.url,
    variantId: p.variantId,
  }));
  return NextResponse.json({ results: legacy, total: legacy.length, query: q });
}
