import Link from 'next/link';

export const metadata = {
  title: 'Cómo comprar · Boykot',
  description: 'Métodos de pago, despacho, retiro en tienda y políticas de devolución de Boykot.',
};

const STEPS = [
  { num: 1, title: 'Elegí tus colores', body: 'En cualquier carta de color (Copic, Angelus, Holbein, Molotow, etc.), usá el botón + para agregar al carro.' },
  { num: 2, title: 'Revisá tu carro', body: 'Modificá cantidades, agregá más colores o eliminá los que no querés.' },
  { num: 3, title: 'Pagá seguro', body: 'Tarjeta de crédito/débito vía Transbank WebPay (próximamente), MercadoPago o transferencia bancaria.' },
  { num: 4, title: 'Recibí o retirá', body: 'Despacho a todo Chile en 2-5 días hábiles, o retiro en nuestra tienda en Providencia.' },
];

const PAY = [
  { name: 'Transbank WebPay', detail: 'Crédito y débito (en cola)' },
  { name: 'MercadoPago', detail: 'Crédito, débito, transferencia (en cola)' },
  { name: 'Transferencia bancaria', detail: 'Banco Estado / Santander / BCI' },
  { name: 'Efectivo en tienda', detail: 'Solo para retiro en Providencia' },
];

const SHIP = [
  { zone: 'Retiro en tienda', cost: 'Gratis', time: 'Mismo día (lun-sáb)' },
  { zone: 'Santiago / RM', cost: 'Desde $4.990', time: '24-48 hrs (Starken / Chilexpress)' },
  { zone: 'Regiones', cost: 'Desde $5.990', time: '2-5 días hábiles' },
  { zone: 'Envío gratis', cost: '$0', time: 'En compras sobre $50.000' },
];

export default function ComoComprarPage() {
  return (
    <main className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <span className="text-gray-700">Cómo comprar</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Cómo comprar en Boykot</h1>
          <p className="text-gray-600 max-w-2xl">
            Cuatro pasos. Despacho a todo Chile, retiro en tienda, factura electrónica para mayoristas.
          </p>
        </header>

        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(s => (
              <div key={s.num} className="border border-gray-100 rounded-lg p-5">
                <div className="text-3xl font-bold text-gray-200 mb-2">{s.num}</div>
                <div className="font-semibold text-gray-900 mb-1">{s.title}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Medios de pago</h2>
          <div className="border border-gray-100 rounded-lg divide-y">
            {PAY.map(p => (
              <div key={p.name} className="flex items-center justify-between p-4">
                <span className="font-medium text-gray-900">{p.name}</span>
                <span className="text-sm text-gray-500">{p.detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Despacho</h2>
          <div className="border border-gray-100 rounded-lg divide-y">
            {SHIP.map(s => (
              <div key={s.zone} className="flex items-center justify-between p-4">
                <span className="font-medium text-gray-900">{s.zone}</span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{s.cost}</div>
                  <div className="text-xs text-gray-500">{s.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">Devoluciones</h2>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>
              Tenés <strong>10 días corridos</strong> desde la recepción del pedido para cambios o devoluciones, siempre que el producto esté sin abrir y en sus condiciones originales.
              Escribinos a <a href="mailto:providencia@boykot.cl" className="text-gray-900 underline">providencia@boykot.cl</a> con el número de pedido.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-4">¿Tenés dudas?</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/contacto" className="text-white px-5 py-2.5 rounded-md font-medium hover:opacity-90"
              style={{ backgroundColor: '#0066ff' }}>
              Escribinos
            </Link>
            <a href="https://wa.me/56223350961" target="_blank" rel="noopener noreferrer"
              className="border border-gray-200 text-gray-900 px-5 py-2.5 rounded-md font-medium hover:border-gray-400">
              WhatsApp
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
