import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';
import type { PromoCode } from '@/lib/promo-codes';
import PromoAdminForm from './form';

export const dynamic = 'force-dynamic';

export default async function AdminPromocionesPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin()
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  const codes = (data ?? []) as PromoCode[];

  const active = codes.filter(c => c.enabled);
  const inactive = codes.filter(c => !c.enabled);

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Promo codes</h1>
      <p className="text-sm text-gray-500 mb-6">
        Códigos promocionales aplicables en checkout. Tipos: percent (X%), fixed (CLP off), free_shipping.
      </p>

      {/* Crear nuevo */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
        <h2 className="font-bold text-gray-900 mb-3">Crear código nuevo</h2>
        <PromoAdminForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Activos" value={active.length} color="emerald" />
        <StatCard label="Inactivos" value={inactive.length} color="gray" />
        <StatCard label="Total usos" value={codes.reduce((s, c) => s + c.uses_count, 0)} color="blue" />
      </div>

      {/* Lista */}
      {codes.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-sm text-gray-500">
          Aún no hay códigos. Creá el primero arriba.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">Código</th>
                <th className="text-left px-4 py-2">Tipo</th>
                <th className="text-left px-4 py-2">Valor</th>
                <th className="text-left px-4 py-2">Usos</th>
                <th className="text-left px-4 py-2">Min subtotal</th>
                <th className="text-left px-4 py-2">Estado</th>
                <th className="text-left px-4 py-2">Válido hasta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map(c => (
                <tr key={c.id} className={c.enabled ? '' : 'opacity-50'}>
                  <td className="px-4 py-2.5 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="px-4 py-2.5 text-xs">{c.discount_type}</td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {c.discount_type === 'percent' ? `${c.discount_value}%` :
                      c.discount_type === 'fixed' ? `$${c.discount_value.toLocaleString('es-CL')}` :
                      '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {c.min_subtotal_clp ? `$${c.min_subtotal_clp.toLocaleString('es-CL')}` : '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {c.enabled ? 'activo' : 'inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString('es-CL') : 'Sin límite'}
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

function StatCard({ label, value, color }: { label: string; value: number; color: 'emerald' | 'gray' | 'blue' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    gray: 'bg-gray-50 border-gray-200 text-gray-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
  };
  return (
    <div className={`border rounded-lg p-4 ${colorMap[color]}`}>
      <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
