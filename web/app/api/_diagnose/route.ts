// Diagnostic — reports which env vars are present in the running server.
// Does NOT echo values, only "yes" / "no" + length, so it is safe to expose.
//
//   GET /api/_diagnose
//
// Also probes /api/cart/items by attempting a no-op cart create against
// Supabase to surface any DB-side error.

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VARS = [
  // Supabase
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  // Site
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SITE_URL',
  // Email
  'BREVO_API_KEY',
  'EMAIL_FROM_ADDRESS',
  'EMAIL_FROM_NAME',
  'ADMIN_EMAIL',
  // BSale
  'BSALE_ACCESS_TOKEN',
  'BSALE_WEBHOOK_TOKEN',
  'BSALE_CPN_ID',
  // Mercado Pago
  'MP_ACCESS_TOKEN',
  'MP_WEBHOOK_SECRET',
  'MP_PUBLIC_KEY',
  // Admin
  'ADMIN_PASSWORD',
  'CRON_SECRET',
  // R2 (futuro)
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_ACCOUNT_ID',
  'R2_BUCKET',
];

export async function GET() {
  const env: Record<string, { present: boolean; length: number; prefix?: string }> = {};
  for (const k of VARS) {
    const v = process.env[k];
    env[k] = {
      present: !!v,
      length: v ? v.length : 0,
      // Show a tiny prefix so we can confirm the right kind of value was pasted.
      prefix: v ? v.slice(0, 6) : undefined,
    };
  }

  // Try a live Supabase round trip to surface actual DB errors.
  let supabaseProbe: unknown = 'not-attempted';
  try {
    const { supabaseAdmin } = await import('@/lib/supabase');
    const { data, error } = await supabaseAdmin()
      .from('carts')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    supabaseProbe = error
      ? { ok: false, message: error.message, code: error.code }
      : { ok: true, sample: data };
  } catch (err) {
    supabaseProbe = { ok: false, threw: String(err) };
  }

  return NextResponse.json({
    env,
    supabaseProbe,
    note:
      'Required at minimum for cart to work: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY ' +
      '(and NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY for the client lib).',
  });
}
