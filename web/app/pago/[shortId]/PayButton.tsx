'use client';

import { useState } from 'react';

export default function PayButton({ shortId, existingUrl, total }: { shortId: string; existingUrl: string | null; total: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    // Si ya hay un payment_url generado, vamos directo. Si no, creamos uno.
    if (existingUrl) {
      window.location.href = existingUrl;
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payments/mp/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ short_id: shortId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falló al generar el link de pago');
      window.location.href = data.init_point;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={onPay}
        disabled={loading}
        className="w-full text-white py-4 rounded-md font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 text-base"
        style={{ backgroundColor: '#00B1EA' }}
      >
        {loading ? 'Generando link…' : `Pagar $${total.toLocaleString('es-CL')} con Mercado Pago →`}
      </button>
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </>
  );
}
