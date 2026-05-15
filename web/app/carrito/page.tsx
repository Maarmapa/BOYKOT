'use client';

import { useCart } from '@/lib/use-cart';

export default function CartPage() {
  const { cart, loading } = useCart();

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-gray-500">Cargando carro…</p>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carro está vacío</h1>
          <p className="text-gray-500 mb-6">Empezá agregando colores desde una carta.</p>
          <a href="/colores" className="inline-block bg-orange-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-600">
            Ver cartas de color
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tu carro ({cart.items.length})</h1>
        <ul className="divide-y border rounded-xl bg-white">
          {cart.items.map(item => (
            <li key={`${item.variant_id}`} className="p-4 flex items-center gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded object-cover" />
              ) : (
                <div className="w-14 h-14 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-mono text-xs text-gray-500">
                  {item.color_code || '—'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{item.name}</div>
                <div className="text-sm text-gray-500">${item.unit_price_clp.toLocaleString('es-CL')} c/u</div>
              </div>
              <div className="font-mono text-sm">× {item.qty}</div>
              <div className="font-semibold w-24 text-right">
                ${(item.unit_price_clp * item.qty).toLocaleString('es-CL')}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between items-end border-t pt-4">
          <div className="text-sm text-gray-500">
            Reserva temporal de stock (15 min). El stock se confirma al pagar.
          </div>
          <div>
            <div className="text-sm text-gray-500">Subtotal</div>
            <div className="text-2xl font-bold text-gray-900">${cart.subtotal_clp.toLocaleString('es-CL')}</div>
          </div>
        </div>
        <button className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold">
          Ir a pagar →
        </button>
      </div>
    </main>
  );
}
