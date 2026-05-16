import Link from 'next/link';
import { allProductSlugs, getProduct } from '@/lib/products';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export const metadata = {
  title: 'Buscar · Boykot',
  description: 'Buscá productos, marcas y colores en el catálogo completo de Boykot.',
};

interface SearchResult {
  type: 'product' | 'brand' | 'color';
  slug: string;
  href: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  brand?: string | null;
  price?: number | null;
}

function searchProducts(query: string, max = 80): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  const slugs = allProductSlugs();
  const results: SearchResult[] = [];

  for (const slug of slugs) {
    if (results.length >= max) break;
    const p = getProduct(slug);
    if (!p) continue;
    const hay = `${p.name} ${p.brand || ''} ${p.sku || ''} ${slug}`.toLowerCase();
    if (hay.includes(q)) {
      results.push({
        type: 'product',
        slug,
        href: `/producto/${slug}`,
        title: p.name,
        subtitle: p.brand || undefined,
        image: p.image,
        brand: p.brand,
        price: p.price,
      });
    }
  }
  return results;
}

function searchBrands(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  const out: SearchResult[] = [];
  for (const slug of BRAND_SLUGS) {
    const b = BRANDS[slug];
    const hay = `${b.brandName || ''} ${b.productName} ${slug}`.toLowerCase();
    if (hay.includes(q)) {
      out.push({
        type: 'brand',
        slug,
        href: `/colores/${slug}`,
        title: b.productName,
        subtitle: b.brandName ? `${b.brandName} · ${b.colors.length} colores` : `${b.colors.length} colores`,
        image: b.heroImage,
        brand: b.brandName,
        price: b.basePriceClp,
      });
    }
  }
  return out;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: queryParam } = await searchParams;
  const query = (queryParam || '').slice(0, 60);

  const brandResults = query ? searchBrands(query) : [];
  const productResults = query ? searchProducts(query) : [];
  const totalResults = brandResults.length + productResults.length;

  return (
    <main className="bg-white min-h-screen">
      {/* Dark hero with search bar */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Buscar</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 leading-tight">
            {query ? <>Resultados para «{query}»</> : 'Buscar en Boykot'}
          </h1>

          <form action="/buscar" method="get" className="max-w-2xl">
            <div className="flex items-center bg-white rounded-md overflow-hidden shadow-lg">
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Copic, Angelus, marcadores, posca..."
                className="flex-1 px-5 py-4 text-base text-gray-900 outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-4 bg-gray-900 text-white font-semibold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
              >
                Buscar
              </button>
            </div>
          </form>

          {query && (
            <div className="mt-6 text-sm text-gray-400">
              {totalResults > 0 ? (
                <>
                  <strong className="text-white">{totalResults}</strong> resultados ·{' '}
                  {brandResults.length} cartas de color · {productResults.length} productos
                </>
              ) : (
                <>Sin resultados. Probá con otra palabra o escribinos por WhatsApp.</>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Brand / color lines first */}
      {brandResults.length > 0 && (
        <section className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h2 className="text-2xl text-gray-900 mb-6">Cartas de color ({brandResults.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {brandResults.map(r => (
                <Link
                  key={r.slug}
                  href={r.href}
                  className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-lg overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                    {r.image ? (
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="p-3">
                    {r.brand && (
                      <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-0.5">
                        {r.brand}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">{r.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.subtitle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {productResults.length > 0 && (
        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h2 className="text-2xl text-gray-900 mb-6">Productos ({productResults.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {productResults.map(r => (
                <Link
                  key={r.slug}
                  href={r.href}
                  className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {r.image ? (
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="p-2.5">
                    {r.brand && (
                      <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                        {r.brand}
                      </div>
                    )}
                    <div className="text-xs font-medium text-gray-900 line-clamp-2 mt-0.5 min-h-[2.4em]">{r.title}</div>
                    {r.price && (
                      <div className="text-xs font-semibold text-gray-900 mt-1">
                        ${r.price.toLocaleString('es-CL')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {query && totalResults === 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl text-gray-900 mb-2">No encontramos resultados</h2>
          <p className="text-gray-600 mb-6">
            Probá con otra palabra, o pedinos lo que necesitás por WhatsApp.
            Tenemos más de <strong>3.500 productos</strong> en stock.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/marcas" className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-700">
              Ver todas las marcas
            </Link>
            <a
              href={`https://wa.me/56223350961?text=${encodeURIComponent(`Hola! Busco: ${query}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-5 py-2.5 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              WhatsApp
            </a>
          </div>
        </section>
      )}

      {/* No query state — show popular brands */}
      {!query && (
        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-xl text-gray-900 mb-6">Búsquedas populares</h2>
            <div className="flex flex-wrap gap-2">
              {['Copic Sketch', 'Angelus pintura cuero', 'Molotow Premium', 'Holbein acuarela', 'POSCA', 'Createx aerografía', 'Marcadores', 'Pintura'].map(term => (
                <Link
                  key={term}
                  href={`/buscar?q=${encodeURIComponent(term)}`}
                  className="inline-block text-sm px-4 py-2 bg-gray-100 hover:bg-gray-900 hover:text-white rounded-full text-gray-700 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
