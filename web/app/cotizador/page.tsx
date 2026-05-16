import Link from 'next/link';
import type { Metadata } from 'next';
import CotizadorClient from './client';

export const metadata: Metadata = {
  title: 'Cotizador automático · Boykot — Para licitaciones y proyectos',
  description:
    'Armá tu cotización formal en segundos. Pegá tu lista de materiales, te devolvemos PDF con precios, stock y RUT. Ideal para licitaciones, fondos gubernamentales, escuelas y productoras.',
};

export const dynamic = 'force-dynamic';

export default function CotizadorPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Cotizador</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider rounded-full mb-6 border border-blue-500/40">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Para B2B · Licitaciones · Fondos · Escuelas
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-5 leading-tight font-bold">
            Cotización formal
            <br />
            <span className="text-blue-400">en 30 segundos.</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed mb-2">
            Pegá tu listado de materiales — en texto, como te lo pidieron.
            Te devolvemos PDF con precios, IVA, stock y vigencia 30 días.
          </p>
          <p className="text-sm text-gray-400">
            Sin formularios complicados. Sin esperar. Sin email cobrador.
          </p>
        </div>
      </section>

      {/* Cotizador */}
      <section className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <CotizadorClient />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step n="1" title="Pegá tu lista" desc='Texto libre, tipo "30 Copic Sketch surtidos, 20 Angelus 1oz negro y blanco, papel A3..."' />
            <Step n="2" title="IA matchea" desc="Hermes (nuestro asistente AI) identifica cada producto, valida stock real-time y calcula totales con IVA." />
            <Step n="3" title="PDF compartible" desc="Recibís link único tipo /cotizacion/BK-XXXX para descargar/imprimir o forwardear a tu comprador institucional." />
          </div>
          <div className="mt-8 text-sm text-gray-600 leading-relaxed">
            <strong className="text-gray-900">Sirve para</strong>: cotizaciones para fondos públicos (Fondart, Cultura,
            INJUV), licitaciones municipales, compras de escuelas/universidades, proyectos productoras audiovisuales,
            insumos para curso/taller, encargos B2B mayoristas. Vigencia por default: 30 días corridos.
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h2 className="text-xl sm:text-2xl mb-3">¿Cotización más compleja o querés asesoría humana?</h2>
          <a
            href="https://wa.me/56223350961?text=Hola%21+Necesito+cotizaci%C3%B3n+para+proyecto%3A"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp B2B →
          </a>
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-blue-500 mb-1">{n}</div>
      <div className="font-bold text-gray-900 mb-2">{title}</div>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
