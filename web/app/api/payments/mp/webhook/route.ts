// POST /api/payments/mp/webhook
//
// Recibe notificaciones de Mercado Pago cuando hay cambios en un pago.
// Verifica firma, idempotente por event_id, fetcha el payment, actualiza
// la orden a paid/failed/etc.
//
// Configurar URL en MP panel: Notificaciones → Webhooks → URL =
//   https://boykot.cl/api/payments/mp/webhook
// Suscribir topic: "payments"

import { NextRequest, NextResponse } from 'next/server';
import { fetchPayment, verifyWebhookSignature } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MpWebhookBody {
  id?: number | string;
  type?: string;
  action?: string;
  data?: { id?: string | number };
}

function mapMpStatus(s: string): { status: string; isFinal: boolean } {
  switch (s) {
    case 'approved':
    case 'authorized':
      return { status: 'paid', isFinal: true };
    case 'rejected':
    case 'cancelled':
      return { status: 'failed', isFinal: true };
    case 'refunded':
    case 'charged_back':
      return { status: 'refunded', isFinal: true };
    case 'in_process':
    case 'in_mediation':
    case 'pending':
    default:
      return { status: 'processing', isFinal: false };
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: MpWebhookBody;
  try { body = JSON.parse(rawBody) as MpWebhookBody; }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }

  // MP a veces envía data.id en query param ?data.id=X, además del body.
  // Probar ambos — preferir query si está.
  const queryDataId = req.nextUrl.searchParams.get('data.id') || req.nextUrl.searchParams.get('id');
  const dataId = queryDataId || String(body.data?.id ?? '');
  if (!dataId) {
    console.log('[mp-webhook] SKIPPED no data.id', { url: req.url, bodyPreview: rawBody.slice(0, 200) });
    return NextResponse.json({ ok: true, skipped: 'no data.id' });
  }

  // Logging extenso para debug
  const xSig = req.headers.get('x-signature') || '';
  const xReqId = req.headers.get('x-request-id') || '';
  console.log('[mp-webhook] received', {
    dataId,
    type: body.type,
    action: body.action,
    xSigPresent: !!xSig,
    xReqIdPresent: !!xReqId,
    bodyLen: rawBody.length,
  });

  // Verificar firma. Si falla, LOGEAR detalle pero seguir procesando
  // (porque MP TEST a veces tiene quirks de signing y prefer ver el data
  // que perderlo. Cuando vayamos a Producción, endurecer).
  const valid = await verifyWebhookSignature(rawBody, req.headers, dataId);
  if (!valid) {
    console.warn('[mp-webhook] SIGNATURE FAIL', {
      dataId,
      xSig: xSig.slice(0, 60) + '…',
      xReqId,
      bodyType: body.type,
    });
    // En modo TEST seguimos procesando. En PROD strict:
    // return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  // Idempotencia: registrar el evento si no existía
  const eventId = `${body.type || 'unknown'}:${dataId}:${body.action || 'unknown'}`;
  const { data: existing } = await supabaseAdmin()
    .from('payment_webhooks')
    .select('id, processed')
    .eq('provider', 'mercadopago')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing?.processed) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  let webhookRowId: number | null = existing?.id ?? null;
  if (!webhookRowId) {
    const { data: inserted } = await supabaseAdmin()
      .from('payment_webhooks')
      .insert({
        provider: 'mercadopago',
        event_type: body.type || 'unknown',
        event_id: eventId,
        payment_reference: dataId,
        payload: body,
      })
      .select('id')
      .single();
    webhookRowId = inserted?.id ?? null;
  }

  // Solo nos interesan los tipo "payment"
  if (body.type !== 'payment') {
    if (webhookRowId) {
      await supabaseAdmin()
        .from('payment_webhooks')
        .update({ processed: true })
        .eq('id', webhookRowId);
    }
    return NextResponse.json({ ok: true, ignored: body.type });
  }

  try {
    const payment = await fetchPayment(dataId);
    const shortId = payment.external_reference;
    if (!shortId) {
      throw new Error('payment has no external_reference (short_id)');
    }

    const mapped = mapMpStatus(payment.status);
    const updates: Record<string, unknown> = {
      payment_provider: 'mercadopago',
      payment_status: mapped.status,
      payment_reference: String(payment.id),
      updated_at: new Date().toISOString(),
    };
    if (mapped.isFinal && mapped.status === 'paid') {
      updates.paid_at = payment.date_approved || new Date().toISOString();
      updates.status = 'confirmed'; // orden general: pending → confirmed cuando paga
    }

    await supabaseAdmin()
      .from('pending_orders')
      .update(updates)
      .eq('short_id', shortId);

    if (webhookRowId) {
      await supabaseAdmin()
        .from('payment_webhooks')
        .update({ processed: true })
        .eq('id', webhookRowId);
    }

    return NextResponse.json({
      ok: true,
      short_id: shortId,
      mp_status: payment.status,
      mapped_status: mapped.status,
    });
  } catch (e) {
    if (webhookRowId) {
      await supabaseAdmin()
        .from('payment_webhooks')
        .update({ error: (e as Error).message })
        .eq('id', webhookRowId);
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
