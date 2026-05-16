// Mercado Pago Chile — Checkout Pro integration.
//
// Flow:
//   1. createPreference(order) → MP API → { preference_id, init_point (URL) }
//   2. Cliente abre init_point → paga con Webpay/Apple Pay/Google Pay/Khipu/...
//   3. MP llama nuestro webhook → fetchPayment(payment_id) → update orden
//
// Docs: https://www.mercadopago.cl/developers/es/docs/checkout-pro
//
// Env vars:
//   MP_ACCESS_TOKEN — token de producción (Settings → Credenciales → Producción)
//   MP_WEBHOOK_SECRET — secret de webhook (Settings → Notificaciones webhooks)
//   NEXT_PUBLIC_SITE_URL — para callbacks (back_urls)

import 'server-only';

const MP_API = 'https://api.mercadopago.com';

function token(): string {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error('MP_ACCESS_TOKEN missing');
  return t;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
}

export interface CreatePreferenceInput {
  short_id: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number; // CLP, integer
    description?: string;
    picture_url?: string;
  }>;
  payer: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: string;
}

export interface PreferenceResult {
  preference_id: string;
  init_point: string;       // URL producción
  sandbox_init_point: string; // URL sandbox (tests)
}

/**
 * Crea una "preference" en MP para una pre-order. Devuelve URL de pago.
 * El short_id se guarda como external_reference para wireup con webhook.
 */
export async function createPreference(input: CreatePreferenceInput): Promise<PreferenceResult> {
  const site = siteUrl();
  const body = {
    items: input.items.map(i => ({
      title: i.title.slice(0, 250),
      quantity: i.quantity,
      unit_price: i.unit_price,
      currency_id: 'CLP',
      description: i.description?.slice(0, 250),
      picture_url: i.picture_url,
    })),
    payer: {
      name: input.payer.name.split(' ')[0]?.slice(0, 50) || 'Cliente',
      surname: input.payer.name.split(' ').slice(1).join(' ').slice(0, 50) || '',
      email: input.payer.email,
      phone: input.payer.phone ? {
        area_code: '',
        number: input.payer.phone.replace(/[^0-9]/g, '').slice(0, 20),
      } : undefined,
    },
    external_reference: input.short_id,
    statement_descriptor: 'BOYKOT',
    back_urls: {
      success: `${site}/pago/exito?order=${input.short_id}`,
      failure: `${site}/pago/error?order=${input.short_id}`,
      pending: `${site}/pago/pendiente?order=${input.short_id}`,
    },
    auto_return: 'approved' as const,
    notification_url: `${site}/api/payments/mp/webhook`,
    metadata: {
      short_id: input.short_id,
      notes: input.notes ?? '',
    },
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${token()}`,
      'content-type': 'application/json',
      'X-Idempotency-Key': `${input.short_id}-${Date.now()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`MP createPreference ${res.status}: ${errText.slice(0, 300)}`);
  }
  const data = await res.json() as PreferenceResult;
  return data;
}

export interface MpPayment {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  payment_method_id: string;
  payment_type_id: string;
  date_approved: string | null;
  date_created: string;
  payer?: { email?: string; first_name?: string; last_name?: string };
}

export async function fetchPayment(paymentId: string | number): Promise<MpPayment> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { 'authorization': `Bearer ${token()}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`MP fetchPayment ${res.status}: ${errText.slice(0, 300)}`);
  }
  return res.json() as Promise<MpPayment>;
}

/**
 * Verifica la firma del webhook MP. MP firma con HMAC SHA256 sobre el
 * payload usando MP_WEBHOOK_SECRET. Headers:
 *   x-signature: "ts=...,v1=<hmac>"
 *   x-request-id: <uuid>
 *
 * El manifest del signature es: id={data.id};request-id={x-request-id};ts={ts};
 */
export async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
  dataId: string,
): Promise<boolean> {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[mp] MP_WEBHOOK_SECRET missing — skipping signature check');
    return true; // dev mode, no secret set yet
  }
  const sigHeader = headers.get('x-signature') || '';
  const requestId = headers.get('x-request-id') || '';
  if (!sigHeader || !requestId) return false;

  const parts = Object.fromEntries(
    sigHeader.split(',').map(s => s.trim().split('=').map(x => x.trim())),
  ) as { ts?: string; v1?: string };
  if (!parts.ts || !parts.v1) return false;

  const { createHmac, timingSafeEqual } = await import('node:crypto');

  // MP probó varios formatos de manifest según versión del webhook.
  // Probamos en orden los más comunes:
  //   1. id:{data.id};request-id:{x-request-id};ts:{ts};
  //   2. id:{data.id_lower};request-id:{x-request-id};ts:{ts};
  //   3. sin trailing ; (algunas versiones antiguas)
  //   4. solo data.id + ts (sin request-id)
  const candidates = [
    `id:${dataId};request-id:${requestId};ts:${parts.ts};`,
    `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`,
    `id:${dataId};request-id:${requestId};ts:${parts.ts}`,
    `id:${dataId};ts:${parts.ts};`,
  ];

  for (const manifest of candidates) {
    const computed = createHmac('sha256', secret).update(manifest).digest('hex');
    try {
      if (timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(parts.v1, 'hex'))) {
        console.log('[mp-sig] OK con manifest variant:', manifest.slice(0, 80));
        return true;
      }
    } catch { /* keep trying */ }
  }

  // Log el computed del primer manifest (el "esperado") para comparar con MP
  const computedDefault = createHmac('sha256', secret).update(candidates[0]).digest('hex');
  console.warn('[mp-sig] NO MATCH', {
    manifest_tried: candidates[0],
    computed_default: computedDefault,
    received_v1: parts.v1,
    secret_len: secret.length,
    ts: parts.ts,
  });
  return false;

  void rawBody;
}
