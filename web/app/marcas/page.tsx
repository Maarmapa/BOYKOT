import Link from 'next/link';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import type { BrandColorSet } from '@/lib/colors/types';

export const metadata = { title: 'Marcas · Boykot' };

// Group brand registry by manufacturer.
function groupByBrand(): Record<string, BrandColorSet[]> {
  const groups: Record<string, BrandColorSet[]> = {};
  for (const slug of BRAND_SLUGS) {
    const b = BRANDS[slug];
    const key = b.brandName || b.productName.split(' ')[0] || 'Otros';
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => b.colors.length - a.colors.length);
  }
  return groups;
}

export default function BrandsIndexPage() {
  const groups = groupByBrand();
  const sortedBrands = Object.keys(groups).sort((a, b) => {
    return groups[b].reduce((s, x) => s + x.colors.length, 0) -
           groups[a].reduce((s, x) => s + x.colors.length, 0);
  });

  return (
    <main className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <span className="text-gray-700">Marcas</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marcas</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          Distribuidores oficiales de Copic, Angelus y Holbein en Chile. Más {sortedBrands.length} marcas con catálogos completos en tiempo real.
        </p>

        <div className="space-y-12">
          {sortedBrands.map(brand => {
            const lines = groups[brand];
            const total = lines.reduce((s, l) => s + l.colors.length, 0);
            return (
              <section key={brand}>
                <header className="flex items-baseline justify-between mb-4 border-b border-gray-200 pb-2">
                  <h2 className="text-xl font-bold text-gray-900">{brand}</h2>
                  <span className="text-xs text-gray-400">
                    {lines.length} {lines.length === 1 ? 'línea' : 'líneas'} · {total} colores
                  </span>
                </header>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {lines.map(line => (
                    <Link
                      key={line.slug}
                      href={`/colores/${line.slug}`}
                      className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                    >
                      <div className="relative w-full bg-gray-50" style={{ paddingBottom: '70%' }}>
                        {line.heroImage ? (
                          <img
                            src={line.heroImage}
                            alt={line.productName}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                      </div>
                      <div className="p-3">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {line.productName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {line.colors.length} colores · ${line.basePriceClp.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
