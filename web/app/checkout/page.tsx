'use client';

import Link from 'next/link';
import { useCart } from '@/lib/use-cart';

const FREE_SHIPPING_THRESHOLD = 50_000;
const FLAT_SHIPPING = 4_990;

export default function CheckoutPage() {
  const { cart, loading } = useCart();

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-gray-500">Cargando…</div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">No hay nada para pagar</h1>
          <p className="text-gray-500 mb-6">Agregá colores al carro primero.</p>
          <Link
            href="/colores"
            className="inline-block text-white px-5 py-2.5 rounded-md font-semibold hover:opacity-90"
            style={{ backgroundColor: '#0066ff' }}
          >
            Ver cartas de color
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = cart.items.reduce((s, i) => s + i.unit_price_clp * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Datos de despacho y pago</h1>

          <form
            className="space-y-5"
            onSubmit={e => {
              e.preventDefault();
              alert('Checkout aún no conectado al provider de pago. En cola: Transbank / Stripe / MercadoPago.');
            }}
          >
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Contacto
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="email" type="email" placeholder="Email" required
                  className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
                <input name="phone" type="tel" placeholder="Teléfono" required
                  className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Despacho
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="full_name" placeholder="Nombre completo" required
                  className="sm:col-span-2 border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
                <input name="rut" placeholder="RUT (12345678-9)"
                  className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
                <input name="city" placeholder="Ciudad / Comuna" required
                  className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
                <input name="address" placeholder="Dirección" required
                  className="sm:col-span-2 border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm text-gray-700">
                <input type="checkbox" name="store_pickup" />
                Retiro en tienda (Av. Providencia 2251, local 69)
              </label>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Pago
              </legend>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm border border-gray-200 rounded-md p-3 cursor-pointer hover:border-gray-400">
                  <input type="radio" name="payment" value="transbank" defaultChecked />
                  <span>Tarjeta crédito / débito (Transbank WebPay) — <span className="text-gray-400">en cola</span></span>
                </label>
                <label className="flex items-center gap-2 text-sm border border-gray-200 rounded-md p-3 cursor-pointer hover:border-gray-400">
                  <input type="radio" name="payment" value="mercadopago" />
                  <span>MercadoPago — <span className="text-gray-400">en cola</span></span>
                </label>
                <label className="flex items-center gap-2 text-sm border border-gray-200 rounded-md p-3 cursor-pointer hover:border-gray-400">
                  <input type="radio" name="payment" value="transfer" />
                  <span>Transferencia bancaria</span>
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              className="mt-2 w-full text-white py-3.5 rounded-md font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0066ff' }}
            >
              Pagar ${total.toLocaleString('es-CL')}
            </button>
          </form>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Tu pedido</h2>
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {cart.items.map(item => (
                <li key={item.variant_id} className="flex items-center gap-3 text-sm">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.color_code || item.name} className="w-10 h-10 rounded object-cover bg-white" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-mono text-[10px] text-gray-500">
                      {item.color_code || '—'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-700 truncate">{item.name}</div>
                    <div className="text-[11px] text-gray-500">× {item.qty}</div>
                  </div>
                  <div className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                    ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 mt-4 pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toLocaleString('es-CL')}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despacho</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-xl font-bold">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
