import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Esta página no existe (o ya no)
        </h1>
        <p className="text-gray-600 mb-8">
          La URL que buscás no está acá. Quizás fue movida o nunca existió.
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
            className="border border-gray-200 text-gray-900 px-5 py-2.5 rounded-md font-semibold hover:border-gray-400 transition-colors"
          >
            Ver cartas de color
          </Link>
        </div>
      </div>
    </main>
  );
}
