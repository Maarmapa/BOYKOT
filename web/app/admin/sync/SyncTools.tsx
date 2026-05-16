'use client';

import { useState } from 'react';

interface SyncResult {
  ok: boolean;
  endpoint: string;
  data?: unknown;
  error?: string;
  took_ms?: number;
}

const ACTIONS = [
  { label: '🔄 Refresh stock snapshot (cache de TODO el stock — ~45s)', endpoint: '/api/admin/refresh-stock-snapshot' },
  { label: 'Invalidar cache stock (forzar refetch en próximas requests)', endpoint: '/api/admin/revalidate-stock' },
  { label: '💳 Diagnóstico MP (account + webhook + envs)', endpoint: '/api/admin/mp/setup' },
  { label: '💳 Sync payment status MP (pedido específico)', endpoint: '/api/admin/mp/sync-payment?short_id=BK-260516-DHCT', editable: true, hint: 'Cambiá short_id por el del pedido a resincronizar' },
  { label: '🔍 Diagnóstico runtime envs', endpoint: '/api/admin/diag' },
  { label: 'Re-build variant maps (todos los brands con bsaleProductId)', endpoint: '/api/bsale/build-all-maps' },
  { label: 'Re-build extended maps (Angelus consolidado + Holbein multi-product)', endpoint: '/api/bsale/build-extended-maps' },
  { label: 'Diagnóstico BSale (token + offices + sample stock)', endpoint: '/api/bsale/selftest' },
  { label: 'Test stock end-to-end: createx-airbrush-60ml', endpoint: '/api/bsale/test-brand-stock?slug=createx-airbrush-60ml' },
  { label: 'Test stock end-to-end: angelus-standard-1oz', endpoint: '/api/bsale/test-brand-stock?slug=angelus-standard-1oz' },
];

export default function SyncTools() {
  const [results, setResults] = useState<SyncResult[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  async function run(endpoint: string, label: string) {
    setRunning(label);
    const start = Date.now();
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults(prev => [{ ok: res.ok, endpoint, data, took_ms: Date.now() - start }, ...prev]);
    } catch (e) {
      setResults(prev => [{ ok: false, endpoint, error: (e as Error).message }, ...prev]);
    } finally {
      setRunning(null);
    }
  }

  return (
    <>
      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-3">
        {ACTIONS.map(a => {
          const isRunning = running === a.label;
          return (
            <button
              key={a.label}
              onClick={() => run(a.endpoint, a.label)}
              disabled={!!running}
              className="w-full flex items-center justify-between text-left px-4 py-3 rounded-md border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{a.label}</div>
                <code className="text-xs text-gray-400">{a.endpoint}</code>
              </div>
              {isRunning && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          );
        })}
      </section>

      <h2 className="text-sm font-semibold text-gray-700 mb-2">Resultados ({results.length})</h2>
      <div className="space-y-2">
        {results.map((r, i) => (
          <details key={i} className="bg-white border border-gray-200 rounded-lg p-4 text-sm">
            <summary className="cursor-pointer flex items-center justify-between">
              <span className={r.ok ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                {r.ok ? '✓' : '✗'} <code className="text-xs text-gray-700 ml-2">{r.endpoint}</code>
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{r.took_ms}ms</span>
            </summary>
            <pre className="mt-3 text-xs text-gray-700 bg-gray-50 rounded p-3 overflow-auto max-h-96">
              {JSON.stringify(r.data ?? r.error, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </>
  );
}
