// POST /api/payments/mp/create
// Body: { short_id }
// Recibe el short_id de una pre-order, crea preference MP, devuelve URL.
// Actualiza la pre-order en Supabase con payment_provider + payment_url.

import { NextRequest, NextResponse } from 'next/server';
import { createPreference } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body { short_id: string }

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json() as Body; }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.short_id) return NextResponse.json({ error: 'short_id required' }, { status: 400 });

  // 1. Cargar la pre-order
  const { data: order, error: orderErr } = await supabaseAdmin()
    .from('pending_orders')
    .select('*')
    .eq('short_id', body.short_id)
    .maybeSingle();
  if (orderErr || !order) {
    return NextResponse.json({ error: 'order not found' }, { status: 404 });
  }
  if (order.payment_status === 'paid') {
    return NextResponse.json({ error: 'order already paid' }, { status: 409 });
  }

  // 2. Crear preference MP
  type Item = { name: string; color_code?: string; qty: number; unit_price_clp: number; image_url?: string };
  const items = (order.items as Item[]).map(i => ({
    title: i.color_code ? `${i.color_code} – ${i.name}` : i.name,
    quantity: i.qty,
    unit_price: i.unit_price_clp,
    description: i.name,
    picture_url: i.image_url,
  }));
  // Agregar despacho como item separado si aplica
  if (order.shipping_clp > 0 && !order.store_pickup) {
    items.push({
      title: 'Despacho',
      quantity: 1,
      unit_price: order.shipping_clp,
      description: 'Envío a domicilio',
      picture_url: undefined,
    });
  }

  try {
    const pref = await createPreference({
      short_id: order.short_id,
      items,
      payer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
      },
      notes: order.notes,
    });

    // 3. Update orden con datos del pago
    await supabaseAdmin()
      .from('pending_orders')
      .update({
        payment_provider: 'mercadopago',
        payment_status: 'pending',
        payment_reference: pref.preference_id,
        payment_url: pref.init_point,
        updated_at: new Date().toISOString(),
      })
      .eq('short_id', order.short_id);

    return NextResponse.json({
      ok: true,
      preference_id: pref.preference_id,
      init_point: pref.init_point,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
