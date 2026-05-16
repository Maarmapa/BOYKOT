'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/use-cart';

const FREE_SHIPPING_THRESHOLD = 50_000;
const FLAT_SHIPPING = 4_990;

export default function CheckoutPage() {
  const { cart, loading } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ short_id: string; whatsapp_url: string } | null>(null);

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const store_pickup = fd.get('store_pickup') === 'on';

    const body = {
      customer: {
        name: String(fd.get('full_name') || '').trim(),
        email: String(fd.get('email') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        rut: String(fd.get('rut') || '').trim() || undefined,
      },
      shipping: {
        address: store_pickup ? undefined : String(fd.get('address') || '').trim(),
        city: store_pickup ? undefined : String(fd.get('city') || '').trim(),
        store_pickup,
      },
      items: (cart?.items ?? []).map(i => ({
        variant_id: i.variant_id,
        name: i.name,
        color_code: i.color_code,
        qty: i.qty,
        unit_price_clp: i.unit_price_clp,
      })),
      subtotal_clp: subtotal,
      shipping_clp: shipping,
      total_clp: total,
      notes: String(fd.get('notes') || '').trim() || undefined,
    };

    try {
      const res = await fetch('/api/checkout/whatsapp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falló al crear el pedido');
      setSuccess({ short_id: data.short_id, whatsapp_url: data.whatsapp_url });
      // Abrir WhatsApp automáticamente en nueva pestaña
      window.open(data.whatsapp_url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-3xl mb-2">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido creado!</h1>
            <p className="text-sm text-green-800 mb-1">
              Número de pedido: <strong className="font-mono">{success.short_id}</strong>
            </p>
            <p className="text-sm text-gray-700">
              Abrí WhatsApp con tu pedido pre-llenado. Apretá <strong>Enviar</strong> y te
              confirmamos stock + te mandamos el link de pago.
            </p>
          </div>

          <a
            href={success.whatsapp_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-white py-3.5 rounded-md font-semibold transition-opacity hover:opacity-90 mb-3"
            style={{ backgroundColor: '#25D366' }}
          >
            Abrir WhatsApp con tu pedido →
          </a>

          <p className="text-xs text-gray-500 text-center">
            ¿No se abrió solo? <a href={success.whatsapp_url} target="_blank" rel="noopener noreferrer" className="underline">Click acá</a>.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">¿Qué pasa ahora?</h2>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Mandás el mensaje por WhatsApp (tu pedido va pre-llenado).</li>
              <li>Te confirmamos stock disponible en máx 2h hábiles.</li>
              <li>Te mandamos link de pago (Webpay / transferencia / Khipu).</li>
              <li>Despacho 24-48h o retiro en tienda.</li>
            </ol>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Finalizá tu pedido</h1>
          <p className="text-sm text-gray-500 mb-6">
            Te enviamos a WhatsApp con tu carro pre-llenado. Confirmamos stock + link de pago en máx 2h hábiles.
          </p>

          <form className="space-y-5" onSubmit={onSubmit}>
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Contacto
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="full_name" placeholder="Nombre completo" required
                  className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600" />
                <input name="email" type="email" placeholder="Email" required
                  className="border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600" />
                <input name="phone" type="tel" placeholder="Teléfono (+56 9 ...)" required
                  className="border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600" />
                <input name="rut" placeholder="RUT (opcional, para boleta)" className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600" />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Despacho
              </legend>
              <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                <input type="checkbox" name="store_pickup" />
                Retiro en tienda (Av. Providencia 2251, local 69)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="address" placeholder="Dirección"
                  className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600" />
                <input name="city" placeholder="Comuna / Ciudad"
                  className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600" />
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Notas (opcional)
              </legend>
              <textarea name="notes" rows={3} placeholder="Algo que necesitemos saber? (urgencia, regalo, etc.)"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white text-gray-900 placeholder:text-gray-500 outline-none focus:border-gray-600 resize-none" />
            </fieldset>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white py-3.5 rounded-md font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#25D366' }}
            >
              {submitting ? (
                'Generando pedido…'
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.6-1.4-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.8-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.7 2.7 4.2 3.7 1.5.6 2.1.7 2.8.6.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3z"/>
                    <path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.2.8.8-3.1-.2-.3C3.9 14.7 3.5 13.4 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z"/>
                  </svg>
                  Enviar por WhatsApp · ${total.toLocaleString('es-CL')}
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Al confirmar abrís WhatsApp con tu pedido pre-llenado. Pagás cuando confirmemos stock.
            </p>
          </form>
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sticky top-4">
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
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="text-gray-900 font-medium">${subtotal.toLocaleString('es-CL')}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Despacho</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900 font-medium'}>
                  {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-CL')}`}
                </span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">${total.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
