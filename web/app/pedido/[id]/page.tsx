import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getOrderByShortId } from '@/lib/pending-orders';

export const dynamic = 'force-dynamic';

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const o = await getOrderByShortId(id);
  if (!o) return { title: 'Pedido no encontrado · Boykot' };
  return {
    title: `Pedido ${o.short_id} · Boykot`,
    description: `Estado del pedido ${o.short_id} · Total $${o.total_clp.toLocaleString('es-CL')}`,
    robots: { index: false, follow: false },
  };
}

const TIMELINE: Array<{ key: string; label: string; desc: string }> = [
  { key: 'pending', label: 'Pedido recibido', desc: 'Te contactamos por WhatsApp/email en 2hr hábiles' },
  { key: 'contacted', label: 'Confirmando stock', desc: 'Validamos disponibilidad y armamos tu envío' },
  { key: 'confirmed', label: 'Pagado / Confirmado', desc: 'Tu pedido está confirmado y en preparación' },
  { key: 'shipped', label: 'Enviado', desc: '24-48 hrs hábiles a tu dirección' },
  { key: 'completed', label: 'Entregado', desc: 'Tu pedido llegó. ¡Disfrutá creando!' },
];

function statusIndex(status: string): number {
  const idx = TIMELINE.findIndex(t => t.key === status);
  return idx === -1 ? 0 : idx;
}

export default async function OrderTrackingPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrderByShortId(id);
  if (!order) notFound();

  const cancelled = order.status === 'cancelled';
  const currentStep = statusIndex(order.status);
  const created = new Date(order.created_at);

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Pedido {order.short_id}</span>
          </nav>
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Pedido</div>
          <h1 className="text-3xl sm:text-4xl font-mono font-bold mb-2">{order.short_id}</h1>
          <p className="text-sm text-gray-400">
            Emitido {created.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Timeline */}
        {cancelled ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 mb-8">
            <div className="font-bold text-red-900 mb-1">Pedido cancelado</div>
            <p className="text-sm text-red-700">
              Este pedido fue cancelado. Si fue un error, escribinos por WhatsApp.
            </p>
          </div>
        ) : (
          <div className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
              Estado actual
            </h2>
            <ol className="space-y-3">
              {TIMELINE.map((step, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <li
                    key={step.key}
                    className={`flex items-start gap-4 ${isActive ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isActive ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div className={`font-semibold ${isCurrent ? 'text-emerald-700' : 'text-gray-900'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">AHORA</span>}
                      </div>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Pago status */}
        {order.payment_status && order.payment_status !== 'paid' && order.payment_url && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8 text-center">
            <div className="text-sm font-semibold text-amber-900 mb-2">
              ⏳ Pago pendiente
            </div>
            <p className="text-xs text-amber-800 mb-3">
              Completá el pago para confirmar tu pedido.
            </p>
            <a
              href={order.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-amber-600 text-white px-5 py-2.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-amber-500"
            >
              Pagar ahora →
            </a>
          </div>
        )}

        {/* Items */}
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Items ({order.items?.length || 0})
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
          {order.items?.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                {item.color_code && (
                  <div className="text-xs text-gray-500">{item.color_code}</div>
                )}
              </div>
              <div className="text-sm text-gray-600">× {item.qty}</div>
              <div className="text-sm font-mono font-bold text-gray-900">
                ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
              </div>
            </div>
          ))}
          <div className="border-t-2 border-gray-900 p-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="font-mono">${order.total_clp.toLocaleString('es-CL')}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 text-white rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold mb-2">¿Dudas sobre tu pedido?</h3>
          <p className="text-sm text-gray-300 mb-4">
            Te respondemos por WhatsApp o email en horario hábil.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a
              href={`https://wa.me/56223350961?text=Hola%2C+consulta+por+pedido+${encodeURIComponent(order.short_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              💬 WhatsApp
            </a>
            <Link
              href="/perfil/pedidos"
              className="inline-block bg-white text-gray-900 px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider hover:bg-gray-100"
            >
              Ver todos mis pedidos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
