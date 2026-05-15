'use client';

import { useState } from 'react';

interface Props {
  brandName?: string;
  productName: string;
  priceClp: number;
  colorsCount: number;
  heroImage?: string;
  gallery?: string[];
  description?: string;
}

export default function ProductHero({
  brandName,
  productName,
  priceClp,
  colorsCount,
  heroImage,
  gallery,
  description,
}: Props) {
  const images = [heroImage, ...(gallery ?? [])].filter(Boolean) as string[];
  const [active, setActive] = useState(images[0] ?? '');

  return (
    <header className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
      {/* Left: large main photo + thumbs */}
      <div>
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden rounded-lg">
          {active && (
            <img
              src={active}
              alt={productName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.slice(0, 4).map(src => (
              <button
                key={src}
                onClick={() => setActive(src)}
                className={`relative aspect-square overflow-hidden rounded-md transition-all ${
                  active === src ? 'ring-2 ring-gray-900' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: brand → product → price → description */}
      <div className="flex flex-col justify-center">
        {brandName && (
          <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-1">
            {brandName}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{productName}</h1>
        <div className="text-3xl text-gray-900 mb-4">
          ${priceClp.toLocaleString('es-CL')}
        </div>
        <div className="text-xs text-gray-400 mb-4">{colorsCount} colores disponibles</div>
        {description && (
          <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
        )}
      </div>
    </header>
  );
}
