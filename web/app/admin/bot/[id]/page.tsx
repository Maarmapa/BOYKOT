import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';
import { listMessages, type Conversation } from '@/lib/hermes/conversations';

export const dynamic = 'force-dynamic';

export default async function BotConversationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) notFound();

  const { data: conv } = await supabaseAdmin()
    .from('bot_conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!conv) notFound();
  const c = conv as Conversation;

  const messages = await listMessages(id, 200);

  return (
    <AdminChrome>
      <div className="mb-6">
        <Link href="/admin/bot" className="text-sm text-gray-500 hover:text-gray-900">
          ← Volver al inbox
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {c.customer_name || c.customer_handle || c.external_id}
        </h1>
        <div className="text-sm text-gray-500">
          {c.channel} · {c.external_id} · status: <strong>{c.status}</strong>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 max-h-[70vh] overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-12">Sin mensajes aún.</div>
        ) : (
          messages.map(m => (
            <div
              key={m.id}
              className={`flex ${m.direction === 'in' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2.5 ${
                  m.direction === 'in'
                    ? 'bg-gray-100 text-gray-900'
                    : m.author === 'bot'
                    ? 'bg-blue-50 text-blue-900 border border-blue-100'
                    : 'bg-gray-900 text-white'
                }`}
              >
                <div className="text-xs opacity-60 mb-1 flex items-center gap-2">
                  <span>{m.direction === 'in' ? '👤 Cliente' : m.author === 'bot' ? '🤖 Hermes' : '👨‍💼 Tú'}</span>
                  <span>·</span>
                  <span>{new Date(m.created_at).toLocaleTimeString('es-CL')}</span>
                </div>
                <div className="whitespace-pre-wrap text-sm">{m.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        <em>Próxima iteración:</em> caja de reply para que respondas manual desde acá.
        Por ahora respondé directo en WhatsApp/IG y la conversación se actualizará en el inbox.
      </p>
    </AdminChrome>
  );
}
