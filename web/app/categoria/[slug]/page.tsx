import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BRANDS } from '@/lib/colors/brands';
import type { BrandColorSet } from '@/lib/colors/types';
import { productsByCategory, type Product } from '@/lib/products';

// Map each top-level category to the brand-slugs that live under it.
const CATEGORIES: Record<string, { title: string; brandSlugs: string[]; intro?: string }> = {
  marcadores: {
    title: 'Marcadores',
    intro: 'Marcadores base alcohol, fineliners, calligraphy y rotuladores.',
    brandSlugs: [
      'copic-sketch', 'copic-ink', 'copic-ciao', 'copic-classic', 'copic-wide',
      'aqua-color-brush', 'aqua-twin',
      'uni-posca-5m',
      'zig-calligraphy', 'zig-acrylista-6mm', 'zig-acrylista-15mm', 'zig-fabricolor-twin',
      'atyou-spica', 'kirarina-cute',
    ],
  },
  lapices: {
    title: 'Lápices',
    intro: 'Lápices de colores, gel y multipropósito.',
    brandSlugs: ['poplol-gel'],
  },
  pintura: {
    title: 'Pintura',
    intro: 'Pintura para cuero, aerosoles, acuarela, óleo y gouache.',
    brandSlugs: [
      'angelus-standard-1oz', 'angelus-standard-4oz',
      'angelus-pearlescents-1oz', 'angelus-pearlescents-4oz',
      'angelus-neon-1oz', 'angelus-neon-4oz',
      'angelus-glitterlites-1oz',
      'angelus-tintura-cuero-3oz', 'angelus-tintura-gamuza-3oz',
      'molotow-premium', 'molotow-premium-neon', 'molotow-premium-plus',
      'createx-airbrush-60ml', 'createx-airbrush-120ml', 'createx-airbrush-240ml',
      'createx-illustration-30ml', 'wicked-colors-480ml',
      'holbein-acuarela-15ml', 'holbein-acuarela-60ml',
      'holbein-gouache-15ml', 'holbein-oleo-20ml',
      'holbein-acryla-gouache-20ml', 'holbein-acryla-gouache-40ml',
    ],
  },
  materiales: {
    title: 'Materiales',
    intro: 'Pigmentos, polvos especiales y aditivos.',
    brandSlugs: ['solar-color-dust-10gr', 'chameleon-pigments-10gr', 'ultra-thermal-dust-10gr'],
  },
};

const PAGE_SIZE = 60;

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return { title: 'No encontrado · Boykot' };
  return { title: `${cat.title} · Boykot` };
}

function sortProducts(a: Product, b: Product): number {
  const aIn = a.availability !== 'OutOfStock' ? 0 : 1;
  const bIn = b.availability !== 'OutOfStock' ? 0 : 1;
  if (aIn !== bIn) return aIn - bIn;
  return a.name.localeCompare(b.name, 'es');
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const cat = CATEGORIES[slug];
  if (!cat) notFound();

  const brands = cat.brandSlugs
    .map(s => BRANDS[s])
    .filter((b): b is BrandColorSet => Boolean(b));

  const products = productsByCategory(slug as Product['cat']).sort(sortProducts);
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const slice = products.slice(start, start + PAGE_SIZE);

  const otherCategories = Object.entries(CATEGORIES).filter(([s]) => s !== slug);

  return (
    <main className="bg-white">
      {/* Dark hero */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <Link href="/tienda" className="hover:text-white">Tienda</Link> /{' '}
            <span className="text-gray-300">{cat.title}</span>
          </nav>
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-400 uppercase mb-2">
            Categoría
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">{cat.title}</h1>
          {cat.intro && <p className="text-lg text-gray-300 max-w-2xl leading-relaxed mb-4">{cat.intro}</p>}
          <div className="flex items-baseline gap-6 text-sm text-gray-400 mb-6">
            <div><strong className="text-white text-xl">{brands.length}</strong> cartas</div>
            <div><strong className="text-white text-xl">{brands.reduce((s, b) => s + b.colors.length, 0)}</strong> colores</div>
            {products.length > 0 && <div><strong className="text-white text-xl">{products.length}</strong> productos</div>}
          </div>
          {/* Category jumper */}
          <div className="flex flex-wrap gap-2 mt-6">
            {otherCategories.map(([s, c]) => (
              <Link
                key={s}
                href={`/categoria/${s}`}
                className="inline-block text-xs font-medium px-3 py-1.5 border border-gray-700 hover:border-white rounded-full text-gray-300 hover:text-white transition-colors"
              >
                {c.title} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {brands.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl text-gray-900 mb-6">Cartas de color</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {brands.map(brand => (
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
                    <div className="font-semibold text-gray-900 text-sm truncate">{brand.productName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {brand.colors.length} colores · ${brand.basePriceClp.toLocaleString('es-CL')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl text-gray-900">Todos los productos</h2>
              <div className="text-xs text-gray-500">
                Página {page} de {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {slice.map(p => {
                const inStock = p.availability !== 'OutOfStock';
                return (
                  <Link
                    key={p.slug}
                    href={`/producto/${p.slug}`}
                    className="group block bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      {!inStock && (
                        <div className="absolute top-2 left-2 bg-white/95 text-amber-700 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Agotado
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      {p.brand && (
                        <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                          {p.brand}
                        </div>
                      )}
                      <div className="text-xs font-medium text-gray-900 line-clamp-2 mt-0.5 min-h-[2.4em]">{p.name}</div>
                      {p.price && (
                        <div className="text-xs font-semibold text-gray-900 mt-1">
                          ${p.price.toLocaleString('es-CL')}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav className="flex justify-center gap-1 mt-10">
                {page > 1 && (
                  <Link
                    href={`/categoria/${slug}?page=${page - 1}`}
                    className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-md hover:border-gray-400"
                  >
                    ← Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/categoria/${slug}?page=${page + 1}`}
                    className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-md hover:border-gray-400"
                  >
                    Siguiente →
                  </Link>
                )}
              </nav>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
