import Link from 'next/link';
import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { listQuotes } from '@/lib/quotes';

export const dynamic = 'force-dynamic';

export default async function AdminQuotesPage() {
  await requireAdmin();
  const quotes = await listQuotes(200);

  const totalActive = quotes.filter(q => q.status === 'draft' || q.status === 'sent').length;
  const totalConverted = quotes.filter(q => q.status === 'converted').length;
  const totalValue = quotes.reduce((s, q) => s + q.total_clp, 0);

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Cotizaciones</h1>
      <p className="text-sm text-gray-500 mb-6">
        Cotizaciones generadas vía <Link href="/cotizador" className="text-blue-600 hover:underline">/cotizador</Link> público + admin manual.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total" value={quotes.length.toString()} />
        <StatCard label="Activas" value={totalActive.toString()} />
        <StatCard label="Convertidas" value={totalConverted.toString()} />
        <StatCard label="Valor total" value={`$${totalValue.toLocaleString('es-CL')}`} />
      </div>

      {quotes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-500">
          Aún no hay cotizaciones. Probá generar una desde{' '}
          <Link href="/cotizador" className="text-blue-600 hover:underline">/cotizador</Link>.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">ID</th>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-left px-4 py-2">Proyecto</th>
                <th className="text-right px-4 py-2">Total CLP</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Emitida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map(q => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/cotizacion/${q.short_id}`}
                      target="_blank"
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {q.short_id}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-900">{q.customer_name || '—'}</div>
                    {q.customer_company && (
                      <div className="text-xs text-gray-500">{q.customer_company}</div>
                    )}
                    {q.customer_email && (
                      <div className="text-xs text-gray-400">{q.customer_email}</div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 max-w-xs truncate">
                    {q.customer_project || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    ${q.total_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {new Date(q.created_at).toLocaleDateString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminChrome>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-800',
    converted: 'bg-emerald-100 text-emerald-800',
    expired: 'bg-amber-100 text-amber-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
