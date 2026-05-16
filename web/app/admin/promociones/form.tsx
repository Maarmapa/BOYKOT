'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PromoAdminForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed' | 'free_shipping'>('percent');
  const [value, setValue] = useState('');
  const [minSubtotal, setMinSubtotal] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/promo-codes/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discount_type: type,
          discount_value: parseInt(value, 10) || 0,
          min_subtotal_clp: minSubtotal ? parseInt(minSubtotal, 10) : null,
          max_uses: maxUses ? parseInt(maxUses, 10) : null,
          valid_until: validUntil || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'fail');
      setResult({ ok: true, msg: `✓ Código ${data.code} creado` });
      setCode(''); setValue(''); setMinSubtotal(''); setMaxUses(''); setValidUntil('');
      setTimeout(() => router.refresh(), 800);
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <input type="text" placeholder="CÓDIGO (ej WELCOME10)" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="border border-gray-300 rounded px-3 py-2 text-sm font-mono uppercase sm:col-span-2" />
      <select value={type} onChange={e => setType(e.target.value as 'percent' | 'fixed' | 'free_shipping')} className="border border-gray-300 rounded px-3 py-2 text-sm bg-white">
        <option value="percent">% descuento</option>
        <option value="fixed">$ fijo</option>
        <option value="free_shipping">Envío gratis</option>
      </select>
      <input
        type="number"
        required
        placeholder={type === 'percent' ? '10 (= 10%)' : type === 'fixed' ? '5000 (CLP)' : '0'}
        value={value}
        onChange={e => setValue(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm"
        disabled={type === 'free_shipping'}
      />
      <input type="number" placeholder="Min subtotal CLP" value={minSubtotal} onChange={e => setMinSubtotal(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
      <button type="submit" disabled={submitting} className="bg-gray-900 text-white rounded text-sm font-semibold disabled:opacity-50">
        {submitting ? 'Creando…' : 'Crear'}
      </button>
      <input type="number" placeholder="Max usos" value={maxUses} onChange={e => setMaxUses(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
      <input type="date" placeholder="Valido hasta" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm sm:col-span-2" />
      {result && (
        <div className={`sm:col-span-3 lg:col-span-3 text-sm px-3 py-2 rounded ${result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {result.msg}
        </div>
      )}
    </form>
  );
}
