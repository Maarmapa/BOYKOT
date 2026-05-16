import Link from 'next/link';
import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface DayBucket {
  date: string;
  orders: number;
  revenue_clp: number;
}

export default async function AnalyticsPage() {
  await requireAdmin();

  const sb = supabaseAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Pedidos ultimos 30 dias
  const { data: orders } = await sb
    .from('pending_orders')
    .select('created_at, total_clp, status, payment_status, channel, items')
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  const ordersList = (orders ?? []) as Array<{
    created_at: string;
    total_clp: number;
    status: string;
    payment_status: string | null;
    channel: string;
    items: Array<{ name: string; brand?: string; qty: number }>;
  }>;

  // Buckets por dia
  const buckets: Record<string, DayBucket> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = { date: key, orders: 0, revenue_clp: 0 };
  }
  for (const o of ordersList) {
    const key = o.created_at.slice(0, 10);
    if (buckets[key]) {
      buckets[key].orders++;
      if (o.payment_status === 'paid' || o.status === 'completed') {
        buckets[key].revenue_clp += o.total_clp;
      }
    }
  }
  const dayData = Object.values(buckets);
  const maxRevenue = Math.max(...dayData.map(d => d.revenue_clp), 1);

  const totalRevenue = dayData.reduce((s, d) => s + d.revenue_clp, 0);
  const totalOrders = ordersList.length;
  const paidOrders = ordersList.filter(o => o.payment_status === 'paid' || o.status === 'completed').length;
  const avgTicket = paidOrders > 0 ? Math.round(totalRevenue / paidOrders) : 0;

  // Top channels
  const byChannel: Record<string, number> = {};
  for (const o of ordersList) {
    byChannel[o.channel] = (byChannel[o.channel] || 0) + 1;
  }

  // Top brands en pedidos
  const brandCount: Record<string, number> = {};
  for (const o of ordersList) {
    for (const it of o.items || []) {
      const brand = it.brand || 'Sin brand';
      brandCount[brand] = (brandCount[brand] || 0) + (it.qty || 1);
    }
  }
  const topBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Analytics — últimos 30 días</h1>
      <p className="text-sm text-gray-500 mb-6">
        Métricas de ventas, channel y top products. Datos de Supabase pending_orders.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Revenue 30d" value={`$${(totalRevenue / 1000).toFixed(0)}K`} note={`${paidOrders} pedidos pagos`} />
        <Stat label="Pedidos totales" value={totalOrders} note="Incluyendo pendientes" />
        <Stat label="Avg ticket" value={`$${avgTicket.toLocaleString('es-CL')}`} note="Por pedido pagado" />
        <Stat label="Conversion" value={totalOrders > 0 ? `${Math.round((paidOrders / totalOrders) * 100)}%` : '0%'} note="Pagos / pedidos" />
      </div>

      {/* Revenue chart */}
      <section className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Revenue diario</h2>
        <p className="text-xs text-gray-500 mb-4">CLP recibidos por día. Barras escaladas al máximo del periodo.</p>
        <div className="flex items-end gap-1 h-40">
          {dayData.map(d => {
            const pct = (d.revenue_clp / maxRevenue) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end" title={`${d.date}: $${d.revenue_clp.toLocaleString('es-CL')}`}>
                <div
                  className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-help"
                  style={{ height: `${pct}%`, minHeight: d.revenue_clp > 0 ? '4px' : '0' }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-mono">
          <span>{dayData[0]?.date.slice(5)}</span>
          <span>{dayData[Math.floor(dayData.length / 2)]?.date.slice(5)}</span>
          <span>{dayData[dayData.length - 1]?.date.slice(5)}</span>
        </div>
      </section>

      {/* Channel + brands grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Pedidos por canal</h2>
          {Object.entries(byChannel).length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">Sin datos</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(byChannel).map(([ch, count]) => {
                const pct = (count / totalOrders) * 100;
                return (
                  <div key={ch}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-900">{ch}</span>
                      <span className="text-gray-600">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">Top brands vendidas (unidades)</h2>
          {topBrands.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">Sin datos</div>
          ) : (
            <div className="space-y-2">
              {topBrands.map(([brand, count]) => {
                const max = topBrands[0][1];
                const pct = (count / max) * 100;
                return (
                  <div key={brand}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-900">{brand}</span>
                      <span className="text-gray-600">{count}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 text-xs text-gray-500">
        💡 <Link href="/admin/orders" className="text-blue-600 hover:underline">Ver pedidos detallados</Link>
      </div>
    </AdminChrome>
  );
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
      <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-xl sm:text-2xl font-bold mt-1">
        {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
      </div>
      {note && <div className="text-[10px] sm:text-xs text-gray-400 mt-1">{note}</div>}
    </div>
  );
}
