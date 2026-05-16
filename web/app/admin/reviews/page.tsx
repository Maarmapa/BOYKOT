import Link from 'next/link';
import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';
import type { Review } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  await requireAdmin();

  const { data } = await supabaseAdmin()
    .from('product_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  const reviews = (data ?? []) as Review[];

  const pending = reviews.filter(r => r.status === 'pending');
  const published = reviews.filter(r => r.status === 'published');
  const rejected = reviews.filter(r => r.status === 'rejected');

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Reviews / Reseñas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Moderar reseñas de productos. Las verified_purchase pasan auto a published.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Pendientes" value={pending.length} color="amber" />
        <StatCard label="Publicadas" value={published.length} color="emerald" />
        <StatCard label="Rechazadas" value={rejected.length} color="gray" />
      </div>

      {reviews.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-500">
          Aún no hay reseñas. Aparecerán acá cuando clientes empiecen a comprar y dejar feedback.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">Producto</th>
                <th className="text-left px-4 py-2">Rating</th>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-left px-4 py-2">Reseña</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/producto/${r.product_slug}`} target="_blank" className="text-blue-600 hover:underline text-xs">
                      {r.product_slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-amber-500">{'★'.repeat(r.rating)}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.customer_name || r.customer_email}
                    {r.verified_purchase && (
                      <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">✓ Verificada</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-md">
                    {r.title && <div className="font-semibold mb-1">{r.title}</div>}
                    {r.body && <div className="text-gray-700 line-clamp-2">{r.body}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500">
                    {new Date(r.created_at).toLocaleDateString('es-CL')}
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

function StatCard({ label, value, color }: { label: string; value: number; color: 'amber' | 'emerald' | 'gray' }) {
  const colorMap = {
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    gray: 'bg-gray-50 text-gray-900 border-gray-200',
  };
  return (
    <div className={`border rounded-lg p-4 ${colorMap[color]}`}>
      <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    published: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}
