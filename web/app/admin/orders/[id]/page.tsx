import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../layout';
import AdminChrome from '@/components/admin/Chrome';
import { getOrderByShortId } from '@/lib/pending-orders';
import StatusForm from './status-form';

export const dynamic = 'force-dynamic';

interface Params {
  id: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  contacted: 'En contacto',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export default async function OrderDetailPage({ params }: { params: Promise<Params> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderByShortId(id);
  if (!order) notFound();

  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
  const trackingUrl = `${SITE}/pedido/${order.short_id}`;
  const customerHandoff = `Hola ${order.customer_name}! Sobre tu pedido ${order.short_id}: ...`;
  const wsHandoff = `https://wa.me/${(order.customer_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(customerHandoff)}`;

  return (
    <AdminChrome>
      <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900">
        ← Volver a pedidos
      </Link>
      <div className="flex items-baseline justify-between gap-4 mt-2 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{order.short_id}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString('es-CL')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
            order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-700'
          }`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          {order.payment_status === 'paid' && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-800">
              ✓ Pagado
            </span>
          )}
        </div>
      </div>

      {/* Status update */}
      <StatusForm shortId={order.short_id} currentStatus={order.status} />

      {/* Quick actions */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {order.customer_phone && (
            <a
              href={wsHandoff}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold px-3 py-2 rounded text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              💬 WhatsApp al cliente
            </a>
          )}
          {order.customer_email && (
            <a
              href={`mailto:${order.customer_email}?subject=${encodeURIComponent(`Pedido ${order.short_id}`)}`}
              className="inline-block text-xs font-semibold px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              ✉ Email
            </a>
          )}
          <a
            href={trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            🔗 Ver tracking público
          </a>
          {order.payment_url && (
            <a
              href={order.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs font-semibold px-3 py-2 bg-amber-500 text-white rounded hover:bg-amber-400"
            >
              💳 Link de pago MP
            </a>
          )}
        </div>
      </section>

      {/* Customer + Items grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Cliente</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Nombre" value={order.customer_name} />
            <Row label="Email" value={order.customer_email} mailto />
            <Row label="Teléfono" value={order.customer_phone} tel />
            <Row label="Channel" value={order.channel} />
          </dl>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Pago</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Status" value={order.payment_status} />
            <Row label="Reference" value={order.payment_reference} mono />
            <Row label="Pagado en" value={order.paid_at ? new Date(order.paid_at).toLocaleString('es-CL') : null} />
          </dl>
        </section>
      </div>

      {/* Items */}
      <section className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Items ({order.items?.length || 0})
          </h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.color_code && <span className="font-mono mr-2">{item.color_code}</span>}
                    variant_id: {item.variant_id}
                  </div>
                </td>
                <td className="px-5 py-3 text-right text-sm">× {item.qty}</td>
                <td className="px-5 py-3 text-right text-sm font-mono">
                  ${item.unit_price_clp.toLocaleString('es-CL')}
                </td>
                <td className="px-5 py-3 text-right text-sm font-bold font-mono">
                  ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-900 text-white">
              <td colSpan={3} className="px-5 py-3 font-bold">Total CLP</td>
              <td className="px-5 py-3 text-right font-bold font-mono text-base">
                ${order.total_clp.toLocaleString('es-CL')}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </AdminChrome>
  );
}

function Row({ label, value, mailto, tel, mono }: { label: string; value: string | null | undefined; mailto?: boolean; tel?: boolean; mono?: boolean }) {
  if (!value) return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-400 italic">—</dd>
    </div>
  );
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500 flex-shrink-0">{label}</dt>
      <dd className={`text-gray-900 ${mono ? 'font-mono text-xs' : ''} text-right`}>
        {mailto ? <a href={`mailto:${value}`} className="hover:underline">{value}</a> :
         tel ? <a href={`tel:${value}`} className="hover:underline">{value}</a> :
         value}
      </dd>
    </div>
  );
}
