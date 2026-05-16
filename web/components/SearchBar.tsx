'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Hit {
  slug: string;
  name: string;
  sku: string | null;
  price: number | null;
  image: string | null;
  brand: string | null;
}

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (q.length < 2) {
      setHits([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        const data = await res.json();
        setHits(data.results ?? []);
        setTotal(data.total ?? 0);
      } catch {
        setHits([]);
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <label htmlFor="site-search" className="sr-only">Buscar productos</label>
      <input
        id="site-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Buscar productos…"
        value={q}
        onChange={e => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' && q.trim().length >= 2) {
            setOpen(false);
            router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
          }
        }}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400"
      />

      {open && q.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-[60vh] overflow-y-auto">
          {loading && hits.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Buscando…</div>
          ) : hits.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Nada para &ldquo;{q}&rdquo;.</div>
          ) : (
            <>
              <ul className="py-1">
                {hits.map(h => (
                  <li key={h.slug}>
                    <Link
                      href={`/producto/${h.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="w-10 h-10 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        {h.image && <img src={h.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{h.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {h.brand && <span>{h.brand} · </span>}
                          {h.price ? `$${h.price.toLocaleString('es-CL')}` : 'Consultar'}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/buscar?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="block border-t border-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-900 hover:bg-gray-50 text-center"
              >
                {total > hits.length
                  ? `Ver los ${total} resultados →`
                  : 'Ver página completa →'}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
