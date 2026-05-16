'use client';

import { useState } from 'react';
import { useWishlist } from '@/lib/use-wishlist';
import { useToast } from './Toast';

interface Props {
  slug: string;
  name: string;
  image?: string | null;
  price?: number | null;
  brand?: string | null;
  variant?: 'icon' | 'button';
  className?: string;
}

export default function WishlistButton({
  slug,
  name,
  image,
  price,
  brand,
  variant = 'button',
  className = '',
}: Props) {
  const { slugs, toggle } = useWishlist();
  const toast = useToast();
  const isInWishlist = slugs.has(slug);
  const [pulsing, setPulsing] = useState(false);

  async function onClick() {
    const wasIn = isInWishlist;
    setPulsing(true);
    await toggle({ slug, name, image, price, brand });
    toast.push(wasIn ? '♡ Quitado de favoritos' : '❤ Agregado a favoritos', 'success', 2000);
    setTimeout(() => setPulsing(false), 280);
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          isInWishlist
            ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        } ${pulsing ? 'scale-90' : ''} ${className}`}
        style={{ transition: 'background-color 200ms, transform 180ms' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-md font-semibold text-sm uppercase tracking-wider transition-colors ${
        isInWishlist
          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          : 'bg-white text-gray-900 border border-gray-300 hover:border-gray-900'
      } ${pulsing ? 'scale-95' : ''} ${className}`}
      style={{ transition: 'background-color 200ms, transform 180ms' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
      </svg>
      {isInWishlist ? 'En favoritos' : 'Guardar'}
    </button>
  );
}
