import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BRANDS } from '@/lib/colors/brands';
import type { BrandColorSet } from '@/lib/colors/types';

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

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) return { title: 'No encontrado · Boykot' };
  return { title: `${cat.title} · Boykot` };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug];
  if (!cat) notFound();

  const brands = cat.brandSlugs
    .map(s => BRANDS[s])
    .filter((b): b is BrandColorSet => Boolean(b));

  return (
    <main className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <span className="text-gray-700">{cat.title}</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{cat.title}</h1>
          {cat.intro && <p className="text-gray-600 max-w-2xl">{cat.intro}</p>}
          <div className="text-xs text-gray-400 mt-2">
            {brands.length} cartas · {brands.reduce((s, b) => s + b.colors.length, 0)} colores
          </div>
        </header>

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
      </div>
    </main>
  );
}
