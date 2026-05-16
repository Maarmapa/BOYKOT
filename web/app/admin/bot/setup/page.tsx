import Link from 'next/link';
import { requireAdmin } from '../../layout';
import AdminChrome from '@/components/admin/Chrome';

export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export default async function BotSetupPage() {
  await requireAdmin();

  const verifyToken = '(genera uno: openssl rand -hex 16)';

  return (
    <AdminChrome>
      <Link href="/admin/bot" className="text-sm text-gray-500 hover:text-gray-900">
        ← Volver al inbox
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">Setup Hermes Bot</h1>
      <p className="text-sm text-gray-500 mb-8">
        Pasos para activar respuesta automática en Instagram + WhatsApp.
      </p>

      <Section step="1" title="Env vars en Vercel">
        <p>Settings → Environment Variables. Setea estas:</p>
        <pre className="bg-gray-900 text-white text-xs p-3 rounded my-3 overflow-x-auto">
{`ANTHROPIC_API_KEY=sk-ant-...
META_WEBHOOK_VERIFY_TOKEN=${verifyToken}
META_APP_SECRET=<de Meta App → Settings → Basic → App Secret>

# Para WhatsApp Cloud API:
WHATSAPP_PHONE_ID=<phone_number_id de WhatsApp Business>
WHATSAPP_TOKEN=<system user access token, permanente>

# Para Instagram:
INSTAGRAM_PAGE_ID=<id de la Facebook Page conectada al IG>
INSTAGRAM_TOKEN=<page access token permanente>`}
        </pre>
        <p className="text-xs text-gray-500">
          El <code>ANTHROPIC_API_KEY</code> se obtiene en{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            console.anthropic.com
          </a>.
        </p>
      </Section>

      <Section step="2" title="Crear Meta App (si no existe)">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Andá a <a className="text-blue-600 hover:underline" href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">developers.facebook.com/apps</a></li>
          <li>Create App → Use case: <strong>Other</strong> → Type: <strong>Business</strong></li>
          <li>Conectá tu Business Manager (donde está la Page de Boykot)</li>
          <li>Agregá productos: <strong>WhatsApp</strong> + <strong>Instagram</strong> + <strong>Webhooks</strong></li>
        </ol>
      </Section>

      <Section step="3" title="WhatsApp Business webhook">
        <p>Meta App → WhatsApp → Configuration → Webhook:</p>
        <ul className="space-y-1 mt-2">
          <li><strong>Callback URL:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{SITE}/api/bot/whatsapp/webhook</code></li>
          <li><strong>Verify Token:</strong> el mismo <code>META_WEBHOOK_VERIFY_TOKEN</code> de arriba</li>
          <li><strong>Webhook fields:</strong> <code>messages</code> ✓</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          Después, en API Setup, copiá el <strong>phone_number_id</strong> y el <strong>system user access token</strong>{' '}
          (no el temporal de 24hr — genera uno permanente en Business Settings → System Users).
        </p>
      </Section>

      <Section step="4" title="Instagram webhook">
        <p>Meta App → Messenger / Instagram → Webhooks:</p>
        <ul className="space-y-1 mt-2">
          <li><strong>Callback URL:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{SITE}/api/bot/instagram/webhook</code></li>
          <li><strong>Verify Token:</strong> el mismo <code>META_WEBHOOK_VERIFY_TOKEN</code></li>
          <li><strong>Subscriptions:</strong> <code>messages</code> + <code>messaging_postbacks</code> ✓</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          La cuenta IG debe estar conectada a una <strong>Facebook Page</strong>. El{' '}
          <code>INSTAGRAM_PAGE_ID</code> es el id de esa Page, no del IG directo.
          El <code>INSTAGRAM_TOKEN</code> es un Page Access Token permanente.
        </p>
      </Section>

      <Section step="5" title="Test manual">
        <p>Una vez configurado:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-1">
          <li>Mandate un mensaje al WhatsApp Business o IG de Boykot</li>
          <li>Volvé a <Link href="/admin/bot" className="text-blue-600 hover:underline">Inbox</Link> — debería aparecer la conversación</li>
          <li>Si Hermes contesta, perfecto. Si no, revisá Vercel logs <code>/api/bot/*/webhook</code></li>
        </ol>
      </Section>

      <Section step="6" title="Marcar como needs_human">
        <p>
          Si una conversación requiere atención manual (queja, asesoría técnica compleja, etc),
          podés marcarla — el bot dejará de responder hasta que resuelvas.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <em>Próxima iteración:</em> caja de reply para responder desde admin sin salir.
        </p>
      </Section>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-sm mt-6">
        <strong>⚠️ Importante</strong>: WhatsApp Business API requiere <strong>verificación de tu negocio</strong>{' '}
        en Meta Business Manager (Tax ID, business docs). Sin esto solo podés mandar mensajes a tu propio número de test.
        El onboarding de Meta puede tardar 1-2 semanas.
      </div>
    </AdminChrome>
  );
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Paso {step}</span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </section>
  );
}
