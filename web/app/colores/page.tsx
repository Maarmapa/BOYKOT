// /colores index — lists every brand color card.
// The legacy Copic Sketch grid that used to live here is preserved at /copic-sketch.

import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export const metadata = { title: 'Cartas de color · Boykot' };

export default function ColoresIndexPage() {
  const cards = BRAND_SLUGS.map(slug => BRANDS[slug]).sort(
    (a, b) => b.colors.length - a.colors.length
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cartas de color</h1>
        <p className="text-gray-500 mb-8">
          {cards.length} cartas · {cards.reduce((s, b) => s + b.colors.length, 0)} colores en
          total
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(brand => (
            <a
              key={brand.slug}
              href={`/colores/${brand.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4"
            >
              {brand.heroImage ? (
                <img
                  src={brand.heroImage}
                  alt={brand.productName}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{brand.productName}</div>
                <div className="text-sm text-gray-500">
                  {brand.colors.length} colores · ${brand.basePriceClp.toLocaleString('es-CL')}
                </div>
              </div>
              <span className="text-gray-300 text-xl">→</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
