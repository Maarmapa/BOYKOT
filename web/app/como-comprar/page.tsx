import Link from 'next/link';

export const metadata = {
  title: 'Cómo comprar · Boykot — Pagos, despacho y FAQs',
  description: 'Métodos de pago, despacho a todo Chile, retiro en tienda, factura electrónica y políticas de devolución de Boykot.',
};

const STEPS = [
  { num: 1, title: 'Elegí tus colores', body: 'En cualquier carta de color (Copic, Angelus, Holbein, Molotow), usá el botón + para agregar al carro.' },
  { num: 2, title: 'Revisá tu carro', body: 'Modificá cantidades, agregá más colores o eliminá los que no querés. Vas viendo el total en vivo.' },
  { num: 3, title: 'Pagá seguro', body: 'Tarjeta crédito/débito + Apple Pay + Google Pay + Khipu + transferencia, todo vía Mercado Pago.' },
  { num: 4, title: 'Recibí o retirá', body: 'Despacho 24-48 hrs a todo Chile (Starken/Chilexpress) o retiro en tienda Providencia.' },
];

const PAY = [
  { name: 'Mercado Pago', detail: 'Crédito + débito + Apple Pay + Google Pay + Khipu + transferencia. Activo.' },
  { name: 'Boykot Credits', detail: 'Wallet pre-cargada con saldo. Para clientes recurrentes.' },
  { name: 'Transferencia bancaria', detail: 'Banco Estado / Santander / BCI. Para B2B.' },
  { name: 'Efectivo en tienda', detail: 'Solo para retiro en Providencia 2251.' },
  { name: 'Factura electrónica B2B', detail: 'Automática vía BSale para clientes mayoristas.' },
  { name: 'x402 USDC (lab)', detail: 'Para pagos agentic. Endpoint /api/agentic/buy.' },
];

const SHIP = [
  { zone: 'Retiro en tienda', cost: 'Gratis', time: 'Mismo día (Lun-Sáb 10:00–18:00)' },
  { zone: 'Santiago / RM', cost: 'Desde $4.990', time: '24-48 hrs hábiles' },
  { zone: 'Regiones', cost: 'Desde $5.990', time: '2-5 días hábiles' },
  { zone: 'Envío gratis', cost: '$0', time: 'En compras sobre $50.000' },
];

const FAQ = [
  {
    q: '¿Cuánto demora el despacho?',
    a: 'Santiago y RM: 24-48 hrs hábiles. Regiones: 2-5 días hábiles. Operamos con Starken y Chilexpress. Te llega tracking al email cuando despachamos.',
  },
  {
    q: '¿Puedo retirar en la tienda?',
    a: 'Sí. Marcá "Retiro en tienda" en checkout. Cuando esté listo te avisamos por WhatsApp para que pases por Av. Providencia 2251, local 69 (Metro Los Leones). Horario Lun-Vie 10-18, Sáb 10-15.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Mercado Pago (crédito + débito + Apple Pay + Google Pay + Khipu + transferencia), Boykot Credits para clientes recurrentes, transferencia bancaria directa, y efectivo si retirás en la tienda. Para B2B emitimos factura electrónica automática.',
  },
  {
    q: '¿Hacen envío gratis?',
    a: 'Sí, en todas las compras sobre $50.000 CLP a cualquier parte de Chile.',
  },
  {
    q: '¿Puedo devolver un producto?',
    a: 'Sí, dentro de 10 días corridos desde la entrega, con producto en su empaque original sin uso. Costo de envío de devolución a cargo del cliente, salvo defecto de fábrica.',
  },
  {
    q: '¿Son distribuidores oficiales?',
    a: 'Sí. Copic (desde 2014), Angelus (2018) y Holbein (2021). Importamos directo de fábrica, no son paralelos ni falsificados. Garantía de marca.',
  },
  {
    q: '¿Tienen precios mayoristas?',
    a: 'Sí. Si tu negocio es tienda, escuela, taller o productora, accedé al portal B2B en /b2b para precios mayoristas + factura electrónica automática.',
  },
  {
    q: '¿Cotizan para fondos públicos / licitaciones?',
    a: 'Sí. Usá /cotizador para generar cotización formal PDF con RUT, IVA, vigencia 30 días. Funciona para Fondart, INJUV, MINEDUC, municipalidades, etc.',
  },
];

export default function ComoComprarPage() {
  // FAQ schema.org JSON-LD para Google rich results
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Cómo comprar</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight font-bold">
            Cómo comprar
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            4 pasos. Despacho a todo Chile en 24-48 hrs, retiro tienda Providencia,
            factura electrónica para mayoristas.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(s => (
              <div key={s.num} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-3xl font-bold text-blue-500 mb-2">{s.num}</div>
                <div className="font-bold text-gray-900 mb-2">{s.title}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pago */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">Métodos de pago</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PAY.map(p => (
              <div key={p.name} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="font-bold text-gray-900 text-sm mb-1">{p.name}</div>
                <div className="text-xs text-gray-600">{p.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Despacho */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">Despacho</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-4 py-2">Zona</th>
                  <th className="text-left px-4 py-2">Costo</th>
                  <th className="text-left px-4 py-2">Tiempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {SHIP.map(s => (
                  <tr key={s.zone}>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.zone}</td>
                    <td className="px-4 py-3 text-gray-700">{s.cost}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ — con schema.org FAQPage para rich results en SERP */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">Preguntas frecuentes</h2>
          <dl className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-200 rounded-lg p-5">
                <dt className="font-bold text-gray-900 mb-2">{q}</dt>
                <dd className="text-sm text-gray-700 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
          <h2 className="text-xl sm:text-2xl mb-3">¿Más dudas?</h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-5">
            Te respondemos al toque por WhatsApp en horario hábil.
          </p>
          <a
            href="https://wa.me/56223350961"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp →
          </a>
        </div>
      </section>
    </main>
  );
}
