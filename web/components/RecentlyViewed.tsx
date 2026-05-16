'use client';

import Link from 'next/link';
import { useRecentlyViewed } from '@/lib/use-recently-viewed';

/** Renders a "Recently viewed" carrousel. Returns null if empty (SSR-safe). */
export default function RecentlyViewed() {
  const { items, loaded } = useRecentlyViewed();
  if (!loaded || items.length === 0) return null;

  return (
    <section className="border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
          Visto recientemente
        </div>
        <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">Lo que viste</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.slice(0, 12).map(item => (
            <Link
              key={item.slug}
              href={`/producto/${item.slug}`}
              className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-lg overflow-hidden transition-all hover:shadow-md"
            >
              <div className="aspect-square bg-gray-50 overflow-hidden">
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
              </div>
              <div className="p-2 sm:p-3">
                {item.brand && (
                  <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase truncate">
                    {item.brand}
                  </div>
                )}
                <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 leading-tight mt-0.5">
                  {item.name}
                </div>
                {item.price && (
                  <div className="text-xs text-gray-700 mt-1 font-semibold">
                    ${item.price.toLocaleString('es-CL')}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
