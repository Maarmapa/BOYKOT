'use client';

import Link from 'next/link';
import { useCart } from '@/lib/use-cart';

export default function CartBadge() {
  const { cart } = useCart();
  const count = cart?.items.reduce((s, i) => s + i.qty, 0) ?? 0;

  return (
    <Link
      href="/carrito"
      className="relative inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
    >
      <span className="hidden sm:inline">Carrito</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -top-2 -right-2 text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center text-white"
          style={{ backgroundColor: '#0066ff' }}
          aria-label={`${count} items`}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
