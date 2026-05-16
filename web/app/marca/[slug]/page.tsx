import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BRANDS_META } from '@/lib/brands-meta';
import { BRANDS } from '@/lib/colors/brands';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return Object.keys(BRANDS_META).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = BRANDS_META[slug];
  if (!brand) return { title: 'Marca no encontrada · Boykot' };
  return {
    title: `${brand.name} Chile — Distribuidor Oficial · Boykot`,
    description: brand.description.slice(0, 160),
    openGraph: {
      title: `${brand.name} en Chile — ${brand.tagline}`,
      description: brand.description.slice(0, 200),
      images: brand.heroImage ? [{ url: brand.heroImage }] : undefined,
      type: 'website',
    },
  };
}

export default async function BrandLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = BRANDS_META[slug];
  if (!brand) notFound();

  // Construir JSON-LD enriched
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    description: brand.description,
    logo: brand.logo,
    foundingDate: brand.since,
    countryOfOrigin: brand.origin,
    sameAs: [`${site}/marca/${brand.slug}`],
  };

  const totalColors = brand.subLines.reduce((s, sl) => s + sl.colors, 0);

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <nav className="text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <Link href="/marcas" className="hover:text-gray-700">Marcas</Link> /{' '}
          <span className="text-gray-700">{brand.name}</span>
        </nav>
      </div>

      {/* HERO */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            {brand.officialDistributor && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-800 text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                ✓ Distribuidor Oficial Chile
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-4 leading-tight">
              {brand.name}
            </h1>
            <p className="text-lg text-gray-600 mb-3">{brand.tagline}</p>
            <p className="text-sm text-gray-500 mb-6">
              Origen: <strong>{brand.origin}</strong> · Desde <strong>{brand.since}</strong> · <strong>{totalColors}+</strong> colores disponibles en Boykot
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-6">{brand.description}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#lineas"
                className="inline-block text-white px-6 py-3 rounded-md font-semibold hover:opacity-90 transition-opacity uppercase text-xs tracking-wider"
                style={{ backgroundColor: '#0066ff' }}
              >
                Ver cartas de color
              </a>
              <Link
                href={`/categoria/${brand.slug === 'molotow' ? 'molotow-markers' : (brand.slug === 'angelus' ? 'pintura' : 'marcadores')}`}
                className="inline-block border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-semibold hover:border-gray-900 transition-colors uppercase text-xs tracking-wider"
              >
                Explorar productos
              </Link>
            </div>
          </div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative">
            {brand.heroVideo ? (
              <video
                src={brand.heroVideo}
                poster={brand.heroImage}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={brand.heroImage} alt={brand.name} className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      </section>

      {/* DETAIL VIDEO — solo si la marca tiene segundo video (Angelus por ej.) */}
      {brand.detailVideo && (
        <section className="border-b border-gray-100 bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <video
                  src={brand.detailVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white">
                <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase mb-2">
                  El proceso
                </div>
                <h2 className="text-3xl sm:text-4xl mb-4 leading-tight">
                  {brand.name} en acción
                </h2>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  {brand.tagline}. Hecho para profesionales que necesitan calidad y consistencia
                  en cada proyecto. Si querés asesoría técnica para un encargo específico, hablemos.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HIGHLIGHTS */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brand.highlights.map((h, i) => (
              <div key={i} className="text-sm text-gray-700 leading-relaxed">
                <div className="text-xl font-bold text-gray-900 mb-1">0{i + 1}</div>
                {h}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUB-LÍNEAS — cartas de color */}
      <section id="lineas" className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-10">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
              Cartas de color
            </div>
            <h2 className="text-3xl sm:text-4xl text-gray-900">
              Líneas {brand.name} en Boykot
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-2xl">
              Cada carta muestra todos los colores con foto del swatch real y stock en tiempo real desde nuestra bodega.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {brand.subLines.map(sl => {
              const linkBrand = BRANDS[sl.slug];
              const hero = linkBrand?.heroImage;
              return (
                <Link
                  key={sl.slug}
                  href={`/colores/${sl.slug}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-400 rounded-xl overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                    {hero ? (
                      <img src={hero} alt={`${brand.name} ${sl.name}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-2xl">{sl.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">{brand.name}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{sl.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sl.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <strong className="text-gray-900">{sl.colors}</strong> colores
                      </div>
                      {sl.priceFrom && (
                        <div className="text-xs text-gray-500">
                          desde <strong className="text-gray-900">${sl.priceFrom.toLocaleString('es-CL')}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿Asesoría con {brand.name}?</h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Si tenés dudas sobre qué línea elegir o necesitás recomendaciones técnicas para tu proyecto, escribinos.
          </p>
          <a
            href="https://wa.me/56223350961"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider"
            style={{ backgroundColor: '#25D366' }}
          >
            Hablar por WhatsApp →
          </a>
        </div>
      </section>
    </main>
  );
}
