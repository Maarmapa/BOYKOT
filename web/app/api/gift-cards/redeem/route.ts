// POST /api/gift-cards/redeem
// Body: { code, email }

import { NextRequest, NextResponse } from 'next/server';
import { redeemGiftCard } from '@/lib/gift-cards';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  code?: string;
  email?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.code || !body.email) {
    return NextResponse.json({ error: 'code_and_email_required' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  try {
    const result = await redeemGiftCard(body.code, body.email);
    if (!result.ok) {
      const msg: Record<string, string> = {
        not_found: 'Código no existe',
        already_redeemed: 'Ya canjeado',
        already_expired: 'Expirado',
        already_cancelled: 'Cancelado',
        expired: 'Expirado (más de 1 año)',
      };
      return NextResponse.json({
        ok: false,
        reason: result.reason,
        message: msg[result.reason ?? ''] || 'Código inválido',
      }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      amount_clp: result.amount_clp,
      message: `Se agregaron $${result.amount_clp?.toLocaleString('es-CL')} a tu Boykot Credits.`,
    });
  } catch (e) {
    return NextResponse.json({ error: 'redeem_failed', message: (e as Error).message }, { status: 500 });
  }
}
