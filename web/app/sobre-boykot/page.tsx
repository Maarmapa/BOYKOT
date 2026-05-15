import Link from 'next/link';

export const metadata = {
  title: 'Sobre Boykot · 15 años de arte y graffiti en Chile',
  description: 'Distribuidores oficiales de Copic, Angelus y Holbein en Chile desde 2010. Tienda y cultura en Providencia, Santiago.',
};

const MILESTONES = [
  { year: '2010', title: 'Nace Boykot', body: 'Tienda fundada como referente del graffiti en Chile. Foco original: aerosoles y herramientas para street artists.' },
  { year: '2014', title: 'Distribución Copic', body: 'Boykot se convierte en el distribuidor oficial de Copic en Chile.' },
  { year: '2018', title: 'Distribución Angelus', body: 'Sumamos Angelus, la pintura para cuero #1 del mundo para sneakerheads y customizadores.' },
  { year: '2021', title: 'Holbein + expansión arte', body: 'Distribuidores oficiales Holbein. Ampliamos a ilustración, acuarela, óleo y multipropósito.' },
  { year: '2026', title: 'Plataforma nueva', body: 'Web rediseñada con cartas de color visuales en tiempo real, integración BSale, portal B2B.' },
];

const FACTS = [
  { num: '15+', label: 'años en Chile' },
  { num: '358', label: 'colores Copic' },
  { num: '88', label: 'colores Angelus' },
  { num: '500+', label: 'colores Holbein' },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <span className="text-gray-700">Sobre Boykot</span>
        </nav>

        <header className="mb-12">
          <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">
            Sobre nosotros
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Arte y graffiti en Chile desde 2010
          </h1>
          <p className="text-gray-600 max-w-2xl leading-relaxed">
            Boykot nació como tienda de graffiti en 2010 y, a lo largo de más de 15 años, se ha
            expandido al universo completo de la ilustración y los materiales de arte. Somos
            distribuidores oficiales de <strong className="text-gray-900">Copic</strong>,{' '}
            <strong className="text-gray-900">Angelus</strong> y{' '}
            <strong className="text-gray-900">Holbein</strong> en Chile, y representamos también a
            Molotow, Createx, Wicked, ZIG, POSCA, SOLAR y otras marcas referentes.
          </p>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {FACTS.map(f => (
            <div key={f.label} className="border border-gray-100 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{f.num}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{f.label}</div>
            </div>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6">Línea de tiempo</h2>
          <ol className="space-y-6">
            {MILESTONES.map(m => (
              <li key={m.year} className="flex gap-5">
                <div className="flex-shrink-0 w-20 text-2xl font-bold text-gray-200">{m.year}</div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{m.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Visitanos</h2>
          <p className="text-sm text-gray-600 mb-4">
            La tienda física en Av. Providencia 2251, local 69. Metro Los Leones. Lun-Vie 10-18, Sáb 10-15.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/contacto" className="text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
              style={{ backgroundColor: '#0066ff' }}>
              Ver contacto
            </Link>
            <Link href="/colores" className="border border-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:border-gray-400">
              Ver cartas de color
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
