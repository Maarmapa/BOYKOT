'use client';

import { useState } from 'react';

interface Props {
  presetAmounts: number[];
}

export default function GiftCardForm({ presetAmounts }: Props) {
  const [amount, setAmount] = useState(presetAmounts[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; code?: string; message: string } | null>(null);

  const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/gift-cards/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          amount_clp: finalAmount,
          buyer_email: buyerEmail.trim().toLowerCase(),
          buyer_name: buyerName.trim() || undefined,
          recipient_email: recipientEmail.trim().toLowerCase() || undefined,
          recipient_name: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'fail');
      setResult({
        ok: true,
        code: data.code,
        message: `✓ Gift card creada. Código: ${data.code}. Total a pagar: $${data.amount_clp.toLocaleString('es-CL')} CLP.`,
      });
    } catch (e) {
      setResult({ ok: false, message: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Monto del regalo
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {presetAmounts.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => { setAmount(a); setCustomAmount(''); }}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-bold transition-colors ${
                amount === a && !customAmount
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-400'
              }`}
            >
              ${a.toLocaleString('es-CL')}
            </button>
          ))}
        </div>
        <input
          type="number"
          min="5000"
          step="1000"
          placeholder="O monto custom (min $5.000)"
          value={customAmount}
          onChange={e => setCustomAmount(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input type="text" required placeholder="Tu nombre" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        <input type="email" required placeholder="Tu email *" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Para quién es (opcional)</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Nombre destinatario" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="email" placeholder="Email destinatario" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={2}
          placeholder="Mensaje personalizado (opcional, ej: feliz cumple!)"
          className="w-full mt-3 border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {result && (
        <div className={`p-4 rounded text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !buyerEmail || finalAmount < 5000}
        className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90 text-white font-semibold text-sm uppercase tracking-wider rounded-md disabled:opacity-50 transition-opacity"
      >
        {submitting ? 'Creando…' : `Comprar gift card por $${finalAmount.toLocaleString('es-CL')}`}
      </button>
      <p className="text-xs text-gray-500 text-center">
        Pago se procesa al confirmar. El código se manda a tu email + al destinatario si lo agregaste.
      </p>
    </form>
  );
}
