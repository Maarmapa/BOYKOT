'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWishlist } from '@/lib/use-wishlist';

export default function FavoritosClient() {
  const router = useRouter();
  const { items, loading, remove, refresh } = useWishlist();
  const [moving, setMoving] = useState(false);

  async function moveAllToCart() {
    setMoving(true);
    try {
      const res = await fetch('/api/wishlist/move-to-cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ remove_after: true }),
      });
      const data = await res.json();
      if (data.moved > 0) {
        await refresh();
        router.push('/carrito');
      } else {
        alert(`No se pudieron mover los items: ${data.failed_slugs?.join(', ') || ''}`);
        setMoving(false);
      }
    } catch (e) {
      alert('Error: ' + (e as Error).message);
      setMoving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-5">♡</div>
        <h2 className="text-2xl text-gray-900 mb-2">Aún no tienes favoritos</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Tocá el corazón en cualquier producto para guardarlo y verlo después acá.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/tienda"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-700"
          >
            Ver tienda
          </Link>
          <Link
            href="/marcas"
            className="inline-block border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:border-gray-900"
          >
            Explorar marcas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-6 flex items-baseline justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
        </p>
        <button
          type="button"
          onClick={moveAllToCart}
          disabled={moving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {moving ? 'Moviendo…' : `🛒 Mover todo al carrito (${items.length})`}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map(item => (
          <div
            key={item.slug}
            className="group bg-white border border-gray-200 hover:border-gray-900 rounded-lg overflow-hidden transition-all hover:shadow-md"
          >
            <Link href={`/producto/${item.slug}`} className="block aspect-square bg-gray-50 overflow-hidden relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
              )}
            </Link>
            <div className="p-3 sm:p-4">
              {item.brand && (
                <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase mb-1">
                  {item.brand}
                </div>
              )}
              <Link
                href={`/producto/${item.slug}`}
                className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 hover:underline"
              >
                {item.name}
              </Link>
              <div className="flex items-center justify-between">
                {item.price ? (
                  <span className="text-sm font-bold text-gray-900">
                    ${item.price.toLocaleString('es-CL')}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Consultar</span>
                )}
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="text-xs text-gray-400 hover:text-rose-600 transition-colors"
                  aria-label="Quitar de favoritos"
                  title="Quitar"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
