'use client';

import Link from 'next/link';
import { useCart } from '@/lib/use-cart';
import ScrollToTop from '@/components/ScrollToTop';

const FREE_SHIPPING_THRESHOLD = 50_000;
const FLAT_SHIPPING = 4_990;

export default function CartPage() {
  const { cart, loading, setItem, removeItem } = useCart();

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-gray-500">Cargando carro…</div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Tu carro está vacío</h1>
          <p className="text-gray-500 mb-6">Empezá agregando colores desde una carta.</p>
          <Link
            href="/colores"
            className="inline-block text-white px-5 py-2.5 rounded-md font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0066ff' }}
          >
            Ver cartas de color
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = cart.items.reduce((s, i) => s + i.unit_price_clp * i.qty, 0);
  const totalUnits = cart.items.reduce((s, i) => s + i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;
  const toFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items column */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carro</h1>
          <p className="text-xs text-gray-500 mb-6">
            {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'} · {cart.items.length} {cart.items.length === 1 ? 'color' : 'colores'}
          </p>
          <ul className="divide-y border border-gray-200 rounded-lg">
            {cart.items.map(item => (
              <li key={item.variant_id} className="p-4 flex items-center gap-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.color_code || item.name}
                    className="w-16 h-16 rounded object-cover bg-gray-50 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-mono text-xs text-gray-500 flex-shrink-0">
                    {item.color_code || '—'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ${item.unit_price_clp.toLocaleString('es-CL')} c/u
                  </div>
                </div>

                <div className="flex items-center gap-2 mr-2">
                  <button
                    onClick={() => setItem({
                      variant_id: item.variant_id,
                      product_id: item.product_id,
                      qty: Math.max(0, item.qty - 1),
                      unit_price_clp: item.unit_price_clp,
                      name: item.name,
                      image_url: item.image_url,
                      color_code: item.color_code,
                    })}
                    className="w-7 h-7 flex items-center justify-center text-base text-gray-700 hover:text-black"
                    aria-label="Restar"
                  >−</button>
                  <span className="font-mono text-sm w-5 text-center">{item.qty}</span>
                  <button
                    onClick={() => setItem({
                      variant_id: item.variant_id,
                      product_id: item.product_id,
                      qty: item.qty + 1,
                      unit_price_clp: item.unit_price_clp,
                      name: item.name,
                      image_url: item.image_url,
                      color_code: item.color_code,
                    })}
                    className="w-7 h-7 flex items-center justify-center text-base text-gray-700 hover:text-black"
                    aria-label="Sumar"
                  >+</button>
                </div>

                <div className="font-semibold w-24 text-right text-sm">
                  ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
                </div>

                <button
                  onClick={() => removeItem(item.variant_id)}
                  className="ml-2 text-gray-400 hover:text-red-600 text-xs"
                  aria-label="Eliminar"
                  title="Eliminar"
                >✕</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals column */}
        <aside className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Resumen
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  ${subtotal.toLocaleString('es-CL')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despacho</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                  {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`}
                </span>
              </div>
              {toFreeShip > 0 && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                  Te faltan <span className="font-semibold">${toFreeShip.toLocaleString('es-CL')}</span> para envío gratis.
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline">
              <span className="text-sm text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">
                ${total.toLocaleString('es-CL')}
              </span>
            </div>
            <button
              className="mt-6 w-full text-white py-3 rounded-md font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0066ff' }}
              onClick={() => { window.location.href = '/checkout'; }}
            >
              Ir a pagar →
            </button>
            <p className="text-[11px] text-gray-500 text-center mt-3">
              Stock reservado por 15 minutos
            </p>
            <Link
              href="/colores"
              className="block text-center text-sm text-gray-700 hover:text-gray-900 mt-4 underline underline-offset-4"
            >
              Seguir comprando
            </Link>
          </div>
        </aside>
      </div>
      <ScrollToTop />
    </main>
  );
}
