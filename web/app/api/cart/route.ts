// Cart read endpoint — returns the current session's active cart.
//   GET /api/cart  → { cart: Cart | null }

import { NextResponse } from 'next/server';
import { readSessionId } from '@/lib/session';
import { getActiveCartForSession } from '@/lib/cart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const sid = await readSessionId();
  if (!sid) return NextResponse.json({ cart: null });
  const cart = await getActiveCartForSession(sid);
  return NextResponse.json({ cart });
}
