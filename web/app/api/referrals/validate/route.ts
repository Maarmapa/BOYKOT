// POST /api/referrals/validate
// Body: { code, email }
// Returns { valid, discount_clp, message }

import { NextRequest, NextResponse } from 'next/server';
import { validateReferralCode } from '@/lib/referrals';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REFERRED_BONUS_PERCENT = 0.10; // 10% off para el referido
const REFERRER_BONUS_PERCENT = 0.10; // 10% del total como credits al referrer

interface Body {
  code?: string;
  email?: string;
  subtotal_clp?: number;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.code || !body.email) {
    return NextResponse.json({ valid: false, reason: 'code_and_email_required' }, { status: 400 });
  }

  const result = await validateReferralCode(body.code, body.email);
  if (!result.valid) {
    const msg: Record<string, string> = {
      empty: 'Código vacío',
      not_found: 'Código no existe',
      self_referral: 'No te podés referir a vos mismo',
      already_used: 'Ya usaste este código antes',
    };
    return NextResponse.json({
      valid: false,
      reason: result.reason,
      message: msg[result.reason ?? ''] || 'Código inválido',
    });
  }

  const subtotal = Math.max(0, Math.floor(body.subtotal_clp || 0));
  const discountClp = Math.round(subtotal * REFERRED_BONUS_PERCENT);
  const referrerBonus = Math.round(subtotal * REFERRER_BONUS_PERCENT);

  return NextResponse.json({
    valid: true,
    code: result.referral?.code,
    referrer_email: result.referral?.referrer_email,
    discount_clp: discountClp,
    referrer_bonus_clp: referrerBonus,
    message: `Bien! ${(REFERRED_BONUS_PERCENT * 100).toFixed(0)}% off en tu pedido (~$${discountClp.toLocaleString('es-CL')})`,
  });
}
