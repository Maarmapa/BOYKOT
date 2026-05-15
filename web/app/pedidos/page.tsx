import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function PedidosPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login?next=/pedidos');

  // TODO: pull from BSale documents API once checkout lands. For now an empty state.
  const pedidos: Array<{ id: string; fecha: string; total: number; estado: string }> = [];

  return (
    <main className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
          Mi cuenta
        </div>
        <h1 className="text-4xl text-gray-900 mb-2">Mis pedidos</h1>
        <p className="text-gray-600 mb-10">Historial completo de tus compras.</p>

        {pedidos.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center">
            <div className="text-5xl mb-3">📦</div>
            <h2 className="text-xl text-gray-900 mb-2">Aún no tenés pedidos</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Cuando completes una compra, vas a verla acá con estado, tracking y boleta/factura.
            </p>
            <Link
              href="/colores"
              className="inline-block px-6 py-3 text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm uppercase tracking-wider"
              style={{ backgroundColor: '#0066ff' }}
            >
              Explorar cartas de color
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 border-y border-gray-100">
            {pedidos.map(p => (
              <li key={p.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">#{p.id}</div>
                  <div className="text-xs text-gray-500">{p.fecha}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${p.total.toLocaleString('es-CL')}</div>
                  <div className="text-xs text-gray-500">{p.estado}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
