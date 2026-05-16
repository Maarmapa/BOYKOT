// GET /api/admin/mp/setup
//
// Configura el webhook MP automáticamente usando MP_ACCESS_TOKEN.
// Hace 3 cosas:
//   1. Verifica que el token funciona (llama /users/me)
//   2. Configura webhook URL + topic 'payment'
//   3. Devuelve secret y datos de la cuenta
//
// El user copia el secret y lo pega como MP_WEBHOOK_SECRET en Vercel.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MP_API = 'https://api.mercadopago.com';

interface MpUser {
  id?: number;
  nickname?: string;
  email?: string;
  site_id?: string;
  country_id?: string;
  status?: { site_status?: string; user_type?: string };
}

interface MpWebhook {
  id?: string;
  url?: string;
  status?: string;
  topics?: string[];
  secret?: string;
}

export async function GET() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({
      ok: false,
      step: 'env',
      error: 'MP_ACCESS_TOKEN no está set en Vercel. Pegalo en Settings → Environment Variables y redeploy.',
    }, { status: 500 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot-nu.vercel.app';
  const webhookUrl = `${site}/api/payments/mp/webhook`;

  // ───── Paso 1: validar token con /users/me ─────
  let me: MpUser;
  try {
    const res = await fetch(`${MP_API}/users/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return NextResponse.json({
        ok: false,
        step: 'validate-token',
        error: `MP /users/me ${res.status}: ${body.slice(0, 200)}`,
        hint: 'Token inválido o expirado. Revisá el panel MP → Credenciales y copiá de nuevo.',
      }, { status: 401 });
    }
    me = await res.json() as MpUser;
  } catch (e) {
    return NextResponse.json({ ok: false, step: 'validate-token', error: (e as Error).message }, { status: 500 });
  }

  const isTest = me.email?.includes('test_user') || me.nickname?.startsWith('TEST') || me.status?.user_type === 'test_user';

  // ───── Paso 2: chequear webhooks existentes ─────
  let existing: MpWebhook | null = null;
  try {
    const res = await fetch(`${MP_API}/v1/webhooks`, {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (res.ok) {
      const list = await res.json() as { results?: MpWebhook[] } | MpWebhook[];
      const arr = Array.isArray(list) ? list : (list.results ?? []);
      existing = arr.find(w => w.url === webhookUrl) ?? null;
    }
  } catch { /* sigue */ }

  // ───── Paso 3: reportar webhook ─────
  // MP NO expone POST /v1/webhooks para todas las cuentas (es un endpoint
  // legacy que solo funciona en algunas integraciones). Lo más confiable es
  // configurarlo vía panel y verificar acá si ya existe.
  return NextResponse.json({
    ok: true,
    account: {
      id: me.id,
      nickname: me.nickname,
      email: me.email,
      country: me.country_id || me.site_id,
      type: isTest ? '⚠️ TEST (modo prueba — perfecto para empezar)' : '🟢 PRODUCCIÓN (cobra plata real)',
      user_type: me.status?.user_type,
    },
    webhook_url_to_configure: webhookUrl,
    existing_webhook: existing,
    manual_steps: [
      '1. Ir al panel MP → https://www.mercadopago.cl/developers/panel/app',
      '2. Click en tu app → Sidebar "Webhooks" o "Notificaciones webhooks"',
      '3. Click "Configurar notificaciones" en la pestaña que corresponda (Pruebas o Producción)',
      `4. URL: ${webhookUrl}`,
      '5. Marcar evento: ☑ "Pagos" (payment)',
      '6. Click "Guardar"',
      '7. Aparece la "Clave secreta" — copiala',
      '8. Pegala en Vercel como env var MP_WEBHOOK_SECRET',
      '9. Vercel auto-redeployea',
      '10. Volver a llamar este endpoint para verificar que aparece en existing_webhook',
    ],
  });
}
