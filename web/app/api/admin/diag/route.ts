// GET /api/admin/diag — diagnóstico de env vars en runtime.
// Sirve para confirmar qué config está usando el deploy actual.
// NO devuelve VALORES de secrets, solo confirma si están set.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isSet(name: string): boolean {
  return !!process.env[name];
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return NextResponse.json({
    site_url_in_use: siteUrl ?? '(NOT SET — falls back to https://boykot.cl)',
    site_url_is_correct: siteUrl === 'https://boykot-nu.vercel.app' || siteUrl?.includes('vercel.app'),
    secrets_status: {
      MP_ACCESS_TOKEN: isSet('MP_ACCESS_TOKEN'),
      MP_WEBHOOK_SECRET: isSet('MP_WEBHOOK_SECRET'),
      ADMIN_PASSWORD: isSet('ADMIN_PASSWORD'),
      BOYKOT_WHATSAPP_NUMBER: isSet('BOYKOT_WHATSAPP_NUMBER'),
      BREVO_API_KEY: isSet('BREVO_API_KEY'),
      EMAIL_FROM_ADDRESS: isSet('EMAIL_FROM_ADDRESS'),
      ADMIN_EMAIL: isSet('ADMIN_EMAIL'),
      BSALE_ACCESS_TOKEN: isSet('BSALE_ACCESS_TOKEN'),
      SUPABASE_SERVICE_ROLE_KEY: isSet('SUPABASE_SERVICE_ROLE_KEY'),
      NEXT_PUBLIC_SUPABASE_URL: isSet('NEXT_PUBLIC_SUPABASE_URL'),
    },
    next_steps: siteUrl?.includes('vercel.app')
      ? ['✅ Site URL OK', 'Hace pedido y debería funcionar webhook auto']
      : ['❌ Pegar NEXT_PUBLIC_SITE_URL=https://boykot-nu.vercel.app en Vercel envs', 'Aplicar a Production', 'Redeploy'],
    runtime_info: {
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV,
      vercel_url: process.env.VERCEL_URL,
    },
  });
}
