'use client';

import { useEffect, useState } from 'react';

interface ReferralInfo {
  code: string;
  share_url: string;
  total_uses: number;
  total_earned_clp: number;
}

export default function ReferralCard() {
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    fetch('/api/referrals/my-code')
      .then(r => r.json())
      .then(data => {
        if (data.code) setInfo(data);
      })
      .finally(() => setLoading(false));
  }, []);

  function copy(text: string, what: 'code' | 'link') {
    navigator.clipboard.writeText(text);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  }

  function shareWhatsApp() {
    if (!info) return;
    const text = `🎨 Hola! Mirá Boykot, la mejor tienda de arte y graffiti en Chile. Usá mi código ${info.code} en tu primera compra para 10% off: ${info.share_url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  if (loading) {
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 animate-pulse h-32" />
    );
  }

  if (!info) return null;

  return (
    <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs font-semibold tracking-wider text-white/80 uppercase mb-1">
            Refer-a-friend · Give 10% · Get 10%
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-3">
            Tu código de referido
          </h3>

          {/* Code */}
          <div className="bg-white/20 backdrop-blur rounded-lg p-3 mb-3 inline-flex items-center gap-2">
            <code className="font-mono font-bold text-xl sm:text-2xl tracking-wider">{info.code}</code>
            <button
              type="button"
              onClick={() => copy(info.code, 'code')}
              className="ml-2 text-xs px-2 py-1 bg-white/30 hover:bg-white/40 rounded transition-colors"
            >
              {copied === 'code' ? '✓' : 'copiar'}
            </button>
          </div>

          <p className="text-sm text-white/90 mb-4">
            Cuando un amigo lo usa en su 1ª compra, él gana <strong>10% off</strong> y vos
            ganás <strong>10% del total</strong> como saldo Boykot Credits para tu próxima compra.
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div>
              <div className="text-white/70 text-xs uppercase tracking-wider">Usos</div>
              <div className="font-bold text-lg">{info.total_uses}</div>
            </div>
            <div>
              <div className="text-white/70 text-xs uppercase tracking-wider">Ganaste</div>
              <div className="font-bold text-lg">${info.total_earned_clp.toLocaleString('es-CL')}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copy(info.share_url, 'link')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded"
            >
              {copied === 'link' ? '✓ Link copiado' : '🔗 Copiar link'}
            </button>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded"
            >
              💬 Compartir WhatsApp
            </button>
          </div>
        </div>
        <div className="text-5xl hidden sm:block">🎁</div>
      </div>
    </section>
  );
}
