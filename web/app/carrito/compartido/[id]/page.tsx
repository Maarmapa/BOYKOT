import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCart } from '@/lib/cart';
import SharedCartActions from './actions';

export const dynamic = 'force-dynamic';

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const cart = await getCart(id);
  if (!cart) return { title: 'Carrito no encontrado · Boykot' };
  return {
    title: `Carrito compartido · ${cart.items.length} items · Boykot`,
    description: `Lista de productos compartida · Total $${cart.total_clp.toLocaleString('es-CL')}`,
    robots: { index: false, follow: false },
  };
}

export default async function SharedCartPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const cart = await getCart(id);
  if (!cart) notFound();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <nav className="text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Carrito compartido</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl mb-1">Lista compartida</h1>
          <p className="text-sm text-gray-400">
            {cart.items.length} producto{cart.items.length === 1 ? '' : 's'} ·{' '}
            <strong className="text-white">${cart.total_clp.toLocaleString('es-CL')}</strong> CLP
          </p>
        </div>
      </section>

      {cart.items.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-gray-500">Este carrito está vacío.</p>
          <Link
            href="/tienda"
            className="mt-4 inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {cart.items.map((item, idx) => (
                <div
                  key={`${item.variant_id}-${idx}`}
                  className={`flex items-center gap-4 p-4 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.color_code && (
                      <div className="text-xs text-gray-500 mt-0.5">{item.color_code}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">× {item.qty}</div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold">
                      ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
                    </div>
                    {item.qty > 1 && (
                      <div className="text-[10px] text-gray-500">
                        ${item.unit_price_clp.toLocaleString('es-CL')} c/u
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-t-2 border-gray-900 p-4 flex justify-between font-bold">
                <span>Total</span>
                <span className="font-mono">${cart.total_clp.toLocaleString('es-CL')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6">
              <SharedCartActions cartId={cart.id} itemCount={cart.items.length} />
            </div>
          </section>

          {/* Info */}
          <section className="bg-gray-50 border-t border-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-sm text-gray-600 leading-relaxed">
              <h2 className="text-base font-bold text-gray-900 mb-2">¿Cómo funciona?</h2>
              <p className="mb-2">
                Esta es una lista de productos compartida. Para comprarla:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Click en "Copiar a mi carrito" abajo</li>
                <li>Te lleva al checkout con los items ya cargados</li>
                <li>Completás envío + pago como cualquier compra</li>
              </ol>
              <p className="mt-3 text-xs text-gray-500">
                Los precios pueden haber cambiado desde que se compartió esta lista.
                Se confirman al momento de pagar.
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
