import Link from 'next/link';

export const metadata = {
  title: 'Sobre Boykot · 16 años de arte y graffiti en Chile',
  description: 'Distribuidores oficiales de Copic, Angelus y Holbein en Chile desde 2010. Tienda y cultura en Providencia, Santiago.',
};

const MILESTONES = [
  { year: '2010', title: 'Nace Boykot', body: 'Tienda fundada como referente del graffiti en Chile. Foco original: aerosoles y herramientas para street artists.' },
  { year: '2014', title: 'Distribución Copic', body: 'Boykot se convierte en el distribuidor oficial de Copic en Chile.' },
  { year: '2018', title: 'Distribución Angelus', body: 'Sumamos Angelus, la pintura para cuero #1 del mundo para sneakerheads y customizadores.' },
  { year: '2021', title: 'Holbein + expansión arte', body: 'Distribuidores oficiales Holbein. Ampliamos a ilustración, acuarela, óleo y multipropósito.' },
  { year: '2026', title: 'Plataforma nueva', body: 'Web rediseñada con cartas de color visuales en tiempo real, integración BSale, portal B2B, cotizador automático para licitaciones.' },
];

const VALUES = [
  { emoji: '🇨🇱', title: 'Hecho en Chile', desc: 'Tienda física + e-commerce desde 2010, sin franchise. Equipo local que conoce las obras.' },
  { emoji: '✓', title: 'Distribuidor oficial', desc: 'Importación directa de Copic, Angelus, Holbein. No paralelos, no falsificados.' },
  { emoji: '🎨', title: 'Para creadores serios', desc: 'Calidad museográfica para artistas, ilustradores, grafiteros, custom sneakers.' },
  { emoji: '🚚', title: 'Despacho 24-48hrs', desc: 'A todo Chile vía Starken/Chilexpress o retiro tienda Providencia.' },
];

export default function AboutPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Sobre Boykot</span>
          </nav>
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase mb-3">
            Desde 2010
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 leading-tight font-bold">
            Arte y graffiti
            <br />
            en Chile, 16 años.
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Boykot nació como tienda de graffiti en Providencia. Hoy es el referente de materiales
            de arte premium en Chile: distribuidores oficiales de{' '}
            <strong className="text-white">Copic</strong>,{' '}
            <strong className="text-white">Angelus</strong> y{' '}
            <strong className="text-white">Holbein</strong>, más 20 marcas que importamos directo.
          </p>
        </div>
      </section>

      {/* Values grid */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Lo que nos define
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-8">¿Por qué Boykot?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title}>
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Cronología
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-10">16 años de evolución</h2>
          <ol className="space-y-8">
            {MILESTONES.map((m, idx) => (
              <li key={m.year} className="flex gap-6">
                <div className="flex-shrink-0 w-20 sm:w-24">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-300 leading-none">{m.year}</div>
                </div>
                <div className="border-l-2 border-gray-300 pl-6 pb-2 -mt-1">
                  <div className="font-bold text-gray-900 mb-1">{m.title}</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Photo + visit CTA */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src="https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg"
                alt="Tienda Boykot Providencia"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Tienda física
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-900 mb-3 leading-tight">
                Av. Providencia 2251, local 69
              </h2>
              <p className="text-gray-700 mb-5 leading-relaxed">
                Pasá a ver los Copic en vivo, probá los Angelus contra muestra de cuero,
                hojeá los Holbein. Asesoría técnica en la tienda con personal que pinta.
              </p>
              <div className="text-sm text-gray-600 mb-6">
                <strong>Horario</strong><br />
                Lun-Vie 10:00 – 18:00<br />
                Sáb 10:00 – 15:00<br />
                <em>Metro Los Leones</em>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/contacto" className="inline-block text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:opacity-90"
                  style={{ backgroundColor: '#0066ff' }}>
                  Ver contacto
                </Link>
                <a href="https://wa.me/56223350961" target="_blank" rel="noopener noreferrer"
                  className="inline-block px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
                  style={{ backgroundColor: '#25D366' }}>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">Empezá a explorar</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm">
            Más de 2.000 colores con stock en tiempo real, 20 marcas premium, despacho a todo Chile.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/marcas" className="inline-block bg-white text-gray-900 px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-100">
              Ver marcas
            </Link>
            <Link href="/tienda" className="inline-block border border-gray-700 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-800">
              Catálogo completo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
