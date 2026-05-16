import Link from 'next/link';
import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import { listConversations } from '@/lib/hermes/conversations';

export const dynamic = 'force-dynamic';

export default async function BotInboxPage() {
  await requireAdmin();
  const conversations = await listConversations(100);

  const channelIcon: Record<string, string> = {
    whatsapp: '💬',
    instagram: '📷',
    webchat: '💻',
  };

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Hermes · Inbox bot</h1>
      <p className="text-sm text-gray-500 mb-6">
        Conversaciones de IG y WhatsApp atendidas por el bot. Si una sale del flow,
        cambiá status a <strong>needs_human</strong> y respondé manual desde acá.
      </p>

      {conversations.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aún no hay conversaciones</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Cuando configures los webhooks de WhatsApp + Instagram en Meta Developer,
            los DMs entrantes aparecerán acá automáticamente.
          </p>
          <Link
            href="/admin/bot/setup"
            className="inline-block mt-4 text-sm text-blue-600 hover:underline"
          >
            Ver instrucciones de setup →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">Canal</th>
                <th className="text-left px-4 py-2">Cliente</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Última actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {conversations.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="text-lg">{channelIcon[c.channel] ?? '?'}</span>{' '}
                    <span className="text-xs text-gray-500 capitalize">{c.channel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bot/${c.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {c.customer_name || c.customer_handle || c.external_id}
                    </Link>
                    <div className="text-xs text-gray-500 font-mono">{c.external_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.status === 'needs_human' ? 'bg-amber-100 text-amber-800' :
                      c.status === 'resolved' ? 'bg-gray-100 text-gray-600' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.status === 'needs_human' ? 'requiere humano' :
                        c.status === 'resolved' ? 'resuelto' : 'activo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(c.last_message_at).toLocaleString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-xs text-gray-500">
        <Link href="/admin/bot/setup" className="hover:underline">
          ⚙️ Setup webhooks Meta →
        </Link>
      </div>
    </AdminChrome>
  );
}
