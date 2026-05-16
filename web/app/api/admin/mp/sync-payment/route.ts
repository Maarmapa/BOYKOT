// GET /api/admin/mp/sync-payment?short_id=BK-260516-XYZ
//
// Busca un pedido en Supabase, consulta MP API para ver estado real,
// actualiza la orden. Útil cuando el webhook MP se perdió (modo TEST
// no entrega webhooks confiable) o si querés re-sincronizar manualmente.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchPayment } from '@/lib/mercadopago';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MP_API = 'https://api.mercadopago.com';

async function findPaymentByReference(shortId: string, token: string) {
  // Buscar payment por external_reference. MP search endpoint:
  // /v1/payments/search?external_reference=BK-XXX
  const url = `${MP_API}/v1/payments/search?external_reference=${encodeURIComponent(shortId)}&sort=date_created&criteria=desc`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`MP search ${res.status}`);
  const data = await res.json() as { results?: Array<{ id: number; status: string; date_approved: string | null; external_reference: string }> };
  const results = data.results ?? [];
  // Filtrar approved/authorized si existe
  const approved = results.find(p => p.status === 'approved' || p.status === 'authorized');
  return approved ?? results[0] ?? null;
}

export async function GET(req: NextRequest) {
  const shortId = req.nextUrl.searchParams.get('short_id');
  if (!shortId) {
    return NextResponse.json({ error: 'short_id query param required' }, { status: 400 });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'MP_ACCESS_TOKEN missing' }, { status: 500 });
  }

  // 1. Cargar la orden
  const { data: order } = await supabaseAdmin()
    .from('pending_orders')
    .select('short_id, payment_status, payment_reference, total_clp, customer_name, paid_at')
    .eq('short_id', shortId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: `Order ${shortId} not found in Supabase` }, { status: 404 });
  }

  // 2. Si ya hay payment_reference, fetcheamos ese específicamente
  // Si no, search por external_reference
  let payment;
  try {
    if (order.payment_reference) {
      payment = await fetchPayment(order.payment_reference);
    } else {
      const found = await findPaymentByReference(shortId, token);
      if (!found) {
        return NextResponse.json({
          ok: false,
          message: 'No payment found in MP for this order. Either it was never created or external_reference is wrong.',
          order,
        });
      }
      payment = await fetchPayment(found.id);
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, order }, { status: 500 });
  }

  // 3. Update si está aprobado y no estaba paid
  const isPaid = payment.status === 'approved' || payment.status === 'authorized';
  let updated = false;
  if (isPaid && order.payment_status !== 'paid') {
    await supabaseAdmin()
      .from('pending_orders')
      .update({
        payment_status: 'paid',
        payment_reference: String(payment.id),
        paid_at: payment.date_approved || new Date().toISOString(),
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('short_id', shortId);
    updated = true;
  }

  return NextResponse.json({
    ok: true,
    order: {
      short_id: order.short_id,
      customer: order.customer_name,
      total_clp: order.total_clp,
      payment_status_before: order.payment_status,
    },
    mp_payment: {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      date_approved: payment.date_approved,
      payment_method: payment.payment_method_id,
      payment_type: payment.payment_type_id,
      transaction_amount: payment.transaction_amount,
    },
    action: updated ? 'updated to paid' : (isPaid ? 'was already paid' : 'still pending/failed in MP'),
  });
}
