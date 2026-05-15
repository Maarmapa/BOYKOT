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
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 pb-24">
        <nav className="text-xs text-gray-400 mb-4">
          <a href="/" className="hover:text-gray-700">Inicio</a> /{' '}
          <a href="/colores" className="hover:text-gray-700">Cartas de color</a> /{' '}
          <span className="text-gray-700">{brand.productName}</span>
        </nav>

        <header className="text-center mb-10">
          {brand.heroImage && (
            <img
              src={brand.heroImage}
              alt={brand.productName}
              className="w-28 h-28 mx-auto mb-4 object-cover rounded-lg"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.productName}</h1>
          <div className="text-2xl text-gray-900">
            ${brand.basePriceClp.toLocaleString('es-CL')}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {brand.colors.length} colores disponibles
          </div>
        </header>

        <ColorCardGrid brand={brand} />
      </div>
    </main>
  );
}
