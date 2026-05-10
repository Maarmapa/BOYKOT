'use client';
import { useState, useMemo } from 'react';

interface Color { code: string; hex: string; family: string; driveId?: string; }

const ORDER = ['0','100','B','BG','BV','C','E','FBG','FB','FRV','FV','FYG','G','N','R','RV','T','V','W','Y','YG','YR'];

function prefix(code: string) {
  return ORDER.find(p => code.startsWith(p) && (code.length===p.length || /\d/.test(code[p.length]))) || 'Z';
}

function sort(a: Color, b: Color) {
  const d = ORDER.indexOf(prefix(a.code)) - ORDER.indexOf(prefix(b.code));
  if (d) return d;
  return (parseFloat(a.code.replace(/^[A-Z]+/,''))||0) - (parseFloat(b.code.replace(/^[A-Z]+/,''))||0);
}

const thumb = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w400`;

function ColorCard({ code, hex, driveId }: Color) {
  const [qty, setQty] = useState(0);
  const [err, setErr] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Franja de color */}
      <div className="relative w-full bg-gray-100" style={{paddingBottom:'40%'}}>
        {driveId && !err ? (
          <img
            src={thumb(driveId)}
            alt={code}
            onError={() => setErr(true)}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0" style={{backgroundColor: hex}} />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="font-mono font-bold text-base text-gray-900 mb-3">{code}</div>
        <div className="flex items-center justify-center gap-3 border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setQty(q => Math.max(0, q - 1))}
            disabled={qty === 0}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 font-bold text-lg transition-colors"
          >
            −
          </button>
          <span className="font-mono font-bold text-base w-6 text-center">{qty}</span>
          <button
            onClick={() => setQty(q => q + 1)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500 font-bold text-lg transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SketchPicker({ colors }: { colors: Record<string, Color> }) {
  const [search, setSearch] = useState('');

  const sorted = useMemo(() =>
    Object.values(colors)
      .filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()))
      .sort(sort),
  [colors, search]);

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar: B23, YR07, E25..."
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400 mb-6"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 px-4">
        {sorted.map(c => <ColorCard key={c.code} {...c} />)}
      </div>
    </div>
  );
}