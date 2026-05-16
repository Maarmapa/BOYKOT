import Link from 'next/link';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import { BRANDS_META } from '@/lib/brands-meta';

export const metadata = {
  title: 'Tienda · Boykot — Catálogo completo de materiales de arte y graffiti',
  description:
    'Catálogo completo Boykot: marcadores Copic, pinturas Angelus, acuarelas Holbein, aerosoles Molotow, aerografía Createx + más de 20 marcas premium con stock en tiempo real.',
};

const CATEGORIES = [
  {
    slug: 'marcadores',
    title: 'Marcadores',
    description: 'Base alcohol, brush, fineliners y calligraphy',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
    count: '500+',
  },
  {
    slug: 'pintura',
    title: 'Pintura',
    description: 'Cuero, aerosol, acuarela, óleo y gouache',
    image: 'https://www.boykot.cl/wp-content/uploads/2018/12/H001.jpg',
    count: '800+',
  },
  {
    slug: 'lapices',
    title: 'Lápices',
    description: 'Lápices de colores, gel y multipropósito',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/06/b1b1a265-9f84-4d0c-b3fc-70da7332afa1-337995_1_ufa_uv-varnish_1.png',
    count: '100+',
  },
  {
    slug: 'materiales',
    title: 'Materiales',
    description: 'Soportes, libretas, pinceles, accesorios',
    image: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg?2020',
    count: '300+',
  },
];

export default function TiendaPage() {
  // Take top 12 brand color sets by # of colors for "Más populares"
  const popular = [...BRAND_SLUGS]
    .map(s => BRANDS[s])
    .sort((a, b) => b.colors.length - a.colors.length)
    .slice(0, 12);

  const featuredBrands = ['copic', 'angelus', 'holbein', 'molotow'] as const;

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Tienda</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">
            Tienda Boykot
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Catálogo completo de materiales de arte, ilustración y graffiti.
            Más de <strong className="text-white">3.500 productos</strong> con stock en tiempo real
            y envío 24-48 hrs a todo Chile.
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-8">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
              Comprá por categoría
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-900">Categorías</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/categoria/${cat.slug}`}
                className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-xl font-bold text-gray-900">{cat.title}</h3>
                    <span className="text-xs font-semibold text-gray-500">{cat.count}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured brands */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Distribuidores oficiales
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-900">Marcas destacadas</h2>
            </div>
            <Link href="/marcas" className="text-xs font-semibold text-gray-900 hover:underline whitespace-nowrap">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredBrands.map(slug => {
              const meta = BRANDS_META[slug];
              if (!meta) return null;
              return (
                <Link
                  key={slug}
                  href={`/marca/${slug}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={meta.heroImage}
                      alt={meta.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    {meta.officialDistributor && (
                      <div className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-green-50 text-green-800 rounded mb-1.5">
                        ✓ Oficial
                      </div>
                    )}
                    <div className="font-bold text-gray-900">{meta.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">{meta.tagline}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular color lines */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Top vendidos
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-900">Cartas de color más populares</h2>
            </div>
            <Link href="/colores" className="text-xs font-semibold text-gray-900 hover:underline whitespace-nowrap">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {popular.map(line => (
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
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  {line.brandName && (
                    <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-0.5">
                      {line.brandName}
                    </div>
                  )}
                  <div className="font-semibold text-gray-900 text-sm line-clamp-1">
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
      </section>

      {/* CTA WhatsApp */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿No encontrás algo?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Tenemos más de 3.500 productos. Si buscás algo específico, escribinos por WhatsApp
            y te ayudamos a encontrarlo en stock o lo pedimos.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/56223350961"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider"
              style={{ backgroundColor: '#25D366' }}
            >
              WhatsApp →
            </a>
            <Link
              href="/contacto"
              className="inline-block bg-white text-gray-900 px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors"
            >
              Formulario
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
