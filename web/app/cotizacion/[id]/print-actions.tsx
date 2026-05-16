'use client';

import { useState } from 'react';

interface Props {
  shortId: string;
}

export default function PrintActions({ shortId }: Props) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function printPdf() {
    if (typeof window !== 'undefined') window.print();
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200 print:hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 justify-between">
        <div className="text-xs text-gray-600">
          Cotización <strong className="font-mono">{shortId}</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
              copied ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 hover:border-gray-900 text-gray-900'
            }`}
          >
            {copied ? '✓ Link copiado' : '🔗 Copiar link'}
          </button>
          <button
            type="button"
            onClick={printPdf}
            className="text-xs font-semibold px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-700"
          >
            🖨 Imprimir / PDF
          </button>
          <a
            href="https://wa.me/56223350961"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
