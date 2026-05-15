import Link from 'next/link';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import { productsByCategory } from '@/lib/products';

const BRAND_BLOCKS = [
  {
    name: 'Copic',
    subtitle: '358 marcadores · 6 líneas',
    href: '/colores/copic-sketch',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
  },
  {
    name: 'Angelus',
    subtitle: 'Pintura cuero · 88 colores',
    href: '/colores/angelus-standard-1oz',
    image: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg',
  },
  {
    name: 'Holbein',
    subtitle: 'Acuarela · Óleo · Gouache',
    href: '/colores/holbein-oleo-20ml',
    image: 'https://www.boykot.cl/wp-content/uploads/2025/07/170908red_tex_new_fx-ec0ab6c9-e1dc-4f63-af58-b2e177b4ece3-4.jpg',
  },
  {
    name: 'Molotow',
    subtitle: 'Premium 400ml · 224 colores',
    href: '/colores/molotow-premium',
    image: 'https://www.boykot.cl/wp-content/uploads/2024/10/p00327000-ef9dadfd-968f-4c16-bd8d-ca991af72c30.jpg',
  },
  {
    name: 'Createx',
    subtitle: 'Airbrush · Wicked',
    href: '/colores/createx-airbrush-60ml',
    image: 'https://www.boykot.cl/wp-content/uploads/2024/09/airbrush_demo_01_60-22e7c419-0ea1-4d54-9b07-01fc7470781b.jpg',
  },
  {
    name: 'POSCA',
    subtitle: 'Marcadores acrílicos',
    href: '/categoria/posca',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/05/logoheader-2021.png',
  },
];

const USE_CASES = [
  {
    title: 'Ilustración',
    body: 'Copic Sketch + Multiliner para anime, comic, fashion design.',
    href: '/colores/copic-sketch',
    accent: 'from-rose-400 to-orange-400',
  },
  {
    title: 'Customización',
    body: 'Angelus Leather Paint para zapatillas, bolsos y chaquetas.',
    href: '/colores/angelus-standard-1oz',
    accent: 'from-amber-400 to-red-500',
  },
  {
    title: 'Graffiti',
    body: 'Molotow Premium 400ml — el aerosol más respetado del mundo.',
    href: '/colores/molotow-premium',
    accent: 'from-zinc-700 to-zinc-900',
  },
  {
    title: 'Bellas artes',
    body: 'Holbein Acuarela, Óleo y Gouache — calidad museo japonesa.',
    href: '/colores/holbein-oleo-20ml',
    accent: 'from-sky-500 to-indigo-600',
  },
];

const TESTIMONIALS = [
  {
    quote: 'La carta de color Copic de Boykot es la mejor referencia que tengo. Stock real, despacho rápido.',
    author: 'Daniela R.',
    role: 'Ilustradora · Santiago',
  },
  {
    quote: 'Llevo años pintando zapatillas con Angelus de Boykot. La asesoría técnica no la encuentras en otro lado.',
    author: 'Cristóbal M.',
    role: 'Customizador · Concepción',
  },
  {
    quote: 'Único lugar en Chile con Molotow Premium completo. Si no está acá, hay que traerlo de afuera.',
    author: 'TKO',
    role: 'Writer · Valparaíso',
  },
];

export default function HomePage() {
  const featured = BRAND_SLUGS.map(s => BRANDS[s])
    .filter(b => b.colors.length >= 30)
    .sort((a, b) => b.colors.length - a.colors.length)
    .slice(0, 8);

  // 12 in-stock products across all categories for the home grid.
  // Stable: sort by slug so SSR/CSR match.
  const popular = ['marcadores', 'pintura', 'lapices', 'materiales']
    .flatMap(c => productsByCategory(c as 'marcadores'))
    .filter(p => p.availability !== 'OutOfStock' && p.image && p.price && (p.price ?? 0) > 5000)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .filter((_, i) => i % 47 === 0) // spread across the catalog
    .slice(0, 12);

  return (
    <main className="bg-white">
      {/* HERO — editorial, big type, generous whitespace */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-6">
            Distribuidor oficial · Chile · Desde 2010
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl text-gray-900 mb-8 leading-[0.95]">
            Materiales para
            <br />
            <span className="italic font-light" style={{ color: '#0066ff' }}>crear</span>
            <span className="text-gray-900">, sin atajos.</span>
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
            Copic, Angelus, Holbein, Molotow y más. Stock real, asesoría técnica y despacho a todo Chile en 48h.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/colores"
              className="inline-block px-7 py-4 text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm uppercase tracking-wider"
              style={{ backgroundColor: '#0066ff' }}
            >
              Ver cartas de color
            </Link>
            <Link
              href="/marcas"
              className="inline-block px-7 py-4 border border-gray-300 text-gray-900 font-semibold rounded-md hover:border-gray-900 transition-colors text-sm uppercase tracking-wider"
            >
              Explorar marcas
            </Link>
          </div>
        </div>
      </section>

      {/* USE CASES — what can you make with this stuff? */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
                Para qué sirve
              </div>
              <h2 className="text-3xl sm:text-4xl text-gray-900">¿Qué vas a crear?</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map(uc => (
              <Link
                key={uc.title}
                href={uc.href}
                className="group relative overflow-hidden rounded-xl border border-gray-100 hover:border-gray-300 transition-all bg-white"
              >
                <div className={`h-32 bg-gradient-to-br ${uc.accent}`} />
                <div className="p-5">
                  <div className="font-bold text-lg text-gray-900 mb-1">{uc.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{uc.body}</p>
                  <span className="text-xs font-medium text-gray-900 uppercase tracking-wider group-hover:underline underline-offset-4">
                    Ver productos →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR PRODUCTS — pulled from the scrape */}
      {popular.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
                  Catálogo
                </div>
                <h2 className="text-3xl sm:text-4xl text-gray-900">Productos destacados</h2>
              </div>
              <Link href="/categoria/marcadores" className="hidden sm:inline-block text-sm font-medium text-gray-900 hover:underline underline-offset-4">
                Explorar →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {popular.map(p => (
                <Link
                  key={p.slug}
                  href={`/producto/${p.slug}`}
                  className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    {p.brand && (
                      <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">{p.brand}</div>
                    )}
                    <div className="text-xs font-medium text-gray-900 line-clamp-2 mt-0.5 min-h-[2.4em]">{p.name}</div>
                    {p.price && (
                      <div className="text-xs font-semibold text-gray-900 mt-1">
                        ${p.price.toLocaleString('es-CL')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED BRANDS — circular crests */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
            Marcas oficiales
          </div>
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-10">Solo originales.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BRAND_BLOCKS.map(b => (
              <Link
                key={b.name}
                href={b.href}
                className="group flex flex-col items-center text-center p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 mb-3">
                  <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
                </div>
                <div className="font-semibold text-gray-900 text-sm">{b.name}</div>
                <div className="text-[11px] text-gray-500 mt-1">{b.subtitle}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CARTAS DE COLOR — featured grid */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
                Cartas de color
              </div>
              <h2 className="text-3xl sm:text-4xl text-gray-900">Elegí color por color.</h2>
              <p className="text-gray-600 mt-3 max-w-xl">
                Más de 1.500 colores con stock en tiempo real. Únicas en Chile.
              </p>
            </div>
            <Link href="/colores" className="hidden sm:inline-block text-sm font-medium text-gray-900 hover:underline underline-offset-4">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.map(brand => (
              <Link
                key={brand.slug}
                href={`/colores/${brand.slug}`}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors group"
              >
                <div className="relative w-full bg-gray-50" style={{ paddingBottom: '70%' }}>
                  {brand.heroImage ? (
                    <img
                      src={brand.heroImage}
                      alt={brand.productName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {brand.productName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {brand.colors.length} colores · ${brand.basePriceClp.toLocaleString('es-CL')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — creators speak */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
            Quiénes confían
          </div>
          <h2 className="text-3xl sm:text-4xl text-gray-900 mb-12 max-w-2xl">
            Ilustradores, customizadores y writers de todo Chile.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <figure key={t.author} className="border-l-2 pl-5" style={{ borderColor: '#0066ff' }}>
                <blockquote className="text-base text-gray-800 leading-relaxed mb-4 font-display">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="text-sm">
                  <div className="font-semibold text-gray-900">{t.author}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{t.role}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM / COMMUNITY */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase mb-3">
            Comunidad
          </div>
          <h2 className="text-3xl sm:text-5xl mb-6">@boykot187</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-8">
            Tutoriales, lanzamientos, obras de la comunidad chilena.
          </p>
          <a
            href="https://instagram.com/boykot187"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-4 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider"
          >
            Seguir en Instagram
          </a>
        </div>
      </section>
    </main>
  );
}
