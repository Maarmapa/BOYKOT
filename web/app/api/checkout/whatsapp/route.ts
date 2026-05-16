// POST /api/checkout/whatsapp
// Recibe los datos del checkout form + items del cart, crea un pre-order
// en Supabase y devuelve { short_id, whatsapp_url } para que el cliente
// abra WhatsApp con el mensaje pre-llenado.

import { NextRequest, NextResponse } from 'next/server';
import { createPendingOrder, buildWhatsappLink, type PendingOrderItem } from '@/lib/pending-orders';
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  customer: { name: string; email: string; phone: string; rut?: string };
  shipping: { address?: string; city?: string; store_pickup: boolean };
  items: PendingOrderItem[];
  subtotal_clp: number;
  shipping_clp: number;
  total_clp: number;
  notes?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json() as Body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validación mínima
  if (!body.customer?.name || !body.customer?.email || !body.customer?.phone) {
    return NextResponse.json({ error: 'Faltan datos: nombre, email y teléfono son obligatorios' }, { status: 400 });
  }
  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'Carro vacío' }, { status: 400 });
  }
  if (!body.shipping.store_pickup && !body.shipping.address) {
    return NextResponse.json({ error: 'Falta dirección de despacho (o marcá retiro en tienda)' }, { status: 400 });
  }

  const whatsappNumber = process.env.BOYKOT_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_BOYKOT_WHATSAPP_NUMBER;
  if (!whatsappNumber) {
    return NextResponse.json({ error: 'BOYKOT_WHATSAPP_NUMBER no configurado en env vars' }, { status: 500 });
  }

  // Generar short_id placeholder primero para incluirlo en el link
  const tempShort = `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const provisional_url = buildWhatsappLink(body, tempShort, whatsappNumber);

  try {
    const saved = await createPendingOrder(body, provisional_url);
    const final_url = buildWhatsappLink(body, saved.short_id, whatsappNumber);

    // Disparar emails en paralelo. Si Brevo no está set o falla, no
    // bloqueamos la respuesta — el WhatsApp ya cumple el rol de confirmar.
    const emailInput = {
      short_id: saved.short_id,
      customer: body.customer,
      shipping: body.shipping,
      items: body.items,
      subtotal_clp: body.subtotal_clp,
      shipping_clp: body.shipping_clp,
      total_clp: body.total_clp,
      notes: body.notes,
      whatsapp_url: final_url,
    };
    Promise.all([
      sendOrderConfirmationToCustomer(emailInput).catch(e => console.error('[checkout] customer email:', e.message)),
      sendOrderNotificationToAdmin(emailInput).catch(e => console.error('[checkout] admin email:', e.message)),
    ]).catch(() => {});

    return NextResponse.json({
      ok: true,
      short_id: saved.short_id,
      whatsapp_url: final_url,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
