// Cart read endpoint — returns the current session's active cart.
//   GET /api/cart  → { cart: Cart | null }

import { NextResponse } from 'next/server';
import { readSessionId, withSessionHeader } from '@/lib/session';
import { getActiveCartForSession } from '@/lib/cart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sid = await readSessionId();
  if (!sid) return NextResponse.json({ cart: null, session_id: null });
  const cart = await getActiveCartForSession(sid);
  return withSessionHeader(NextResponse.json({ cart, session_id: sid }), sid);
}
