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
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-7xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Esta página no existe (o ya no)
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            La URL que buscás no está acá. Quizás fue movida, escribiste algo distinto,
            o simplemente nunca existió. Probá con algo popular abajo.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="text-white px-5 py-2.5 rounded-md font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#0066ff' }}
            >
              Volver al inicio
            </Link>
            <Link
              href="/colores"
              className="border border-gray-300 text-gray-900 px-5 py-2.5 rounded-md font-semibold hover:border-gray-900 transition-colors"
            >
              Todas las cartas
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-5 text-center">
            Lo más buscado en Boykot
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POPULAR.map(p => (
              <Link
                key={p.href}
                href={p.href}
                className="block bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-300 rounded-lg p-4 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm mb-1">{p.name}</div>
                <div className="text-xs text-gray-500">{p.subtitle}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-xs text-gray-400">
            ¿Buscás algo específico? Escribinos por{' '}
            <a href="https://wa.me/56223350961" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
              WhatsApp
            </a>{' '}
            o a{' '}
            <a href="mailto:providencia@boykot.cl" className="text-blue-700 hover:underline">
              providencia@boykot.cl
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
