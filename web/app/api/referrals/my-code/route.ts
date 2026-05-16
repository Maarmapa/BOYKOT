// GET /api/referrals/my-code
// Devuelve mi codigo de referral (o lo genera si es la primera vez).
// Requiere user logueado.

import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { getOrCreateReferral } from '@/lib/referrals';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export async function GET() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !data.user.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const meta = (data.user.user_metadata || {}) as { nombre?: string };

  const referral = await getOrCreateReferral(data.user.email, meta.nombre);
  return NextResponse.json({
    code: referral.code,
    share_url: `${SITE}/?ref=${referral.code}`,
    total_uses: referral.total_uses,
    total_earned_clp: referral.total_earned_clp,
  });
}
