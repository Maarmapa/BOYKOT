'use client';

import { useState } from 'react';

interface Props {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: Props) {
  const validImages = images.filter(Boolean);
  const [active, setActive] = useState(validImages[0] ?? '');

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" />
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      {/* Hero image */}
      <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3 sm:mb-4">
        <img
          src={active}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {validImages.slice(0, 10).map(src => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className={`relative aspect-square overflow-hidden rounded-md transition-all ${
                active === src
                  ? 'ring-2 ring-gray-900 opacity-100'
                  : 'ring-1 ring-gray-200 opacity-70 hover:opacity-100'
              }`}
              aria-label="Ver imagen"
            >
              <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
