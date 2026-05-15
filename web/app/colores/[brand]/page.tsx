import { notFound } from 'next/navigation';
import ColorCardGrid from '@/components/ColorCardGrid';
import ProductHero from '@/components/ProductHero';
import ScrollToTop from '@/components/ScrollToTop';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export function generateStaticParams() {
  return BRAND_SLUGS.map(brand => ({ brand }));
}

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = BRANDS[slug];
  if (!brand) return { title: 'No encontrado · Boykot' };
  const fullName = brand.brandName ? `${brand.brandName} ${brand.productName}` : brand.productName;
  const desc =
    brand.description ||
    `Carta de color ${fullName} con ${brand.colors.length} colores. Distribuido por Boykot en Chile con despacho a todo el país.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
  const url = `${site}/colores/${slug}`;
  return {
    title: `${fullName} · Boykot`,
    description: desc.slice(0, 160),
    openGraph: {
      title: `${fullName} · Boykot`,
      description: desc.slice(0, 200),
      url,
      siteName: 'Boykot',
      images: brand.heroImage ? [{ url: brand.heroImage }] : undefined,
      locale: 'es_CL',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullName} · Boykot`,
      description: desc.slice(0, 160),
      images: brand.heroImage ? [brand.heroImage] : undefined,
    },
    alternates: { canonical: url },
  };
}

export default async function BrandPage({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const brand = BRANDS[slug];
  if (!brand) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 pb-24">
        <nav className="text-xs text-gray-400 mb-6">
          <a href="/" className="hover:text-gray-700">Inicio</a> /{' '}
          <a href="/colores" className="hover:text-gray-700">Cartas de color</a> /{' '}
          <span className="text-gray-700">{brand.productName}</span>
        </nav>

        <ProductHero
          brandName={brand.brandName}
          productName={brand.productName}
          priceClp={brand.basePriceClp}
          colorsCount={brand.colors.length}
          heroImage={brand.heroImage}
          gallery={brand.gallery}
          description={brand.description}
        />

        <h2 className="text-sm font-semibold tracking-wide text-gray-700 uppercase mb-6 mt-12">
          Selecciona color y cantidad
        </h2>

        <ColorCardGrid brand={brand} />
      </div>
      <ScrollToTop />
    </main>
  );
}
