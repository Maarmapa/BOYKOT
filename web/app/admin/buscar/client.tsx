'use client';

import { useEffect, useRef, useState } from 'react';

interface Hit {
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  price: number | null;
  image: string | null;
  availability_static: string;
  stock_live: number | null;
  available_live: number | null;
  url: string;
  variantId: number | null;
}

export default function AdminBuscarClient() {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      setTotal(0);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/product-lookup?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setHits(data.results || []);
        setTotal(data.total || 0);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function buildDmReply(h: Hit): string {
    const stock = h.available_live ?? h.stock_live;
    const stockLine =
      stock != null && stock > 0
        ? `Sí, tenemos stock (${stock} unid disponibles)`
        : h.availability_static === 'OutOfStock'
        ? 'Por ahora está agotado, pero podemos avisarte cuando vuelva'
        : 'Tenemos stock';
    const price = h.price
      ? `$${h.price.toLocaleString('es-CL')} CLP`
      : 'Te paso precio por privado';
    return `Hola! ${stockLine}.

${h.name} — ${price}

Link: ${h.url}

Despacho 24-48hrs a todo Chile o retiro en Av Providencia 2251.`;
  }

  return (
    <div>
      <div className="mb-6">
        <input
          autoFocus
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="SKU, nombre o marca... (Copic B01, Angelus Red, marcador, etc)"
          className="w-full px-5 py-4 text-base border-2 border-gray-300 focus:border-gray-900 rounded-lg outline-none transition-colors"
        />
        {q.length >= 2 && (
          <div className="mt-2 text-xs text-gray-500">
            {loading ? 'Buscando...' : `${total} resultado${total === 1 ? '' : 's'} (mostrando hasta 12)`}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {hits.map(h => {
          const stock = h.available_live ?? h.stock_live;
          const isInStock = stock != null ? stock > 0 : h.availability_static !== 'OutOfStock';
          return (
            <div
              key={h.slug}
              className="flex items-stretch gap-4 bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-colors"
            >
              <div className="w-20 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                {h.image && <img src={h.image} alt={h.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                {h.brand && (
                  <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                    {h.brand}
                  </div>
                )}
                <div className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                  {h.name}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {h.sku && <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{h.sku}</span>}
                  {h.price && <span className="font-semibold text-gray-900">${h.price.toLocaleString('es-CL')}</span>}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {stock != null ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
                        isInStock ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isInStock ? `BSale: ${stock} disp` : 'Agotado en BSale'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {h.availability_static === 'OutOfStock' ? 'Agotado (snapshot)' : 'Stock no live'}
                    </span>
                  )}
                  {h.variantId && <span className="text-gray-400">vid: {h.variantId}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 justify-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => copy(h.url, `url:${h.slug}`)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    copied === `url:${h.slug}`
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-700'
                  }`}
                >
                  {copied === `url:${h.slug}` ? '✓ copiado' : '🔗 link'}
                </button>
                <button
                  type="button"
                  onClick={() => copy(buildDmReply(h), `dm:${h.slug}`)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    copied === `dm:${h.slug}`
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {copied === `dm:${h.slug}` ? '✓ copiado' : '💬 DM reply'}
                </button>
                <a
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded text-center"
                >
                  abrir ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {q.length < 2 && (
        <div className="mt-4 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <strong>Tip:</strong> Escribí lo que el cliente te preguntó. Ej: <em>"tienes copic b01?"</em> →
          tipeás "copic b01" → un click "💬 DM reply" → pega texto pre-armado con stock + precio +
          link al WhatsApp/Instagram.
        </div>
      )}
    </div>
  );
}
