import Link from 'next/link';
import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface AuditRow {
  id: number;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
}

export default async function AuditLogPage() {
  await requireAdmin();
  const { data } = await supabaseAdmin()
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  const rows = (data ?? []) as AuditRow[];

  const byActor: Record<string, number> = {};
  for (const r of rows) byActor[r.actor] = (byActor[r.actor] || 0) + 1;

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Audit log</h1>
      <p className="text-sm text-gray-500 mb-6">
        Trail append-only de acciones (admin + webhooks + sistema). Últimos 500.
      </p>

      {/* Actor breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Actores activos</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(byActor).map(([actor, count]) => (
            <span key={actor} className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
              {actor}: <strong>{count}</strong>
            </span>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <div className="text-4xl mb-2">📜</div>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Aún no hay entries en el log. Las mutaciones se van agregando automáticamente
            cuando se ejecutan via API o webhook (lib/audit.ts).
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">Cuándo</th>
                <th className="text-left px-4 py-2">Actor</th>
                <th className="text-left px-4 py-2">Acción</th>
                <th className="text-left px-4 py-2">Entidad</th>
                <th className="text-left px-4 py-2">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {r.actor}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-medium text-gray-900">{r.action}</td>
                  <td className="px-4 py-2.5 text-xs">
                    <span className="text-gray-600">{r.entity_type}</span>
                    {r.entity_id && (
                      <span className="font-mono text-gray-900 ml-1">{r.entity_id}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-600 max-w-xs truncate font-mono">
                    {r.details ? JSON.stringify(r.details).slice(0, 100) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        💡 Para más entries, integrar <code>audit()</code> de <code>lib/audit.ts</code> en mutaciones.
      </div>
    </AdminChrome>
  );
}
