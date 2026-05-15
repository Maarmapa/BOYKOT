// GET /api/bsale/dump-stock?productid=3180
//
// Dump bruto de /stocks.json?productid=X — primeras 50 rows. Sirve para
// verificar si BSale filtra correctamente por productid, ya que sospechamos
// que para algunos productos devuelve variants de otros producto.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = 'https://api.bsale.io/v1';

export async function GET(req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'no token' }, { status: 500 });

  const productId = req.nextUrl.searchParams.get('productid');
  const variantId = req.nextUrl.searchParams.get('variantid');
  const officeId = req.nextUrl.searchParams.get('officeid');
  const expand = req.nextUrl.searchParams.get('expand');

  const params = new URLSearchParams({ limit: '20' });
  if (productId) params.set('productid', productId);
  if (variantId) params.set('variantid', variantId);
  if (officeId) params.set('officeid', officeId);
  if (expand) params.set('expand', `[${expand}]`);

  const url = `${BASE}/stocks.json?${params}`;
  const res = await fetch(url, {
    headers: { access_token: token, accept: 'application/json' },
    cache: 'no-store',
  });
  const body = await res.json();

  // Extract sample: variant.id, variant.product.id
  type StockItem = { id?: number; quantity?: number; quantityAvailable?: number; variant?: { id?: number; product?: { id?: number }; description?: string; code?: string } };
  const sample = ((body.items ?? []) as StockItem[]).map(item => ({
    stock_id: item.id,
    variant_id: item.variant?.id,
    variant_description: item.variant?.description,
    variant_code: item.variant?.code,
    variant_product_id: item.variant?.product?.id,
    quantity: item.quantity,
    quantityAvailable: item.quantityAvailable,
  }));

  return NextResponse.json({
    url,
    raw_count: body.count,
    sample,
    next: body.next ?? null,
  }, { headers: { 'cache-control': 'no-store' } });
}
