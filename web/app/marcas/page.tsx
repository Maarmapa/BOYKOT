import Link from 'next/link';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import { BRANDS_META } from '@/lib/brands-meta';
import type { BrandColorSet } from '@/lib/colors/types';

export const metadata = {
  title: 'Marcas · Boykot — Distribuidores oficiales Copic, Angelus, Holbein',
  description:
    'Más de 20 marcas premium de arte, ilustración y graffiti en Chile. Distribuidores oficiales Copic, Angelus y Holbein. Más de 2.000 colores con stock en tiempo real.',
};

// Marcas destacadas (con landing dedicada en /marca/[slug]).
const FEATURED = ['copic', 'angelus', 'holbein', 'molotow'] as const;

// Manufacturer → metadata visual (logo URL, origen). Logo fallback usa CDN natekla
// hasta que el user pase los oficiales del Dropbox.
const BRAND_VISUAL: Record<string, { logo?: string; origin?: string; tagline?: string }> = {
  Copic: {
    logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/copic-chile.webp',
    origin: 'Japón · 1987',
    tagline: 'Marcadores base alcohol · Estándar profesional',
  },
  Angelus: {
    logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/Boton_Angelus.webp',
    origin: 'USA · 1907',
    tagline: 'Pinturas para cuero · Custom sneakers',
  },
  Holbein: {
    logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/holbein-chile.webp',
    origin: 'Japón · 1900',
    tagline: 'Acuarela, gouache, óleo premium',
  },
  Molotow: {
    logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/molotow-chile.webp',
    origin: 'Alemania · 1996',
    tagline: 'Aerosoles graffiti · Estándar mundial',
  },
  Createx: { origin: 'USA', tagline: 'Pinturas para aerografía' },
  Wicked: { origin: 'USA', tagline: 'Aerografía profesional' },
  Zig: {
    logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/zig-kuretake-chile.webp',
    origin: 'Japón · Kuretake',
    tagline: 'Caligrafía y lettering',
  },
  Solar: { origin: 'USA', tagline: 'Pigmentos foto-reactivos' },
  Chameleon: { origin: 'USA', tagline: 'Pigmentos cambia-color' },
  Ultra: { origin: 'USA', tagline: 'Pigmentos termo-reactivos' },
  Aqua: { origin: '—', tagline: 'Brush pens acuarela' },
  Uni: { origin: 'Japón · Mitsubishi', tagline: 'POSCA marker estándar' },
  Poplol: { origin: '—', tagline: 'Gel pen color' },
  AtYou: { origin: 'Japón', tagline: 'Spica glitter pens' },
  Kirarina: { origin: 'Japón', tagline: 'Brush pens cute' },
};

// Agrupa BRANDS por fabricante.
function groupByBrand(): Record<string, BrandColorSet[]> {
  const groups: Record<string, BrandColorSet[]> = {};
  for (const slug of BRAND_SLUGS) {
    const b = BRANDS[slug];
    let key = b.brandName || b.productName.split(' ')[0] || 'Otros';
    // Normalize "Zig" / "Zig Kuretake" → "Zig"
    if (key.toLowerCase().startsWith('zig')) key = 'Zig';
    if (key.toLowerCase().startsWith('at you') || key.toLowerCase().startsWith('atyou')) key = 'AtYou';
    if (key.toLowerCase().startsWith('uni')) key = 'Uni';
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
  const allBrands = Object.keys(groups).sort();
  const featuredBrandSlugs = FEATURED;
  const otherBrands = allBrands.filter(b => {
    const slug = b.toLowerCase();
    return !featuredBrandSlugs.some(f => f === slug);
  });

  // Alfabético — letra → marcas
  const byLetter: Record<string, string[]> = {};
  for (const b of otherBrands) {
    const letter = b[0].toUpperCase();
    if (!byLetter[letter]) byLetter[letter] = [];
    byLetter[letter].push(b);
  }
  const letters = Object.keys(byLetter).sort();

  const totalColors = Object.values(groups).reduce(
    (s, lines) => s + lines.reduce((s2, l) => s2 + l.colors.length, 0),
    0,
  );

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Marcas</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">
            Marcas que distribuimos en Chile
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-6 leading-relaxed">
            Distribuidores oficiales <strong className="text-white">Copic</strong>,{' '}
            <strong className="text-white">Angelus</strong> y{' '}
            <strong className="text-white">Holbein</strong>.
            Más de <strong className="text-white">{allBrands.length}</strong> marcas premium con catálogos completos y stock en tiempo real.
          </p>
          <div className="flex items-baseline gap-6 text-sm text-gray-400">
            <div><strong className="text-white text-2xl">{totalColors.toLocaleString('es-CL')}+</strong> colores</div>
            <div><strong className="text-white text-2xl">{allBrands.length}</strong> marcas</div>
            <div><strong className="text-white text-2xl">16</strong> años</div>
          </div>
        </div>
      </section>

      {/* Featured brands — 4 big cards */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-8">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
              Distribuidor oficial
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-900">Marcas destacadas</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURED.map(slug => {
              const meta = BRANDS_META[slug];
              if (!meta) return null;
              const visual = BRAND_VISUAL[meta.name];
              const totalLineColors = meta.subLines.reduce((s, sl) => s + sl.colors, 0);
              return (
                <Link
                  key={slug}
                  href={`/marca/${slug}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-lg"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={meta.heroImage}
                      alt={meta.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    {meta.officialDistributor && (
                      <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-green-50 text-green-800 rounded mb-2">
                        ✓ Distribuidor oficial
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{meta.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{visual?.tagline || meta.tagline}</p>
                    <div className="flex items-baseline justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{visual?.origin}</span>
                      <span className="text-xs font-semibold text-gray-900">{totalLineColors}+ colores</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alphabetical jumper */}
      <section className="border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 mr-2">Saltar a:</span>
            {letters.map(letter => (
              <a
                key={letter}
                href={`#letra-${letter}`}
                className="inline-block px-2.5 py-1 bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white rounded font-semibold text-gray-700 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* All other brands — alphabetical sections */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-8">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
              Catálogo completo
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-900">Todas las marcas</h2>
          </div>

          <div className="space-y-14">
            {letters.map(letter => (
              <div key={letter} id={`letra-${letter}`} className="scroll-mt-20">
                <div className="flex items-baseline gap-4 mb-6 pb-3 border-b-2 border-gray-900">
                  <h3 className="text-4xl font-bold text-gray-900">{letter}</h3>
                  <span className="text-xs text-gray-500">
                    {byLetter[letter].length} {byLetter[letter].length === 1 ? 'marca' : 'marcas'}
                  </span>
                </div>

                {byLetter[letter].map(brand => {
                  const lines = groups[brand];
                  const visual = BRAND_VISUAL[brand];
                  const total = lines.reduce((s, l) => s + l.colors.length, 0);
                  return (
                    <div key={brand} className="mb-10 last:mb-0">
                      <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-gray-100">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{brand}</h4>
                          {visual?.tagline && (
                            <p className="text-xs text-gray-500 mt-0.5">{visual.tagline}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 text-right">
                          <div>{lines.length} {lines.length === 1 ? 'línea' : 'líneas'}</div>
                          <div className="text-gray-700 font-semibold">{total} colores</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {lines.map(line => (
                          <Link
                            key={line.slug}
                            href={`/colores/${line.slug}`}
                            className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-lg overflow-hidden transition-all hover:shadow-md"
                          >
                            <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                              {line.heroImage ? (
                                <img
                                  src={line.heroImage}
                                  alt={line.productName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 font-bold text-lg">{line.productName}</span>
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                                {line.productName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                                <span>{line.colors.length} colores</span>
                                <span className="font-semibold text-gray-700">
                                  ${line.basePriceClp.toLocaleString('es-CL')}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — B2B / Mayoristas */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿Sos retail, escuela o estudio?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Precios mayoristas, condiciones B2B y catálogos exclusivos. Atención dedicada
            para tiendas de arte, academias y proyectos profesionales.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/b2b"
              className="inline-block bg-white text-gray-900 px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              Programa B2B →
            </Link>
            <a
              href="https://wa.me/56223350961"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider"
              style={{ backgroundColor: '#25D366' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
