import { Suspense } from 'react';
import Link from 'next/link';
import { getProduct } from '@/lib/products';
import { getWcProduct } from '@/lib/wc-products';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Comparar productos · Boykot',
  description: 'Comparar hasta 4 productos lado a lado: precio, stock, marca, descripción.',
};

interface PageProps {
  searchParams: Promise<{ slugs?: string }>;
}

export default async function CompararPage({ searchParams }: PageProps) {
  const { slugs: slugsParam } = await searchParams;
  const slugs = (slugsParam || '').split(',').filter(Boolean).slice(0, 4);

  const products = slugs
    .map(s => {
      const p = getProduct(s);
      if (!p) return null;
      const wc = getWcProduct(s);
      return { ...p, wc };
    })
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof getProduct>> & { wc: ReturnType<typeof getWcProduct> }>;

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Comparar</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl mb-2">Comparar productos</h1>
          <p className="text-sm text-gray-400">
            Hasta 4 productos lado a lado. {products.length}/4 seleccionados.
          </p>
        </div>
      </section>

      <Suspense fallback={null}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <ComparisonTable products={products} />
          )}
        </div>
      </Suspense>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
      <div className="text-5xl mb-4">⚖</div>
      <h2 className="text-xl text-gray-900 mb-2">Aún no hay productos para comparar</h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
        Buscá productos y agregalos a comparar desde la tienda.
      </p>
      <Link
        href="/tienda"
        className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-700"
      >
        Ir a la tienda
      </Link>
    </div>
  );
}

function ComparisonTable({ products }: { products: Array<ReturnType<typeof getProduct> & { wc?: ReturnType<typeof getWcProduct> }> }) {
  const cols = products.length;
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm grid-cols-${cols + 1}`}>
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="w-32 text-left py-3 px-2 align-top text-xs uppercase tracking-wider text-gray-500"></th>
            {products.map(p => (
              <th key={p!.slug} className="text-center py-4 px-3 align-top">
                <div className="aspect-square w-full bg-gray-50 rounded-lg overflow-hidden mb-3">
                  {p!.image && <img src={p!.image} alt={p!.name} className="w-full h-full object-cover" />}
                </div>
                {p!.brand && (
                  <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-1">
                    {p!.brand}
                  </div>
                )}
                <Link
                  href={`/producto/${p!.slug}`}
                  className="font-semibold text-gray-900 hover:underline text-sm line-clamp-2 block"
                >
                  {p!.name}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <Row label="Precio">
            {products.map(p => (
              <td key={p!.slug} className="py-3 px-3 text-center font-bold text-gray-900">
                {p!.price ? `$${p!.price.toLocaleString('es-CL')}` : '—'}
              </td>
            ))}
          </Row>
          <Row label="Stock">
            {products.map(p => (
              <td key={p!.slug} className="py-3 px-3 text-center">
                <StockBadge availability={p!.availability} />
              </td>
            ))}
          </Row>
          <Row label="SKU">
            {products.map(p => (
              <td key={p!.slug} className="py-3 px-3 text-center font-mono text-xs text-gray-600">
                {p!.sku || '—'}
              </td>
            ))}
          </Row>
          <Row label="Categoría">
            {products.map(p => (
              <td key={p!.slug} className="py-3 px-3 text-center text-xs text-gray-600 capitalize">
                {p!.cat || '—'}
              </td>
            ))}
          </Row>
          <Row label="Descripción">
            {products.map(p => (
              <td key={p!.slug} className="py-3 px-3 text-xs text-gray-700 align-top">
                <div className="line-clamp-6">{p!.short || p!.description?.slice(0, 250) || '—'}</div>
              </td>
            ))}
          </Row>
          <Row label="Acciones">
            {products.map(p => (
              <td key={p!.slug} className="py-3 px-3 text-center">
                <Link
                  href={`/producto/${p!.slug}`}
                  className="inline-block bg-gray-900 text-white text-xs uppercase tracking-wider font-semibold px-3 py-2 rounded hover:bg-gray-700"
                >
                  Ver producto →
                </Link>
              </td>
            ))}
          </Row>
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th className="w-32 text-left py-3 px-2 align-top text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </th>
      {children}
    </tr>
  );
}

function StockBadge({ availability }: { availability: string }) {
  if (availability === 'OutOfStock') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Agotado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      En stock
    </span>
  );
}
