'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  shortId: string;
  itemCount: number;
}

export default function ReorderButton({ shortId, itemCount }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reorder() {
    setBusy(true);
    try {
      const res = await fetch('/api/cart/reorder', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ short_id: shortId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'failed');
      router.push('/carrito');
    } catch (e) {
      alert('Error al copiar items: ' + (e as Error).message);
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={reorder}
      disabled={busy}
      className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider disabled:opacity-50"
    >
      {busy ? 'Copiando…' : `🔁 Comprar de nuevo (${itemCount})`}
    </button>
  );
}
