'use client';

import { useState } from 'react';

export default function CreditsAdjustForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'topup' | 'bonus' | 'adjust' | 'refund'>('topup');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          amount_clp: parseInt(amount, 10),
          type,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult({ ok: true, message: `✓ Aplicado. Nuevo saldo: $${(data.new_balance ?? 0).toLocaleString('es-CL')}` });
      setEmail('');
      setName('');
      setAmount('');
      setNote('');
      // Refresh page para que la tabla se update
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setResult({ ok: false, message: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
      <input
        type="email"
        required
        placeholder="email cliente"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="nombre (opcional)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm"
      />
      <input
        type="number"
        required
        placeholder="monto CLP (+/-)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 text-sm"
      />
      <select
        value={type}
        onChange={e => setType(e.target.value as 'topup' | 'bonus' | 'adjust' | 'refund')}
        className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
      >
        <option value="topup">Recarga</option>
        <option value="bonus">Bono regalo</option>
        <option value="refund">Reembolso</option>
        <option value="adjust">Ajuste manual</option>
      </select>
      <button
        type="submit"
        disabled={submitting}
        className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
      >
        {submitting ? 'Aplicando...' : 'Aplicar'}
      </button>
      <input
        type="text"
        placeholder="nota interna (opcional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="sm:col-span-2 md:col-span-5 border border-gray-300 rounded px-3 py-2 text-sm"
      />
      {result && (
        <div className={`sm:col-span-2 md:col-span-5 text-sm px-3 py-2 rounded ${
          result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.message}
        </div>
      )}
    </form>
  );
}
