// GET /api/bsale/test-single-variant?vid=46302
//
// Llama directamente a fetchVariantStock(vid) y devuelve el resultado raw.
// Sirve para confirmar si BSale ?variantid= filter funciona.

import { NextRequest, NextResponse } from 'next/server';
import { fetchVariantStock } from '@/lib/bsale-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const vid = Number(req.nextUrl.searchParams.get('vid') || '46302');
  const start = Date.now();
  const result = await fetchVariantStock(vid).catch(e => ({ error: (e as Error).message }));
  return NextResponse.json({
    variantId: vid,
    took_ms: Date.now() - start,
    result,
  }, { headers: { 'cache-control': 'no-store' } });
}
