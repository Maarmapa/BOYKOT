// Self-contained cart smoke test. Runs the full flow against Supabase
// WITHOUT depending on the browser's cookie at all.
//
//   GET /api/cart/_test
//
// 1. Generates a fresh fake session_id
// 2. Creates a cart for it
// 3. Reads it back
// 4. Adds item A (variant 11111, qty 1)
// 5. Reads it back — should have 1 item
// 6. Adds item B (variant 22222, qty 1)
// 7. Reads it back — should have 2 items
// 8. Updates item A to qty 3
// 9. Reads it back — should have 2 items, A.qty=3
// 10. Cleans up: deletes the cart
//
// Returns a step-by-step trace + final pass/fail.
//
// If this endpoint returns ok=true, the server side is fine and the bug is
// in cookie handling. If it returns ok=false, we see which step failed.

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import {
  createCart, getCart, setItemQty,
} from '@/lib/cart';
import type { CartItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ITEM_A: Omit<CartItem, 'qty'> = {
  variant_id: 11111,
  product_id: 9999,
  unit_price_clp: 4300,
  name: 'Test A',
  color_code: 'TEST-A',
};
const ITEM_B: Omit<CartItem, 'qty'> = {
  variant_id: 22222,
  product_id: 9999,
  unit_price_clp: 4300,
  name: 'Test B',
  color_code: 'TEST-B',
};

interface TraceStep {
  step: string;
  ok: boolean;
  detail?: unknown;
  itemCount?: number;
  items?: Array<{ variant_id: number; qty: number }>;
}

export async function GET() {
  const trace: TraceStep[] = [];
  const sid = `_test-${crypto.randomBytes(6).toString('hex')}`;
  let cartId: string | null = null;
  let pass = true;

  function record(step: string, ok: boolean, detail?: unknown, items?: CartItem[]) {
    trace.push({
      step,
      ok,
      detail,
      itemCount: items?.length,
      items: items?.map(i => ({ variant_id: i.variant_id, qty: i.qty })),
    });
    if (!ok) pass = false;
  }

  try {
    // 1. Create cart
    const cart = await createCart({ sessionId: sid });
    cartId = cart.id;
    record('createCart', !!cart.id, { id: cart.id, session_id: cart.session_id });

    // 2. Read back
    const initial = await getCart(cart.id);
    record('initial read', initial?.items?.length === 0, undefined, initial?.items);

    // 3. Add A qty 1
    const a1 = await setItemQty(cart.id, ITEM_A.variant_id, 1, ITEM_A);
    record('add A qty=1', a1.items.length === 1, undefined, a1.items);

    // 4. Read back A
    const a1read = await getCart(cart.id);
    record('read after A', a1read?.items?.length === 1, undefined, a1read?.items);

    // 5. Add B qty 1
    const b1 = await setItemQty(cart.id, ITEM_B.variant_id, 1, ITEM_B);
    record('add B qty=1', b1.items.length === 2, undefined, b1.items);

    // 6. Read back A+B
    const b1read = await getCart(cart.id);
    record('read after B', b1read?.items?.length === 2, undefined, b1read?.items);

    // 7. Update A to qty 3
    const a3 = await setItemQty(cart.id, ITEM_A.variant_id, 3, ITEM_A);
    const a3hasA = a3.items.find(i => i.variant_id === ITEM_A.variant_id)?.qty === 3;
    const a3hasB = a3.items.find(i => i.variant_id === ITEM_B.variant_id)?.qty === 1;
    record('update A qty=3', a3hasA && a3hasB && a3.items.length === 2, undefined, a3.items);
  } catch (err) {
    record('FATAL', false, String(err));
  } finally {
    // Clean up — don't leave test carts lying around
    if (cartId) {
      try { await supabaseAdmin().from('carts').delete().eq('id', cartId); } catch {}
    }
  }

  return NextResponse.json({ ok: pass, session_id: sid, trace }, { status: pass ? 200 : 500 });
}
