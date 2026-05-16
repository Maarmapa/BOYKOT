// Página de pago para una pre-order existente.
// URL: /pago/BK-260515-7K3F
// Muestra resumen + botón "Pagar con Mercado Pago" que crea preference
// y redirige al checkout MP.

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import PayButton from './PayButton';

export const dynamic = 'force-dynamic';

interface OrderRow {
  short_id: string;
  customer_name: string;
  customer_email: string;
  items: Array<{ name: string; color_code?: string; qty: number; unit_price_clp: number; image_url?: string }>;
  subtotal_clp: number;
  shipping_clp: number;
  total_clp: number;
  store_pickup: boolean;
  shipping_address: string | null;
  shipping_city: string | null;
  payment_status: string;
  payment_url: string | null;
  paid_at: string | null;
}

async function loadOrder(shortId: string): Promise<OrderRow | null> {
  const { data, error } = await supabaseAdmin()
    .from('pending_orders')
    .select('short_id, customer_name, customer_email, items, subtotal_clp, shipping_clp, total_clp, store_pickup, shipping_address, shipping_city, payment_status, payment_url, paid_at')
    .eq('short_id', shortId)
    .maybeSingle();
  if (error || !data) return null;
  return data as OrderRow;
}

export default async function PaymentPage({ params }: { params: Promise<{ shortId: string }> }) {
  const { shortId } = await params;
  const order = await loadOrder(shortId);
  if (!order) notFound();

  const isPaid = order.payment_status === 'paid';

  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-mono">Pedido</p>
          <h1 className="text-2xl font-bold text-gray-900">{order.short_id}</h1>
          <p className="text-sm text-gray-500 mt-1">{order.customer_name} · {order.customer_email}</p>
        </div>

        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-3xl mb-2">✅</div>
            <h2 className="text-lg font-bold text-green-900 mb-1">Pago recibido</h2>
            <p className="text-sm text-green-800">
              Tu pago fue confirmado el {order.paid_at ? new Date(order.paid_at).toLocaleString('es-CL') : 'recién'}.
              En máx 24-48h hábiles preparamos tu pedido y te avisamos por WhatsApp.
            </p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900 mb-4">Resumen</h2>
          <ul className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {item.color_code && <span className="font-mono text-xs text-gray-500 mr-2">{item.color_code}</span>}
                  {item.name}
                  <span className="text-gray-400 ml-2">× {item.qty}</span>
                </span>
                <span className="font-semibold text-gray-900">
                  ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${order.subtotal_clp.toLocaleString('es-CL')}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-600">Despacho</span>
              <span className={order.shipping_clp === 0 ? 'text-green-600' : ''}>
                {order.store_pickup ? 'Retiro tienda' : (order.shipping_clp === 0 ? 'Gratis' : '$' + order.shipping_clp.toLocaleString('es-CL'))}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 text-base font-bold">
              <span>Total</span><span>${order.total_clp.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </div>

        {!isPaid && (
          <>
            <PayButton shortId={order.short_id} existingUrl={order.payment_url} total={order.total_clp} />
            <p className="text-xs text-gray-500 text-center mt-4">
              Pagás con Mercado Pago — tarjeta crédito/débito, Apple Pay, Google Pay, transferencia o Khipu.
              <br />Cancelaciones y devoluciones por WhatsApp.
            </p>
          </>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Boykot · Av. Providencia 2251 local 69 · providencia@boykot.cl
        </p>
      </div>
    </main>
  );
}
