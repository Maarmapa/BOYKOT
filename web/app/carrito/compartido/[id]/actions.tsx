'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  cartId: string;
  itemCount: number;
}

export default function SharedCartActions({ cartId, itemCount }: Props) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);
  const [done, setDone] = useState(false);

  async function copyToMyCart() {
    setCopying(true);
    try {
      const res = await fetch('/api/cart/import-shared', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ source_cart_id: cartId }),
      });
      if (!res.ok) throw new Error('import_failed');
      setDone(true);
      setTimeout(() => router.push('/carrito'), 500);
    } catch (e) {
      alert('No pudimos copiar el carrito: ' + (e as Error).message);
      setCopying(false);
    }
  }

  function shareLink() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={copyToMyCart}
        disabled={copying}
        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider disabled:opacity-50"
      >
        {copying ? 'Copiando…' : done ? '✓ Copiado' : `Copiar ${itemCount} items a mi carrito →`}
      </button>
      <button
        type="button"
        onClick={shareLink}
        className="bg-white border border-gray-300 hover:border-gray-900 text-gray-900 px-4 py-3 rounded-md font-semibold text-sm uppercase tracking-wider"
      >
        🔗 Compartir link
      </button>
    </div>
  );
}
