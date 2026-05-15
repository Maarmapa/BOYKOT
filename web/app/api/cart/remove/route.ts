// Remove a single item from the current session's cart.
// POST /api/cart/remove  { variant_id: number }

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSessionId, withSessionHeader } from '@/lib/session';
import { ensureSessionCart, setItemQty } from '@/lib/cart';
import type { CartItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  variant_id: number;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (typeof body.variant_id !== 'number') {
    return NextResponse.json({ error: 'variant_id required' }, { status: 400 });
  }

  const { sid } = await getOrCreateSessionId();
  const cart = await ensureSessionCart(sid);

  const placeholder: Omit<CartItem, 'qty'> = {
    variant_id: body.variant_id,
    product_id: 0,
    unit_price_clp: 0,
    name: '',
  };
  const updated = await setItemQty(cart.id, body.variant_id, 0, placeholder);
  return withSessionHeader(NextResponse.json({ cart: updated, session_id: sid }), sid);
}
