import Link from 'next/link';
import natProducts from '../data/natekla-products.json';

// 8 marcas destacadas en grid 4x2 — apuntan a /marca/[slug] (landing brand)
// con fallback a /colores/[carta] para las brands sin landing dedicada.
const MARCAS = [
  { name: 'Copic', href: '/marca/copic', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/copic-chile.webp' },
  { name: 'Angelus', href: '/marca/angelus', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/Boton_Angelus.webp' },
  { name: 'Molotow', href: '/marca/molotow', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/molotow-chile.webp' },
  { name: 'Holbein', href: '/marca/holbein', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/holbein-chile.webp' },
  { name: 'ZIG Kuretake', href: '/colores/zig-calligraphy', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/zig-kuretake-chile.webp' },
  { name: 'Createx', href: '/colores/createx-airbrush-60ml', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/copic-chile.webp' },
  { name: 'POSCA', href: '/colores/uni-posca-5m', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/krack-chile.webp' },
  { name: 'Acrilex', href: '/marcas', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/krack-chile.webp' },
];

// Proceso de creación de manga — 6 categorías visuales (del diseño natekla)
const PROCESO_MANGA = [
  { name: 'Manuscrito', href: '/categoria/marcadores', image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Manuscrito.webp' },
  { name: 'Papeles', href: '/categoria/materiales', image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Papeles.webp' },
  { name: 'Boceto y dibujo', href: '/categoria/lapices', image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Boceto-y-dibujo.webp' },
  { name: 'Entintado', href: '/colores/copic-ink', image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Entintado.webp' },
  { name: 'Entramado', href: '/categoria/materiales', image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Entramado.webp' },
  { name: 'Coloreado', href: '/colores/copic-sketch', image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/Img-Coloreado.webp' },
];

// Use cases — qué necesitás hacer
const USE_CASES = [
  { name: 'Manga', href: '/categoria/marcadores', image: 'https://natekla.es/boytok/wp-content/uploads/2026/05/img-manga.jpg' },
  { name: 'Pintar zapatillas', href: '/colores/angelus-standard-1oz', image: 'https://natekla.es/boytok/wp-content/uploads/2026/05/img-pintar-zapatillas.jpg' },
  { name: 'Dibujo y coloreado', href: '/colores/copic-sketch', image: 'https://natekla.es/boytok/wp-content/uploads/2026/04/img-otros.webp' },
];

interface NatProduct {
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  brand: string | null;
  on_sale: boolean;
  in_stock: boolean;
}

export default function HomePage() {
  // Productos destacados: en stock, con imagen y precio. Stable sort por slug.
  const featured = (natProducts as NatProduct[])
    .filter(p => p.in_stock && p.image && p.price && p.price > 1000)
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .filter((_, i) => i % 50 === 0)
    .slice(0, 8);

  // Productos en promoción
  const promociones = (natProducts as NatProduct[])
    .filter(p => p.on_sale && p.in_stock && p.image && p.price)
    .slice(0, 8);

  return (
    <main className="bg-white">
      {/* HERO estilo copic.jp 1:1
          - desktop: video full-bleed 100vh max 750px, sin overlay,
            texto blanco 50% lado izquierdo, search 300px arriba centrado
          - mobile: video 400px arriba, texto debajo en fondo gris claro #efefef */}
      <section className="video_wrap relative w-full overflow-hidden bg-[#efefef] md:bg-gray-900 md:h-screen md:max-h-[750px]">
        {/* Video PC — full bleed sin overlay */}
        <video
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          src="/videos/copic-hero-pc.mp4"
          poster="/videos/copic-hero-pc-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        {/* Video SP — solo 400px alto arriba del texto en mobile */}
        <video
          className="md:hidden relative w-full h-[400px] object-cover"
          src="/videos/copic-hero-sp.mp4"
          poster="/videos/copic-hero-sp-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />

        {/* Search-box1 — 300px x 46px absoluto centro arriba (solo PC) */}
        <form
          action="/buscar"
          method="get"
          className="hidden md:flex absolute top-5 left-1/2 -translate-x-1/2 w-[300px] h-[46px] z-20 bg-white rounded-full shadow-lg overflow-hidden"
        >
          <input
            type="search"
            name="q"
            placeholder="Buscar..."
            className="flex-1 px-5 text-sm text-gray-900 outline-none bg-transparent"
          />
          <button type="submit" className="px-4 text-gray-700 hover:text-gray-900" aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>

        {/* wrap_words — 50% izq con texto blanco (PC) · 100% width gris (mobile) */}
        <div className="md:absolute md:top-0 md:left-0 md:w-1/2 md:h-full flex items-center justify-center text-center px-6 py-10 md:px-12 md:py-0 md:text-white text-gray-900 relative z-10">
          <div className="w-full max-w-md md:max-w-none">
            <h1 className="text-4xl md:text-[3.5rem] leading-tight md:leading-tight mb-4 font-semibold">
              Boykot
            </h1>
            <h2 className="text-base md:text-[1.125rem] leading-relaxed md:text-left font-medium mb-8">
              Distribuidores oficiales <strong>Copic</strong>, <strong>Angelus</strong> y <strong>Holbein</strong> en Chile.
              <br className="hidden md:block" />
              Más de 2.000 colores con stock en tiempo real y despacho 24-48 hrs.
            </h2>
            <p className="space-y-3 md:space-y-0">
              <Link
                href="/marcas"
                className="inline-block w-[260px] mx-2 my-1.5 py-2.5 px-5 border-2 md:border-white border-gray-900 rounded-full md:text-white text-gray-900 text-sm md:text-[1.125rem] font-medium hover:bg-white hover:text-gray-900 transition-colors"
              >
                Ver marcas
              </Link>
              <br />
              <Link
                href="/tienda"
                className="inline-block w-[260px] mx-2 my-1.5 py-2.5 px-5 border-2 md:border-white border-gray-900 rounded-full md:text-white text-gray-900 text-sm md:text-[1.125rem] font-medium hover:bg-white hover:text-gray-900 transition-colors"
              >
                Ir a la tienda
              </Link>
            </p>
          </div>
        </div>

        {/* Scroll indicator — bottom center solo PC */}
        <a
          href="#destacados"
          className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Scroll abajo"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
            <span className="block w-1 h-2 bg-white rounded-full animate-bounce" />
          </div>
        </a>
      </section>

      {/* Stats — sección aparte debajo del hero (eran inline en el hero antes) */}
      <section id="destacados" className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">2,000+</div>
              <div className="text-xs text-gray-500 mt-1">colores con stock real-time</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">15+</div>
              <div className="text-xs text-gray-500 mt-1">marcas premium</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">16</div>
              <div className="text-xs text-gray-500 mt-1">años en Chile</div>
            </div>
          </div>
        </div>
      </section>

      {/* NUESTRAS MARCAS — grid 4x2 (8 logos) inspirado en natekla */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Distribuidor oficial
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-900">Nuestras marcas</h2>
            </div>
            <Link href="/marcas" className="hidden sm:inline-block text-sm font-medium text-gray-900 hover:underline underline-offset-4">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {MARCAS.map(m => (
              <Link
                key={m.name}
                href={m.href}
                className="group block aspect-square bg-white rounded-lg overflow-hidden hover:shadow-lg border border-gray-100 hover:border-gray-300 transition-all"
              >
                <img
                  src={m.image}
                  alt={m.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO DE CREACIÓN MANGA */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
              Para creadores
            </div>
            <h2 className="text-2xl sm:text-4xl text-gray-900 max-w-3xl mx-auto">
              Te acompañamos en todo el proceso de creación de tu manga
            </h2>
            <p className="text-sm text-gray-500 mt-3">Seleccioná una categoría para ver los productos</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {PROCESO_MANGA.map(p => (
              <Link
                key={p.name}
                href={p.href}
                className="group block rounded-lg overflow-hidden bg-white border border-gray-100 hover:border-gray-300 transition-all"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-2.5 text-center">
                  <div className="font-semibold text-sm text-gray-900">{p.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ¿QUÉ NECESITAS HACER? */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
            Use cases
          </div>
          <h2 className="text-2xl sm:text-4xl text-gray-900 mb-10">¿Qué necesitás hacer?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {USE_CASES.map(uc => (
              <Link
                key={uc.name}
                href={uc.href}
                className="group relative overflow-hidden rounded-xl bg-gray-900 aspect-[4/5] sm:aspect-[3/4]"
              >
                <img
                  src={uc.image}
                  alt={uc.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{uc.name}</h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80 group-hover:text-white inline-flex items-center gap-1">
                    Ver productos →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      {featured.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                  Catálogo
                </div>
                <h2 className="text-2xl sm:text-3xl text-gray-900">Productos destacados</h2>
              </div>
              <Link href="/tienda" className="hidden sm:inline-block text-sm font-medium text-gray-900 hover:underline underline-offset-4">
                Ver tienda →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.map(p => (
                <Link
                  key={p.slug}
                  href={`/producto/${p.slug}`}
                  className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {p.image && (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    )}
                  </div>
                  <div className="p-3">
                    {p.brand && (
                      <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">{p.brand}</div>
                    )}
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 mt-0.5 min-h-[2.5em]">{p.name}</div>
                    {p.price && (
                      <div className="text-sm font-semibold text-gray-900 mt-1.5">
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

      {/* PROMOCIONES */}
      {promociones.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] uppercase mb-2" style={{ color: '#dc2626' }}>
                  Ofertas
                </div>
                <h2 className="text-2xl sm:text-3xl text-gray-900">Promociones</h2>
              </div>
              <Link href="/promociones" className="hidden sm:inline-block text-sm font-medium text-gray-900 hover:underline underline-offset-4">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {promociones.map(p => (
                <Link
                  key={p.slug}
                  href={`/producto/${p.slug}`}
                  className="group relative block bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white rounded">
                    Oferta
                  </div>
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {p.image && (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    )}
                  </div>
                  <div className="p-3">
                    {p.brand && (
                      <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">{p.brand}</div>
                    )}
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 mt-0.5 min-h-[2.5em]">{p.name}</div>
                    {p.price && (
                      <div className="text-sm font-semibold mt-1.5" style={{ color: '#dc2626' }}>
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

      {/* INSTAGRAM band */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase mb-3">
            Comunidad
          </div>
          <h2 className="text-2xl sm:text-4xl mb-4">@boykot.cl</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Tutoriales, lanzamientos, obras de la comunidad chilena.
          </p>
          <a
            href="https://instagram.com/boykot.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 transition-colors text-sm uppercase tracking-wider"
          >
            Seguir en Instagram
          </a>
        </div>
      </section>
    </main>
  );
}
