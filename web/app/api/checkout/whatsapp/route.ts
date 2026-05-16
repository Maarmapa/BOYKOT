// POST /api/checkout/whatsapp
// Recibe los datos del checkout form + items del cart, crea un pre-order
// en Supabase y devuelve { short_id, whatsapp_url } para que el cliente
// abra WhatsApp con el mensaje pre-llenado.

import { NextRequest, NextResponse } from 'next/server';
import { createPendingOrder, buildWhatsappLink, type PendingOrderItem } from '@/lib/pending-orders';

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
    // Generar el URL final con el short_id real
    const final_url = buildWhatsappLink(body, saved.short_id, whatsappNumber);
    return NextResponse.json({
      ok: true,
      short_id: saved.short_id,
      whatsapp_url: final_url,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
