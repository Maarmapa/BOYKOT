'use client';

import { useState } from 'react';

export default function RedeemForm() {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; amount?: number; message: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.message || data.error || 'Código inválido');
      }
      setResult({
        ok: true,
        amount: data.amount_clp,
        message: `🎉 ¡Canjeado! Se agregaron $${data.amount_clp.toLocaleString('es-CL')} CLP a tu wallet Boykot Credits.`,
      });
      setCode('');
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Código de gift card
        </label>
        <input
          type="text"
          required
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="GC-XXXX-XXXX-XXXX"
          className="w-full border-2 border-gray-300 focus:border-gray-900 rounded-lg px-4 py-3 text-lg font-mono uppercase outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Tu email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@email.cl"
          className="w-full border-2 border-gray-300 focus:border-gray-900 rounded-lg px-4 py-3 text-base outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          El saldo se acredita a la wallet asociada a este email.
        </p>
      </div>

      {result && (
        <div className={`p-4 rounded text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !code || !email}
        className="w-full px-6 py-4 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm uppercase tracking-wider rounded-md disabled:opacity-50"
      >
        {submitting ? 'Canjeando…' : 'Canjear código'}
      </button>
    </form>
  );
}
