// POST /api/cart/reorder
// Body: { short_id }
//
// Toma los items de un pedido pasado y los agrega al cart actual del session.
// Util para "Comprar de nuevo" desde el tracking de un pedido viejo.

import { NextRequest, NextResponse } from 'next/server';
import { getOrderByShortId } from '@/lib/pending-orders';
import { ensureSessionCart, addToCart } from '@/lib/cart';
import { getOrCreateSessionId, withSessionHeader } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  short_id?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.short_id) {
    return NextResponse.json({ error: 'short_id_required' }, { status: 400 });
  }

  const order = await getOrderByShortId(body.short_id);
  if (!order) {
    return NextResponse.json({ error: 'order_not_found' }, { status: 404 });
  }

  const { sid } = await getOrCreateSessionId();
  const cart = await ensureSessionCart(sid);

  let added = 0;
  for (const item of order.items || []) {
    try {
      await addToCart(cart.id, {
        variant_id: item.variant_id,
        product_id: 0,
        qty: item.qty,
        unit_price_clp: item.unit_price_clp,
        name: item.name,
        color_code: item.color_code,
      });
      added++;
    } catch {
      // Skip on error
    }
  }

  return withSessionHeader(
    NextResponse.json({ ok: true, added, total: order.items.length }),
    sid,
  );
}
