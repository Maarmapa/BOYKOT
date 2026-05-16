// GET /api/credits/balance?email=...
// Devuelve balance del cliente para mostrar en checkout.
// No expone otros datos del cliente, solo balance + tier.

import { NextRequest, NextResponse } from 'next/server';
import { getCreditsAccount } from '@/lib/credits';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ balance_clp: 0 });
  }
  try {
    const account = await getCreditsAccount(email);
    if (!account) return NextResponse.json({ balance_clp: 0 });
    return NextResponse.json({
      balance_clp: account.balance_clp,
      tier: account.tier,
    });
  } catch {
    return NextResponse.json({ balance_clp: 0 });
  }
}
