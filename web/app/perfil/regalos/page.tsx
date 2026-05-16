import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { listGiftCardsForUser } from '@/lib/gift-cards';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mis gift cards · Boykot',
};

export default async function MyGiftCardsPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user || !data.user.email) redirect('/login?next=/perfil/regalos');

  const { bought, received } = await listGiftCardsForUser(data.user.email);

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <Link href="/perfil" className="hover:text-white">Perfil</Link> /{' '}
            <span className="text-gray-300">Gift cards</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl mb-1">Mis gift cards</h1>
          <p className="text-sm text-gray-400">
            Las que compraste para regalar y las que te enviaron.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Compradas */}
        <section>
          <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
            🎁 Compradas por mí ({bought.length})
          </h2>
          {bought.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">Aún no compraste gift cards.</p>
              <Link
                href="/regalo"
                className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider"
              >
                Comprar una
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {bought.map(gc => (
                <div key={gc.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono font-bold text-gray-900 text-sm">{gc.code}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {gc.recipient_email && `Para: ${gc.recipient_name || gc.recipient_email} · `}
                      {new Date(gc.created_at).toLocaleDateString('es-CL')}
                    </div>
                    {gc.message && (
                      <div className="text-xs text-gray-700 italic mt-1">"{gc.message}"</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-lg">
                      ${gc.amount_clp.toLocaleString('es-CL')}
                    </div>
                    <StatusBadge status={gc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recibidas */}
        <section>
          <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
            ✨ Recibidas / Canjeadas ({received.length})
          </h2>
          {received.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-500 mb-4">No tenés gift cards recibidas todavía.</p>
              <Link
                href="/regalo/canjear"
                className="inline-block border border-gray-300 text-gray-900 px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider hover:border-gray-900"
              >
                Canjear código
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {received.map(gc => (
                <div key={gc.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono font-bold text-gray-900 text-sm">{gc.code}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      De: {gc.buyer_name || gc.buyer_email}
                    </div>
                    {gc.message && (
                      <div className="text-xs text-gray-700 italic mt-1">"{gc.message}"</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-lg">
                      ${gc.amount_clp.toLocaleString('es-CL')}
                    </div>
                    <StatusBadge status={gc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-center text-sm">
          <Link href="/perfil" className="text-gray-600 hover:text-gray-900">← Volver a perfil</Link>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Activa', color: 'bg-emerald-100 text-emerald-800' },
    redeemed: { label: 'Canjeada', color: 'bg-blue-100 text-blue-800' },
    expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-600' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
  };
  const s = map[status] || map.active;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${s.color}`}>
      {s.label}
    </span>
  );
}
