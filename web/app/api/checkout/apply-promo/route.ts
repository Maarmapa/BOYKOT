// POST /api/checkout/apply-promo
// Body: { code, subtotal_clp, email? }
// Devuelve { valid, discount_clp, ... } sin aplicar — el checkout lo guarda
// despues con applyPromoCode cuando se confirma el pedido.

import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo-codes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  code?: string;
  subtotal_clp?: number;
  email?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.code) {
    return NextResponse.json({ valid: false, reason: 'code_required' }, { status: 400 });
  }
  const subtotal = Math.max(0, Math.floor(body.subtotal_clp || 0));

  const result = await validatePromoCode(body.code, subtotal, body.email);
  if (!result.valid) {
    return NextResponse.json({
      valid: false,
      reason: result.reason,
      message: errorMessage(result.reason),
    });
  }

  return NextResponse.json({
    valid: true,
    code: result.promo?.code,
    description: result.promo?.description,
    discount_type: result.promo?.discount_type,
    discount_value: result.promo?.discount_value,
    discount_clp: result.discount_clp,
  });
}

function errorMessage(reason?: string): string {
  switch (reason) {
    case 'not_found': return 'Código no válido';
    case 'expired': return 'Código expirado';
    case 'not_yet_valid': return 'Código no está vigente aún';
    case 'max_uses_reached': return 'Código agotado';
    case 'subtotal_below_minimum': return 'No alcanzás el monto mínimo';
    case 'customer_max_uses_reached': return 'Ya usaste este código antes';
    default: return 'Código inválido';
  }
}
