import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { listCreditsAccounts, getCreditsStats } from '@/lib/credits';
import CreditsAdjustForm from './adjust-form';

export const dynamic = 'force-dynamic';

export default async function CreditsAdminPage() {
  await requireAdmin();
  const [accounts, stats] = await Promise.all([
    listCreditsAccounts(50),
    getCreditsStats(),
  ]);

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Boykot Credits</h1>
      <p className="text-sm text-gray-500 mb-8">
        Wallet cerrado por cliente — recargas vía MP, se descuenta en compras.
        <em className="text-amber-700"> Pre-launch:</em> el ajuste manual está activo, pero el flujo
        de recarga/débito automático se conecta al checkout en próxima iteración.
      </p>

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Cuentas activas" value={stats.totalAccounts.toString()} />
        <StatCard label="Saldo total CLP" value={`$${stats.totalBalance.toLocaleString('es-CL')}`} />
        <StatCard label="Recargado histórico" value={`$${stats.totalTopup.toLocaleString('es-CL')}`} />
        <StatCard label="Gastado histórico" value={`$${stats.totalSpent.toLocaleString('es-CL')}`} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10 text-center">
        <TierCard tier="basic" count={stats.byTier.basic} hint="hasta $100k acumulado" />
        <TierCard tier="plus" count={stats.byTier.plus} hint="$100k - $500k" />
        <TierCard tier="club" count={stats.byTier.club} hint="$500k+ Boykot Club" />
      </div>

      {/* Ajuste manual */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-8">
        <h2 className="font-bold text-gray-900 mb-2">Ajuste manual</h2>
        <p className="text-xs text-gray-500 mb-4">
          Crear cuenta + agregar saldo. Usá para regalos, ajustes, bonos por errores de envío, etc.
        </p>
        <CreditsAdjustForm />
      </div>

      {/* Cuentas existentes */}
      <h2 className="font-bold text-gray-900 mb-3">Top 50 cuentas por saldo</h2>
      {accounts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-sm text-gray-500">
          Aún no hay cuentas. Creá la primera con el ajuste manual de arriba.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-left px-4 py-2">Tier</th>
                <th className="text-right px-4 py-2">Saldo CLP</th>
                <th className="text-right px-4 py-2">Total Recarga</th>
                <th className="text-right px-4 py-2">Total Gastado</th>
                <th className="text-left px-4 py-2">Última act.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.map(a => (
                <tr key={a.id}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-900">{a.customer_name || a.customer_email}</div>
                    <div className="text-xs text-gray-500">{a.customer_email}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      a.tier === 'club' ? 'bg-amber-100 text-amber-800' :
                      a.tier === 'plus' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.tier}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    ${a.balance_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    ${a.total_topup_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    ${a.total_spent_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {new Date(a.updated_at).toLocaleDateString('es-CL')}
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
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function TierCard({ tier, count, hint }: { tier: string; count: number; hint: string }) {
  const colorMap: Record<string, string> = {
    basic: 'bg-gray-50 text-gray-700',
    plus: 'bg-blue-50 text-blue-800',
    club: 'bg-amber-50 text-amber-800',
  };
  return (
    <div className={`rounded-lg p-4 ${colorMap[tier]}`}>
      <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Tier {tier}</div>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs opacity-70 mt-1">{hint}</div>
    </div>
  );
}
