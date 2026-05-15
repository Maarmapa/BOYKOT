import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login?next=/perfil');

  const user = data.user;
  const meta = (user.user_metadata || {}) as { nombre?: string; rut?: string };

  return (
    <main className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
          Mi cuenta
        </div>
        <h1 className="text-4xl text-gray-900 mb-2">Hola, {meta.nombre || user.email}</h1>
        <p className="text-gray-600 mb-10">Tu perfil de Boykot.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link
            href="/pedidos"
            className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition-colors"
          >
            <div className="text-2xl mb-1">📦</div>
            <div className="font-semibold text-gray-900">Mis pedidos</div>
            <p className="text-sm text-gray-600 mt-1">Historial y seguimiento.</p>
          </Link>
          <Link
            href="/carrito"
            className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition-colors"
          >
            <div className="text-2xl mb-1">🛒</div>
            <div className="font-semibold text-gray-900">Mi carrito</div>
            <p className="text-sm text-gray-600 mt-1">Lo que tenés guardado ahora.</p>
          </Link>
          <Link
            href="/b2b"
            className="border border-gray-100 rounded-xl p-5 hover:border-gray-300 transition-colors"
          >
            <div className="text-2xl mb-1">🏢</div>
            <div className="font-semibold text-gray-900">B2B / Mayorista</div>
            <p className="text-sm text-gray-600 mt-1">Acceso a precios y factura.</p>
          </Link>
        </div>

        <section className="border-t border-gray-100 pt-8">
          <h2 className="text-2xl text-gray-900 mb-4">Datos de cuenta</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900 font-medium">{user.email}</dd>
            </div>
            {meta.nombre && (
              <div>
                <dt className="text-gray-500">Nombre</dt>
                <dd className="text-gray-900 font-medium">{meta.nombre}</dd>
              </div>
            )}
            {meta.rut && (
              <div>
                <dt className="text-gray-500">RUT</dt>
                <dd className="text-gray-900 font-medium">{meta.rut}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Cuenta creada</dt>
              <dd className="text-gray-900 font-medium">
                {new Date(user.created_at).toLocaleDateString('es-CL')}
              </dd>
            </div>
          </dl>
        </section>

        <form action="/auth/signout" method="post" className="mt-10">
          <button
            type="submit"
            className="text-sm text-gray-600 hover:text-gray-900 underline underline-offset-4"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
