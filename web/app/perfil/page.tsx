import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { listOrdersByEmail } from '@/lib/pending-orders';
import { getCreditsAccount } from '@/lib/credits';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mi cuenta · Boykot',
};

export default async function PerfilPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login?next=/perfil');

  const user = data.user;
  const meta = (user.user_metadata || {}) as { nombre?: string; rut?: string };
  const email = user.email || '';

  // Cargar en paralelo
  const [orders, credits] = await Promise.all([
    email ? listOrdersByEmail(email, 5) : Promise.resolve([]),
    email ? getCreditsAccount(email) : Promise.resolve(null),
  ]);

  const recentOrders = orders.slice(0, 3);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Mi cuenta</span>
          </nav>
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase mb-2">
            Hola
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-1 leading-tight">
            {meta.nombre || email}
          </h1>
          <p className="text-sm text-gray-400 mt-2">{email}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">

        {/* Credits balance */}
        {credits && credits.balance_clp > 0 && (
          <section className="bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-wider text-amber-700 uppercase mb-1">
                  Boykot Credits · Tier {credits.tier}
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-amber-900 mb-1">
                  ${credits.balance_clp.toLocaleString('es-CL')}
                </div>
                <p className="text-sm text-amber-800">Saldo disponible para tu próxima compra</p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </section>
        )}

        {/* Atajos */}
        <section>
          <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
            Atajos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DashCard href="/perfil/pedidos" emoji="📦" label="Mis pedidos" count={orders.length} />
            <DashCard href="/perfil/favoritos" emoji="♡" label="Favoritos" />
            <DashCard href="/carrito" emoji="🛒" label="Carrito" />
            <DashCard href="/cotizador" emoji="📋" label="Cotizar B2B" />
          </div>
        </section>

        {/* Recent orders preview */}
        {recentOrders.length > 0 && (
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                Pedidos recientes
              </h2>
              <Link href="/perfil/pedidos" className="text-xs text-gray-600 hover:text-gray-900">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-2">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  href={`/pedido/${order.short_id}`}
                  className="block bg-white border border-gray-200 hover:border-gray-900 rounded-lg p-4 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-sm font-bold text-gray-900">{order.short_id}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}{order.items?.length || 0} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${order.total_clp.toLocaleString('es-CL')}</div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">{order.status}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Datos personales */}
        <section>
          <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
            Datos personales
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
            <Row label="Email" value={email} />
            <Row label="Nombre" value={meta.nombre} placeholder="Sin definir" />
            <Row label="RUT" value={meta.rut} placeholder="Sin definir" />
            <Row label="Cuenta creada" value={new Date(user.created_at).toLocaleDateString('es-CL')} />
          </div>
        </section>

        {/* B2B + Logout */}
        <section className="pt-4 border-t border-gray-200 flex items-center justify-between">
          <Link href="/b2b" className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4">
            Programa B2B / Mayoristas
          </Link>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 underline">
              Cerrar sesión
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function DashCard({ href, emoji, label, count }: { href: string; emoji: string; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 hover:border-gray-900 rounded-xl p-4 text-center transition-all hover:shadow-md"
    >
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      {typeof count === 'number' && (
        <div className="text-xs text-gray-500 mt-0.5">{count}</div>
      )}
    </Link>
  );
}

function Row({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400 italic'}>
        {value || placeholder || '—'}
      </span>
    </div>
  );
}
