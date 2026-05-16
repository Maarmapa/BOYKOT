import Link from 'next/link';
import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface CustomerStats {
  email: string;
  name: string | null;
  total_orders: number;
  total_spent_clp: number;
  last_order_at: string | null;
  has_credits: boolean;
}

export default async function AdminCustomersPage() {
  await requireAdmin();

  // Aggregate desde pending_orders (los que ya compraron en el sistema nuevo)
  // Cuando llegue customer CSV del admin WP, se sumara con un import-customers.mjs script
  const sb = supabaseAdmin();
  const { data: orders } = await sb
    .from('pending_orders')
    .select('customer_email, customer_name, total_clp, created_at, status, payment_status')
    .order('created_at', { ascending: false });

  const { data: credits } = await sb
    .from('boykot_credits_accounts')
    .select('customer_email, balance_clp, tier');

  // Group by email
  const byEmail: Record<string, CustomerStats> = {};
  for (const o of (orders ?? []) as Array<{
    customer_email: string;
    customer_name: string | null;
    total_clp: number;
    created_at: string;
    status: string;
    payment_status: string | null;
  }>) {
    const key = o.customer_email.toLowerCase();
    if (!byEmail[key]) {
      byEmail[key] = {
        email: key,
        name: o.customer_name,
        total_orders: 0,
        total_spent_clp: 0,
        last_order_at: o.created_at,
        has_credits: false,
      };
    }
    byEmail[key].total_orders++;
    if (o.payment_status === 'paid' || o.status === 'completed') {
      byEmail[key].total_spent_clp += o.total_clp;
    }
    if (o.created_at > (byEmail[key].last_order_at || '')) {
      byEmail[key].last_order_at = o.created_at;
    }
  }

  for (const c of (credits ?? []) as Array<{ customer_email: string; balance_clp: number; tier: string }>) {
    const key = c.customer_email.toLowerCase();
    if (!byEmail[key]) {
      byEmail[key] = {
        email: key,
        name: null,
        total_orders: 0,
        total_spent_clp: 0,
        last_order_at: null,
        has_credits: c.balance_clp > 0,
      };
    } else {
      byEmail[key].has_credits = c.balance_clp > 0;
    }
  }

  const customers = Object.values(byEmail).sort((a, b) => b.total_spent_clp - a.total_spent_clp);

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Clientes</h1>
      <p className="text-sm text-gray-500 mb-6">
        Clientes únicos del sistema nuevo (post Boykot v2). Cuando llegue el CSV del admin WP,
        se sincronizan los legacy con script de import.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Únicos totales" value={customers.length} />
        <StatCard label="Con pedidos pagados" value={customers.filter(c => c.total_spent_clp > 0).length} />
        <StatCard label="Con Credits" value={customers.filter(c => c.has_credits).length} />
      </div>

      {customers.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <div className="text-4xl mb-3">👥</div>
          <h2 className="text-base font-semibold mb-2">Aún no hay clientes</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Cuando entren pedidos al sistema nuevo aparecerán acá. Para importar legacy del WP,
            esperamos el CSV del admin tienda.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-right px-4 py-2">Pedidos</th>
                <th className="text-right px-4 py-2">Total gastado</th>
                <th className="text-left px-4 py-2">Último pedido</th>
                <th className="text-center px-4 py-2">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.email} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-900">{c.name || '—'}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{c.total_orders}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    ${c.total_spent_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {c.last_order_at
                      ? new Date(c.last_order_at).toLocaleDateString('es-CL')
                      : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.has_credits ? '💰' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-xs text-gray-500">
        💡 <Link href="/admin/credits" className="text-blue-600 hover:underline">Ver wallets activas</Link>
        {' · '}
        <Link href="/admin/orders" className="text-blue-600 hover:underline">Ver todos los pedidos</Link>
      </div>
    </AdminChrome>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
