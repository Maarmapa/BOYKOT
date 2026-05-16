// GET  /api/cart/share — devuelve un share link de tu cart actual
// GET  /api/cart/share?id={cart_id} — devuelve items del cart compartido (publico)
//
// Para que un cliente B2B pueda mandar el carrito a su comprador institucional
// sin necesitar login.

import { NextRequest, NextResponse } from 'next/server';
import { getCart, getActiveCartForSession } from '@/lib/cart';
import { getOrCreateSessionId } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export async function GET(req: NextRequest) {
  const sharedId = req.nextUrl.searchParams.get('id');

  // Case 1: alguien abrio un share link existente
  if (sharedId) {
    const cart = await getCart(sharedId);
    if (!cart) {
      return NextResponse.json({ error: 'cart_not_found' }, { status: 404 });
    }
    return NextResponse.json({
      shared: true,
      cart_id: cart.id,
      items: cart.items,
      subtotal_clp: cart.subtotal_clp,
      total_clp: cart.total_clp,
      item_count: cart.items.length,
    });
  }

  // Case 2: cliente quiere share link de su propio cart
  const { sid } = await getOrCreateSessionId();
  const cart = await getActiveCartForSession(sid);
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'cart_empty' }, { status: 400 });
  }

  return NextResponse.json({
    cart_id: cart.id,
    share_url: `${SITE}/carrito/compartido/${cart.id}`,
    items_count: cart.items.length,
    total_clp: cart.total_clp,
  });
}
