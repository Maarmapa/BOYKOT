import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, relatedProducts } from '@/lib/products';

interface Params {
  slug: string;
}

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

export default async function ProductoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  const related = relatedProducts(p, 6);
  const inStock = p.availability !== 'OutOfStock';

  return (
    <main className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <nav className="text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-700">Inicio</Link>
          {p.cat && (
            <>
              <span> / </span>
              <Link href={`/categoria/${p.cat}`} className="hover:text-gray-700">
                {p.cat.charAt(0).toUpperCase() + p.cat.slice(1)}
              </Link>
            </>
          )}
          <span> / </span>
          <span className="text-gray-700">{p.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
              {p.image ? (
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </div>
            {p.gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {p.gallery.slice(0, 4).map((g, i) => (
                  <div key={i} className="aspect-square bg-gray-50 rounded-md overflow-hidden">
                    <img src={g} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {p.brand && (
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                {p.brand}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl text-gray-900 mb-4">{p.name}</h1>

            {p.price && (
              <div className="text-2xl font-bold text-gray-900 mb-6">
                ${p.price.toLocaleString('es-CL')}
              </div>
            )}

            <div
              className={`inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded mb-6 ${
                inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-amber-500'}`}
              />
              {inStock ? 'En stock' : 'Agotado'}
            </div>

            {p.description && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
                {p.description}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mb-6">
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-7 py-4 border border-gray-300 text-gray-900 font-semibold rounded-md hover:border-gray-900 transition-colors text-sm uppercase tracking-wider"
                >
                  Ver en boykot.cl ↗
                </a>
              )}
              <Link
                href="/contacto"
                className="inline-block px-7 py-4 text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm uppercase tracking-wider"
                style={{ backgroundColor: '#0066ff' }}
              >
                Consultar
              </Link>
            </div>

            {p.sku && (
              <div className="text-xs text-gray-400 mt-4">SKU: {p.sku}</div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
              Relacionados
            </div>
            <h2 className="text-2xl text-gray-900 mb-6">Te puede interesar</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/producto/${r.slug}`}
                  className="group block"
                >
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-2">
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-900 line-clamp-2">{r.name}</div>
                  {r.price && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      ${r.price.toLocaleString('es-CL')}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
