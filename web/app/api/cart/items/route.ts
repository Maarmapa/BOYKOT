// Cart mutation endpoint — set absolute qty for one variant.
//   POST /api/cart/items
//   body: { variant_id, qty, product_id, unit_price_clp, name, image_url?, color_code? }
//   → { cart: Cart }
//
// qty = 0 removes the line. Anonymous visitors get a session cart auto-created.

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSessionId } from '@/lib/session';
import { ensureSessionCart, setItemQty } from '@/lib/cart';
import type { CartItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  variant_id: number;
  qty: number;
  product_id: number;
  unit_price_clp: number;
  name: string;
  image_url?: string;
  color_code?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (
    typeof body.variant_id !== 'number' ||
    typeof body.product_id !== 'number' ||
    typeof body.qty !== 'number' ||
    typeof body.unit_price_clp !== 'number' ||
    typeof body.name !== 'string'
  ) {
    return NextResponse.json({ error: 'missing or malformed fields' }, { status: 400 });
  }

  const sid = await getOrCreateSessionId();
  const cart = await ensureSessionCart(sid);

  const template: Omit<CartItem, 'qty'> = {
    variant_id: body.variant_id,
    product_id: body.product_id,
    unit_price_clp: body.unit_price_clp,
    name: body.name,
    image_url: body.image_url,
    color_code: body.color_code,
  };

  const updated = await setItemQty(cart.id, body.variant_id, body.qty, template);
  return NextResponse.json({ cart: updated });
}
