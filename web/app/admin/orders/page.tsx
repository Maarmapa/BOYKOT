import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { listPendingOrders } from '@/lib/pending-orders';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersAdminPage() {
  await requireAdmin();
  const orders = await listPendingOrders(100);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-2">Pedidos pendientes</h1>
      <p className="text-sm text-gray-500 mb-6">
        {orders.length} pre-pedidos creados desde /checkout. Se cierran por WhatsApp + pago manual.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-500 capitalize">{status}</span>
            <span className="ml-2 font-bold tabular-nums">{count}</span>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-500">
            Todavía no hay pedidos. Cuando alguien complete <code>/checkout</code> aparecen acá.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{o.short_id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{o.customer_name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <a href={`mailto:${o.customer_email}`} className="block hover:underline">{o.customer_email}</a>
                    <a href={`tel:${o.customer_phone}`} className="block hover:underline">{o.customer_phone}</a>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    ${o.total_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {Array.isArray(o.items) ? `${o.items.length} colores` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-xs text-gray-500">
        <p className="mb-1"><strong>Status states:</strong></p>
        <ul className="list-disc list-inside space-y-0.5">
          <li><code>pending</code> — recién creada, esperando contacto inicial</li>
          <li><code>contacted</code> — llamaste/escribiste al cliente</li>
          <li><code>confirmed</code> — confirmaron stock y método de pago</li>
          <li><code>shipped</code> — despachada</li>
          <li><code>completed</code> — entregada</li>
          <li><code>cancelled</code> — no se concretó</li>
        </ul>
      </div>
    </AdminChrome>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    contacted: 'bg-blue-50 text-blue-800 border-blue-200',
    confirmed: 'bg-purple-50 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    completed: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  const cls = colors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider border rounded ${cls}`}>
      {status}
    </span>
  );
}
