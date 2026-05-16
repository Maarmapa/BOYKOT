import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, relatedProducts } from '@/lib/products';
import { getWcProduct, uniqueImages, getVariationsFor } from '@/lib/wc-products';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import { BRANDS_META } from '@/lib/brands-meta';
import ProductGallery from '@/components/ProductGallery';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import WishlistButton from '@/components/WishlistButton';

interface Params {
  slug: string;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: 'Producto no encontrado · Boykot' };
  const desc = (p.description || p.short || '').slice(0, 160);
  return {
    title: `${p.name} · Boykot`,
    description: desc,
    openGraph: {
      title: `${p.name} · Boykot`,
      description: desc,
      images: p.image ? [p.image] : [],
      type: 'website',
      siteName: 'Boykot',
      locale: 'es_CL',
    },
    twitter: {
      card: 'summary_large_image',
      title: p.name,
      description: desc,
      images: p.image ? [p.image] : [],
    },
  };
}

// Intenta matchear el producto con una línea de BRANDS (carta de color) para
// poder linkear al color picker.
function matchColorLine(productSlug: string, productBrand: string | null): string | null {
  if (!productBrand) return null;
  const slug = productSlug.toLowerCase();

  // Match directo: slug igual a un brand-slug existente.
  if (BRAND_SLUGS.includes(slug)) return slug;

  // Slug del producto empieza con slug de BRANDS (más específico primero).
  const sorted = [...BRAND_SLUGS].sort((a, b) => b.length - a.length);
  for (const bSlug of sorted) {
    if (slug.startsWith(bSlug) || slug.includes(bSlug)) return bSlug;
  }
  return null;
}

// Match marca → /marca/[slug] landing dedicado
function matchBrandMeta(brand: string | null): string | null {
  if (!brand) return null;
  const b = brand.toLowerCase();
  if (BRANDS_META[b]) return b;
  return null;
}

export default async function ProductoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  // Enriquecer con wc-products.json (descripcion HTML completa + multi-image + variations)
  const wc = getWcProduct(slug);
  const variations = wc ? getVariationsFor(wc.id) : [];

  const related = relatedProducts(p, 8);
  const inStock = wc ? wc.is_in_stock : p.availability !== 'OutOfStock';

  const colorLineSlug = matchColorLine(p.slug, p.brand);
  const colorLine = colorLineSlug ? BRANDS[colorLineSlug] : null;
  const brandMetaSlug = matchBrandMeta(p.brand);

  // Gallery: priorizar imagenes de wc-products (suelen ser mas y mejor calidad),
  // fallback a products.json
  const wcGallery = wc ? uniqueImages(wc) : [];
  const galleryImages = wcGallery.length > 0
    ? wcGallery
    : ([p.image, ...(p.gallery || [])].filter(Boolean) as string[]);
  if (colorLine?.heroImage && !galleryImages.includes(colorLine.heroImage)) {
    galleryImages.push(colorLine.heroImage);
  }

  // Descripcion: preferir el HTML rico de WC sobre el plano de products.json
  const richDescription = wc?.description || '';
  const plainDescription = p.description || p.short || '';
  // Precio: WC esta mas updated, fallback a products.json
  const displayPrice = wc?.price ?? p.price;

  // Schema.org Product JSON-LD
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || p.short || `${p.name} disponible en Boykot Chile`,
    sku: p.sku || undefined,
    brand: p.brand
      ? {
          '@type': 'Brand',
          name: p.brand,
        }
      : undefined,
    image: galleryImages.length > 0 ? galleryImages : undefined,
    url: `${SITE}/producto/${p.slug}`,
    offers: p.price
      ? {
          '@type': 'Offer',
          url: `${SITE}/producto/${p.slug}`,
          priceCurrency: 'CLP',
          price: p.price,
          availability: inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Boykot',
          },
        }
      : undefined,
  };

  // Breadcrumb crumbs para JSON-LD
  const breadcrumbCrumbs = [
    { name: 'Inicio', url: SITE },
    ...(p.cat ? [{ name: p.cat.charAt(0).toUpperCase() + p.cat.slice(1), url: `${SITE}/categoria/${p.cat}` }] : []),
    ...(brandMetaSlug && p.brand ? [{ name: p.brand, url: `${SITE}/marca/${brandMetaSlug}` }] : []),
    { name: p.name, url: `${SITE}/producto/${p.slug}` },
  ];

  return (
    <main className="bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <BreadcrumbSchema crumbs={breadcrumbCrumbs} />

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <nav className="text-xs text-gray-400">
          <Link href="/" className="hover:text-gray-700">Inicio</Link>
          <span> / </span>
          {p.cat && (
            <>
              <Link href={`/categoria/${p.cat}`} className="hover:text-gray-700 capitalize">
                {p.cat}
              </Link>
              <span> / </span>
            </>
          )}
          {brandMetaSlug && (
            <>
              <Link href={`/marca/${brandMetaSlug}`} className="hover:text-gray-700">
                {p.brand}
              </Link>
              <span> / </span>
            </>
          )}
          <span className="text-gray-700 line-clamp-1">{p.name}</span>
        </nav>
      </div>

      {/* Top grid: gallery + info */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery (sticky en desktop) */}
          <ProductGallery images={galleryImages} alt={p.name} />

          {/* Info column */}
          <div>
            {/* Brand badge */}
            {p.brand && (
              <div className="flex items-center gap-3 mb-3">
                {brandMetaSlug ? (
                  <Link
                    href={`/marca/${brandMetaSlug}`}
                    className="inline-block text-xs font-semibold tracking-[0.18em] text-gray-500 hover:text-gray-900 uppercase border-b border-transparent hover:border-gray-900 transition-colors"
                  >
                    {p.brand} →
                  </Link>
                ) : (
                  <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase">
                    {p.brand}
                  </div>
                )}
                {brandMetaSlug && BRANDS_META[brandMetaSlug]?.officialDistributor && (
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-green-50 text-green-800 rounded">
                    ✓ Distribuidor oficial
                  </span>
                )}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-5 leading-tight">
              {p.name}
            </h1>

            {/* Price */}
            {displayPrice && (
              <div className="flex items-baseline gap-3 mb-5">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  ${displayPrice.toLocaleString('es-CL')}
                </div>
                {wc?.on_sale && wc.regular_price && wc.regular_price > (wc.price || 0) && (
                  <span className="text-base text-gray-400 line-through">
                    ${wc.regular_price.toLocaleString('es-CL')}
                  </span>
                )}
                <span className="text-xs text-gray-500">CLP · IVA incluido</span>
              </div>
            )}

            {/* Stock chip */}
            <div
              className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6 ${
                inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              {inStock ? 'En stock — Envío 24-48 hrs Chile' : 'Agotado — Consultar disponibilidad'}
            </div>

            {/* Description — prefer rich HTML de WC, fallback a plain de products.json */}
            {richDescription ? (
              <div
                className="wp-content text-sm sm:text-base mb-8"
                dangerouslySetInnerHTML={{ __html: richDescription }}
              />
            ) : plainDescription ? (
              <div className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line text-sm sm:text-base">
                {plainDescription}
              </div>
            ) : null}

            {/* Variations — si es producto variable (tallas/colores), mostrar opciones */}
            {variations.length > 1 && (
              <div className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
                  {variations.length} variantes disponibles
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {variations.slice(0, 9).map(v => {
                    const label = v.attributes?.map(a => a.value).join(' / ') || v.name;
                    return (
                      <div
                        key={v.id}
                        className={`text-xs p-2 rounded border ${
                          v.is_in_stock
                            ? 'bg-white border-gray-200 text-gray-900'
                            : 'bg-gray-100 border-gray-200 text-gray-400 line-through'
                        }`}
                      >
                        <div className="font-medium capitalize line-clamp-1">{label}</div>
                        {v.price && (
                          <div className="text-gray-500 mt-0.5">
                            ${v.price.toLocaleString('es-CL')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {variations.length > 9 && (
                  <div className="text-xs text-gray-500 mt-3">
                    +{variations.length - 9} variantes más. Consultá por WhatsApp.
                  </div>
                )}
              </div>
            )}

            {/* Color picker preview — si matcheamos una carta de color */}
            {colorLine && colorLine.colors.length > 1 && (
              <div className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">
                      Carta de color
                    </div>
                    <div className="font-bold text-gray-900">
                      {colorLine.colors.length} colores disponibles
                    </div>
                  </div>
                  <Link
                    href={`/colores/${colorLine.slug}`}
                    className="text-xs font-semibold text-gray-900 hover:underline whitespace-nowrap"
                  >
                    Ver todos →
                  </Link>
                </div>
                <div className="grid grid-cols-10 gap-1.5">
                  {colorLine.colors.slice(0, 30).map(c => (
                    <div
                      key={c.code + (c.sku || '')}
                      title={c.name || c.code}
                      className="aspect-square rounded border border-gray-200 overflow-hidden bg-gray-100"
                      style={c.hex ? { backgroundColor: c.hex } : undefined}
                    >
                      {!c.hex && c.imageUrl && (
                        <img src={c.imageUrl} alt={c.code} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
                {colorLine.colors.length > 30 && (
                  <div className="text-xs text-gray-500 mt-3">
                    +{colorLine.colors.length - 30} colores más
                  </div>
                )}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-6">
              {colorLine ? (
                <Link
                  href={`/colores/${colorLine.slug}`}
                  className="inline-block px-7 py-4 text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm uppercase tracking-wider"
                  style={{ backgroundColor: '#0066ff' }}
                >
                  Elegir color y comprar →
                </Link>
              ) : (
                <a
                  href={`https://wa.me/56223350961?text=${encodeURIComponent(`Hola! Quiero consultar por: ${p.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-7 py-4 text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm uppercase tracking-wider"
                  style={{ backgroundColor: '#25D366' }}
                >
                  Consultar por WhatsApp
                </a>
              )}
              <Link
                href="/contacto"
                className="inline-block px-7 py-4 border border-gray-300 text-gray-900 font-semibold rounded-md hover:border-gray-900 transition-colors text-sm uppercase tracking-wider"
              >
                Más info
              </Link>
              <WishlistButton
                slug={p.slug}
                name={p.name}
                image={p.image}
                price={displayPrice ?? undefined}
                brand={p.brand}
                className="py-4 px-5"
              />
            </div>

            {/* Pickup / shipping info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-xs text-gray-600">
              <div className="flex items-start gap-2 p-3 border border-gray-100 rounded-md">
                <span className="text-base">🚚</span>
                <div>
                  <div className="font-semibold text-gray-900">Despacho Chile</div>
                  <div>24-48 hrs hábiles · Starken / Chilexpress</div>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 border border-gray-100 rounded-md">
                <span className="text-base">🏬</span>
                <div>
                  <div className="font-semibold text-gray-900">Retiro tienda</div>
                  <div>Providencia 2251 · Metro Los Leones</div>
                </div>
              </div>
            </div>

            {p.sku && (
              <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
                SKU: <span className="font-mono">{p.sku}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="mb-8">
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Productos relacionados
              </div>
              <h2 className="text-2xl sm:text-3xl text-gray-900">Te puede interesar</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.slice(0, 8).map(r => (
                <Link
                  key={r.slug}
                  href={`/producto/${r.slug}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-lg overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    {r.brand && (
                      <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-1">
                        {r.brand}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">
                      {r.name}
                    </div>
                    {r.price && (
                      <div className="text-xs text-gray-700">
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

      {/* Sticky CTA mobile (bottom bar) */}
      <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-30 flex items-center gap-3 shadow-lg">
        {p.price && (
          <div className="flex-shrink-0">
            <div className="text-xs text-gray-500">Precio</div>
            <div className="text-base font-bold text-gray-900">
              ${p.price.toLocaleString('es-CL')}
            </div>
          </div>
        )}
        {colorLine ? (
          <Link
            href={`/colores/${colorLine.slug}`}
            className="flex-1 text-center px-4 py-3 text-white font-semibold rounded-md text-sm uppercase tracking-wider"
            style={{ backgroundColor: '#0066ff' }}
          >
            Elegir color →
          </Link>
        ) : (
          <a
            href={`https://wa.me/56223350961?text=${encodeURIComponent(`Hola! ${p.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-4 py-3 text-white font-semibold rounded-md text-sm uppercase tracking-wider"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp
          </a>
        )}
      </div>
    </main>
  );
}
