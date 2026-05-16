import Link from 'next/link';
import B2bForm from '@/components/B2bForm';

export const metadata = {
  title: 'B2B Mayoristas · Boykot — Distribuidores, escuelas, productoras',
  description:
    'Precios mayoristas, factura electrónica automática, atención dedicada. Para tiendas, escuelas, productoras, talleres. Distribuidor oficial Copic, Angelus, Holbein.',
};

const PERKS = [
  {
    emoji: '💼',
    title: 'Precios mayorista',
    detail: 'Lista de precios B2B asignada a tu RUT con descuentos por volumen. Stock real-time desde BSale.',
  },
  {
    emoji: '📄',
    title: 'Factura electrónica',
    detail: 'Generada automáticamente al confirmar pedido. Emitida y enviada a tu email vía BSale.',
  },
  {
    emoji: '🚚',
    title: 'Sin pedido mínimo',
    detail: 'Comprá desde 1 unidad o pedidos de cientos. Despacho 24-48hrs a todo Chile.',
  },
  {
    emoji: '📜',
    title: 'Cotizaciones formales',
    detail: 'Generá cotizaciones PDF en segundos para licitaciones, fondos públicos y compras institucionales.',
  },
  {
    emoji: '📊',
    title: 'Historial completo',
    detail: 'Tus pedidos anteriores siempre disponibles para repetir compras y armar reorden rápido.',
  },
  {
    emoji: '👥',
    title: 'Atención dedicada',
    detail: 'Vendedor asignado para asesoría técnica, pedidos urgentes y consultas grandes.',
  },
];

const PARTNERS = [
  { name: 'Municipalidades', desc: 'Compras públicas con factura electrónica' },
  { name: 'Escuelas + Universidades', desc: 'Materiales para cursos completos' },
  { name: 'Tiendas retail', desc: 'Reventa con descuento por volumen' },
  { name: 'Productoras', desc: 'Insumos para eventos y producciones audiovisuales' },
  { name: 'Talleres + Academias', desc: 'Material para alumnos al por mayor' },
  { name: 'Customizadores', desc: 'Angelus al por mayor para custom sneakers' },
];

const FAQ = [
  {
    q: '¿Cuánto se demora la aprobación?',
    a: 'Te confirmamos tus credenciales en menos de 24 hrs hábiles. Necesitamos: RUT de la empresa, giro/inicio de actividades, dirección de despacho/facturación.',
  },
  {
    q: '¿Necesito pedido mínimo?',
    a: 'No. Comprás desde 1 unidad con precios B2B. La idea es que tengas flexibilidad: pedido grande, reorden chico, o probar productos nuevos.',
  },
  {
    q: '¿Cómo recibo las facturas?',
    a: 'Factura electrónica via BSale apenas confirmás el pedido. Llega automáticamente al email registrado. Cumple con normativa SII Chile.',
  },
  {
    q: '¿Cotizan para licitaciones?',
    a: 'Sí. Tenemos /cotizador automático que arma PDF formal en segundos con RUT, IVA, vigencia 30 días. Ideal para Fondart, INJUV, MINEDUC, compras públicas.',
  },
];

export default function B2BPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">B2B</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider rounded-full mb-6 border border-blue-500/40">
            Programa mayorista · Acceso por RUT
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-5 leading-tight font-bold">
            Boykot Mayorista
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed mb-6">
            Precios mayorista, factura electrónica automática y atención dedicada.
            Para tiendas, escuelas, productoras, talleres y compras institucionales.
          </p>
          <a
            href="#solicitar"
            className="inline-block bg-blue-500 hover:bg-blue-400 text-white px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider transition-colors"
          >
            Solicitar acceso →
          </a>
        </div>
      </section>

      {/* Perks grid */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Qué incluye
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-8">Beneficios del programa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map(p => (
              <div key={p.title} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Para vos si sos
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-8">Quién aprovecha B2B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PARTNERS.map(p => (
              <div key={p.name} className="bg-white border-l-4 border-blue-500 px-4 py-3">
                <div className="font-bold text-gray-900 text-sm">{p.name}</div>
                <div className="text-xs text-gray-600 mt-0.5">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form solicitar acceso */}
      <section id="solicitar" className="border-b border-gray-100 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Aplicar
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-3">Solicitar acceso</h2>
          <p className="text-sm text-gray-600 mb-6">
            Completá el formulario, te confirmamos tus credenciales en &lt; 24 hrs hábiles.
            Necesitamos: RUT empresa, giro/iniciación de actividades, dirección de despacho/facturación.
          </p>
          <B2bForm />
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">Preguntas frecuentes</h2>
          <dl className="space-y-5">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-white border border-gray-200 rounded-lg p-5">
                <dt className="font-bold text-gray-900 mb-2">{q}</dt>
                <dd className="text-sm text-gray-700 leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿Una consulta antes de aplicar?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm">
            Hablemos directo por WhatsApp. Resolvemos en horario hábil.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/56223350961?text=Hola%21+Consulta+sobre+programa+B2B+Boykot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              WhatsApp B2B
            </a>
            <Link
              href="/cotizador"
              className="inline-block bg-white text-gray-900 px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-100"
            >
              Ir al cotizador
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
