// POST /api/gift-cards/create
// Body: { amount_clp, buyer_email, buyer_name?, recipient_email?, recipient_name?, message? }
//
// V1 stub: crea la gift card pero NO procesa pago — eso se conecta al checkout MP cuando integremos.
// V2: redirigir a /checkout con item especial "gift_card_{amount}" + payment flow normal.

import { NextRequest, NextResponse } from 'next/server';
import { createGiftCard } from '@/lib/gift-cards';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  amount_clp?: number;
  buyer_email?: string;
  buyer_name?: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const amount = Math.floor(body.amount_clp || 0);
  if (amount < 5000) {
    return NextResponse.json({ error: 'amount_below_minimum', min_clp: 5000 }, { status: 400 });
  }
  if (!body.buyer_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.buyer_email)) {
    return NextResponse.json({ error: 'buyer_email_required' }, { status: 400 });
  }

  try {
    const gc = await createGiftCard({
      amount_clp: amount,
      buyer_email: body.buyer_email,
      buyer_name: body.buyer_name,
      recipient_email: body.recipient_email,
      recipient_name: body.recipient_name,
      message: body.message,
    });

    return NextResponse.json({
      ok: true,
      code: gc.code,
      amount_clp: gc.amount_clp,
      expires_at: gc.expires_at,
      next_step: 'pay_via_checkout',
      // TODO V2: devolver payment_url de MP
    });
  } catch (e) {
    return NextResponse.json({ error: 'create_failed', message: (e as Error).message }, { status: 500 });
  }
}
