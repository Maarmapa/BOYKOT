'use client';

import { useState } from 'react';

interface Props {
  productSlug: string;
  productName: string;
  productSku?: string | null;
  variantId?: number | null;
}

export default function BackInStockNotify({ productSlug, productName, productSku, variantId }: Props) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');
    setError(null);
    try {
      const res = await fetch('/api/back-in-stock', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          product_slug: productSlug,
          product_name: productName,
          product_sku: productSku || undefined,
          variant_id: variantId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
      setState('success');
    } catch (e) {
      setError((e as Error).message);
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
        <div className="font-semibold text-emerald-900 mb-1">✓ Te avisamos cuando vuelva</div>
        <p className="text-emerald-700 text-xs">
          Te mandamos un mail a <strong>{email}</strong> apenas haya stock.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="text-sm font-semibold text-amber-900 mb-2">
        ⏳ Avisarme cuando vuelva
      </div>
      <p className="text-xs text-amber-800 mb-3">
        Dejá tu email y te escribimos en el momento que <strong>{productName}</strong> tenga stock.
      </p>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.cl"
          className="flex-1 min-w-[180px] border border-amber-300 focus:border-amber-600 rounded px-3 py-2 text-sm outline-none bg-white"
        />
        <button
          type="submit"
          disabled={state === 'submitting' || !email}
          className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded disabled:opacity-50"
        >
          {state === 'submitting' ? 'Anotando…' : 'Avisarme'}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
