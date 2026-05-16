'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // En producción esto va automático a Vercel logs.
    // Si después agregamos Sentry o similar, acá lo reportamos.
    console.error('[boykot] runtime error:', error);
  }, [error]);

  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😬</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Algo se rompió</h1>
        <p className="text-sm text-gray-600 mb-2">
          Pasó algo inesperado en esta página. No te preocupes — tu carro está a salvo.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-6">Código error: {error.digest}</p>
        )}
        <div className="flex flex-col gap-2 mt-6">
          <button
            onClick={reset}
            className="w-full text-white px-6 py-3 rounded-md font-semibold hover:opacity-90"
            style={{ backgroundColor: '#0066ff' }}
          >
            Intentar de nuevo
          </button>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Volver al inicio
          </Link>
          <a
            href="https://wa.me/56223350961"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Avisarnos por WhatsApp →
          </a>
        </div>
      </div>
    </main>
  );
}
