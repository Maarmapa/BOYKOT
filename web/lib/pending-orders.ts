// Pre-orders generadas en /checkout. Antes de cerrar venta (pagar) se
// guardan acá con status='pending' y se mandan al WhatsApp del negocio
// para que el cliente cierre por chat.
//
// Storage: tabla Supabase pending_orders.

import { supabaseAdmin } from './supabase';

export interface PendingOrderItem {
  variant_id: number;
  name: string;
  color_code?: string;
  qty: number;
  unit_price_clp: number;
}

export interface CreatePendingOrderInput {
  cart_id?: number | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    rut?: string;
  };
  shipping: {
    address?: string;
    city?: string;
    store_pickup: boolean;
  };
  items: PendingOrderItem[];
  subtotal_clp: number;
  shipping_clp: number;
  total_clp: number;
  notes?: string;
}

export interface PendingOrder {
  id: number;
  short_id: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_clp: number;
  channel: string;
  items: PendingOrderItem[];
  payment_status?: string | null;
  payment_url?: string | null;
  payment_reference?: string | null;
  paid_at?: string | null;
}

function makeShortId(): string {
  // Format: BK-YYMMDD-XXXX (ej. BK-260515-7K3F)
  const now = new Date();
  const y = String(now.getUTCFullYear()).slice(2);
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BK-${y}${m}${d}-${rand}`;
}

export async function createPendingOrder(input: CreatePendingOrderInput, whatsappUrl: string): Promise<{ id: number; short_id: string }> {
  const short_id = makeShortId();
  const { data, error } = await supabaseAdmin()
    .from('pending_orders')
    .insert({
      short_id,
      cart_id: input.cart_id ?? null,
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      customer_rut: input.customer.rut ?? null,
      shipping_address: input.shipping.address ?? null,
      shipping_city: input.shipping.city ?? null,
      store_pickup: input.shipping.store_pickup,
      items: input.items,
      subtotal_clp: input.subtotal_clp,
      shipping_clp: input.shipping_clp,
      total_clp: input.total_clp,
      channel: 'whatsapp',
      status: 'pending',
      notes: input.notes ?? null,
      whatsapp_message_url: whatsappUrl,
    })
    .select('id, short_id')
    .single();
  if (error) throw new Error(`createPendingOrder failed: ${error.message}`);
  return { id: data.id as number, short_id: data.short_id as string };
}

export function buildWhatsappLink(
  input: CreatePendingOrderInput,
  shortId: string,
  baseNumber: string,
  paymentUrl?: string,
): string {
  const lines: string[] = [];
  lines.push(`🎨 *Pedido Boykot ${shortId}*`);
  lines.push('');
  lines.push(`Hola! Quiero comprar:`);
  for (const item of input.items) {
    const label = item.color_code ? `${item.color_code} – ${item.name}` : item.name;
    lines.push(`• ${item.qty}× ${label} ($${item.unit_price_clp.toLocaleString('es-CL')} c/u)`);
  }
  lines.push('');
  lines.push(`Subtotal: $${input.subtotal_clp.toLocaleString('es-CL')}`);
  if (input.shipping.store_pickup) {
    lines.push(`Retiro en tienda 📍 Providencia 2251 local 69`);
  } else {
    lines.push(`Despacho: ${input.shipping_clp === 0 ? 'Gratis' : '$' + input.shipping_clp.toLocaleString('es-CL')}`);
    if (input.shipping.address) lines.push(`📦 Dirección: ${input.shipping.address}${input.shipping.city ? ', ' + input.shipping.city : ''}`);
  }
  lines.push(`*Total: $${input.total_clp.toLocaleString('es-CL')}*`);
  lines.push('');
  lines.push(`👤 ${input.customer.name}`);
  lines.push(`✉️ ${input.customer.email}`);
  if (input.customer.rut) lines.push(`🆔 ${input.customer.rut}`);
  if (input.notes) {
    lines.push('');
    lines.push(`📝 ${input.notes}`);
  }
  if (paymentUrl) {
    lines.push('');
    lines.push(`💳 *Link de pago Mercado Pago:*`);
    lines.push(paymentUrl);
    lines.push(`(Aceptamos tarjeta, Apple Pay, Google Pay, Khipu, transferencia)`);
  } else {
    lines.push('');
    lines.push(`✅ Confirmáme stock y mandame el link de pago, porfa.`);
  }

  const text = encodeURIComponent(lines.join('\n'));
  const num = baseNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${num}?text=${text}`;
}

export async function listPendingOrders(limit = 50): Promise<PendingOrder[]> {
  const { data, error } = await supabaseAdmin()
    .from('pending_orders')
    .select('id, short_id, status, created_at, customer_name, customer_email, customer_phone, total_clp, channel, items, payment_status, payment_url, payment_reference, paid_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as PendingOrder[];
}

export async function listOrdersByEmail(email: string, limit = 50): Promise<PendingOrder[]> {
  const { data, error } = await supabaseAdmin()
    .from('pending_orders')
    .select('id, short_id, status, created_at, customer_name, customer_email, customer_phone, total_clp, channel, items, payment_status, payment_url, payment_reference, paid_at')
    .eq('customer_email', email.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []) as PendingOrder[];
}

export async function getOrderByShortId(shortId: string): Promise<PendingOrder | null> {
  const { data, error } = await supabaseAdmin()
    .from('pending_orders')
    .select('id, short_id, status, created_at, customer_name, customer_email, customer_phone, total_clp, channel, items, payment_status, payment_url, payment_reference, paid_at')
    .eq('short_id', shortId)
    .maybeSingle();
  if (error) return null;
  return data as PendingOrder | null;
}
