import { notFound } from 'next/navigation';
import ColorCardGrid from '@/components/ColorCardGrid';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export function generateStaticParams() {
  return BRAND_SLUGS.map(brand => ({ brand }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = BRANDS[slug];
  if (!brand) return { title: 'No encontrado · Boykot' };
  return { title: `${brand.productName} · Boykot` };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = BRANDS[slug];
  if (!brand) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <nav className="text-sm text-gray-400 mb-2">
          <a href="/" className="hover:text-orange-500">Inicio</a> /{' '}
          <a href="/colores" className="hover:text-orange-500">Cartas de color</a> /{' '}
          <span className="text-gray-700">{brand.productName}</span>
        </nav>
        <header className="flex items-start justify-between mb-6 pb-6 border-b gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{brand.productName}</h1>
            <div className="text-2xl font-semibold text-gray-800">
              ${brand.basePriceClp.toLocaleString('es-CL')}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {brand.colors.length} colores · BSale product {brand.bsaleProductId || '—'}
            </div>
          </div>
          {brand.heroImage && (
            <img
              src={brand.heroImage}
              alt={brand.productName}
              className="w-24 h-24 object-cover rounded-lg border border-gray-100 flex-shrink-0"
            />
          )}
        </header>
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">
          Selecciona color y cantidad para completar la compra
        </h2>
        <ColorCardGrid brand={brand} />
      </div>
    </main>
  );
}
