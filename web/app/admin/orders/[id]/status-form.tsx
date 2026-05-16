'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  shortId: string;
  currentStatus: string;
}

const STATUSES = [
  { value: 'pending', label: '⏳ Pendiente' },
  { value: 'contacted', label: '📞 En contacto' },
  { value: 'confirmed', label: '✓ Confirmado' },
  { value: 'shipped', label: '📦 Enviado' },
  { value: 'completed', label: '✓✓ Completado' },
  { value: 'cancelled', label: '✗ Cancelado' },
];

export default function StatusForm({ shortId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function update() {
    if (status === currentStatus) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/orders/update-status', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ short_id: shortId, status }),
      });
      if (!res.ok) throw new Error('update_failed');
      setDone(true);
      setTimeout(() => router.refresh(), 800);
    } catch (e) {
      alert('Error: ' + (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Actualizar status</div>
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
        >
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={update}
          disabled={submitting || status === currentStatus}
          className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
            done ? 'bg-emerald-600 text-white' :
            status === currentStatus ? 'bg-gray-100 text-gray-400' :
            'bg-gray-900 text-white hover:bg-gray-700'
          }`}
        >
          {submitting ? 'Actualizando…' : done ? '✓ Actualizado' : 'Cambiar status'}
        </button>
      </div>
    </div>
  );
}
