import { notFound } from 'next/navigation';
import ColorCardGrid from '@/components/ColorCardGrid';
import ProductHero from '@/components/ProductHero';
import ScrollToTop from '@/components/ScrollToTop';
import { BRANDS } from '@/lib/colors/brands';
import { getProductStock } from '@/lib/stock';
import { getOverride, applyOverride } from '@/lib/brand-overrides';

// Las brand pages renderizan en runtime (no en build) porque getProductStock
// hace varias requests paginadas a BSale por cada brand. Prerender en build
// de 36 brands juntas excede los 60s de Vercel. El usuario igual ve la
// página rápido por el cache de Next (3600s tag-invalidated).
export const dynamic = 'force-dynamic';

// No prerender: con dynamic='force-dynamic' arriba, no hace falta listar
// params en build. Cada brand se renderiza on-demand cuando alguien la pide.
// Mantenemos BRAND_SLUGS exportado por si en el futuro se quiere reactivar
// el prerender de las que NO tienen BSale (más rápidas).

export async function generateMetadata({ params }: { params: Promise<{ brand: string }> }) {
  const { brand: slug } = await params;
  const baseBrand = BRANDS[slug];
  if (!baseBrand) return { title: 'No encontrado · Boykot' };
  const override = await getOverride(slug);
  if (override?.hidden) return { title: 'No encontrado · Boykot' };
  const brand = applyOverride(baseBrand, override);
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
  const baseBrand = BRANDS[slug];
  if (!baseBrand) notFound();

  // Aplicar overrides editables desde /admin (precio, descripción, hero, etc).
  const override = await getOverride(slug);
  if (override?.hidden) notFound();
  const brand = applyOverride(baseBrand, override);

  // Pull live stock from BSale per variantId, then bucket by color code.
  // Falls back to empty map if token missing or fetch fails — grid will then
  // assume in-stock (the previous behaviour).
  let stockMap: Record<string, number> | undefined;
  if (brand.bsaleProductId && process.env.BSALE_ACCESS_TOKEN) {
    try {
      // Pasamos los variantIds explícitos porque BSale `?productid=` filter
      // está roto en /stocks.json (ver lib/bsale-api.ts).
      const variantIds = brand.colors
        .map(c => c.variantId)
        .filter((v): v is number => typeof v === 'number');
      const rows = await getProductStock(brand.bsaleProductId, variantIds);
      const byVariant: Record<number, number> = {};
      for (const r of rows) byVariant[r.variant_id] = r.available;
      stockMap = {};
      for (const c of brand.colors) {
        if (typeof c.variantId === 'number' && c.variantId in byVariant) {
          stockMap[c.code] = byVariant[c.variantId];
        }
      }
    } catch {
      // ignore — grid will assume in-stock
    }
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
  const fullName = brand.brandName ? `${brand.brandName} ${brand.productName}` : brand.productName;
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fullName,
    image: [brand.heroImage, ...(brand.gallery ?? [])].filter(Boolean),
    description: brand.description || `${fullName} — ${brand.colors.length} colores disponibles. Distribuido por Boykot en Chile.`,
    brand: brand.brandName ? { '@type': 'Brand', name: brand.brandName } : undefined,
    sku: `BOYKOT-${slug}`,
    offers: {
      '@type': 'AggregateOffer',
      url: `${site}/colores/${slug}`,
      priceCurrency: 'CLP',
      lowPrice: brand.basePriceClp,
      highPrice: brand.basePriceClp,
      offerCount: brand.colors.length,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Boykot', url: site },
    },
  };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
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

        <ColorCardGrid brand={brand} stockMap={stockMap} />
      </div>
      <ScrollToTop />
    </main>
  );
}
