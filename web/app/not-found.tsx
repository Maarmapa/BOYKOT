import Link from 'next/link';

const POPULAR = [
  { name: 'Copic Sketch', href: '/colores/copic-sketch', subtitle: '358 colores · Marcadores' },
  { name: 'Angelus Cuero', href: '/colores/angelus-standard-1oz', subtitle: '88 colores · Para zapatillas' },
  { name: 'Holbein Acuarela', href: '/colores/holbein-acuarela-15ml', subtitle: '120 colores · Series A-F' },
  { name: 'Molotow Premium', href: '/colores/molotow-premium', subtitle: '224 colores · Graffiti' },
  { name: 'POSCA 5M', href: '/colores/uni-posca-5m', subtitle: '26 colores · Acrílicos' },
  { name: 'Createx Airbrush', href: '/colores/createx-airbrush-60ml', subtitle: 'Aerografía' },
];

export default function NotFound() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="text-8xl sm:text-9xl font-bold text-gray-700 mb-3 leading-none">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl mb-3 leading-tight">
            Esta página no existe (o ya no).
          </h1>
          <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base mb-6">
            La URL que buscás no está acá. Quizás fue movida, escribiste algo distinto,
            o simplemente nunca existió.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="inline-block bg-white text-gray-900 px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              Volver al inicio
            </Link>
            <Link
              href="/buscar"
              className="inline-block border border-gray-700 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              Buscar productos
            </Link>
          </div>
        </div>
      </section>

      {/* Popular */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Lo más buscado
          </div>
          <h2 className="text-2xl text-gray-900 mb-6">Para que no te vayas con las manos vacías</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {POPULAR.map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="block bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-900 rounded-lg p-4 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm mb-1">{p.name}</div>
                <div className="text-xs text-gray-500">{p.subtitle}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center text-sm text-gray-600">
          ¿Buscás algo específico que no encontrás? Escribinos por{' '}
          <a href="https://wa.me/56223350961" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
            WhatsApp
          </a>
          {' '}o{' '}
          <a href="mailto:providencia@boykot.cl" className="text-blue-600 hover:underline font-semibold">
            email
          </a>.
        </div>
      </section>
    </main>
  );
}
