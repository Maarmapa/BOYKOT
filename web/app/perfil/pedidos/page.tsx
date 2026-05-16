import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import { listOrdersByEmail } from '@/lib/pending-orders';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mis pedidos · Boykot',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'En espera', color: 'bg-gray-100 text-gray-700' },
  contacted: { label: 'En contacto', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completado', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default async function MisPedidosPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login?next=/perfil/pedidos');
  if (!data.user.email) redirect('/perfil');

  const orders = await listOrdersByEmail(data.user.email);

  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <Link href="/perfil" className="hover:text-white">Perfil</Link> /{' '}
            <span className="text-gray-300">Pedidos</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl mb-1 leading-tight">Mis pedidos</h1>
          <p className="text-sm text-gray-400">{orders.length} pedidos totales</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {orders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl text-gray-900 mb-2">Aún no hay pedidos</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
              Cuando hagas tu primera compra aparecerá acá con todo el detalle, status del envío y links de pago.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/tienda"
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-700"
              >
                Ir a comprar
              </Link>
              <Link
                href="/perfil"
                className="inline-block border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:border-gray-900"
              >
                Volver al perfil
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const date = new Date(order.created_at).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });
              return (
                <Link
                  key={order.id}
                  href={`/pedido/${order.short_id}`}
                  className="block bg-white border border-gray-200 hover:border-gray-900 rounded-xl p-5 transition-all hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Pedido</div>
                      <div className="font-mono font-bold text-gray-900">{order.short_id}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${status.color}`}>
                        {status.label}
                      </span>
                      {order.payment_status === 'paid' && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                          ✓ Pagado
                        </span>
                      )}
                      <div className="text-sm text-gray-500">{date}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'producto' : 'productos'}
                    </div>
                    <div className="font-bold text-gray-900 text-lg">
                      ${order.total_clp.toLocaleString('es-CL')}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
