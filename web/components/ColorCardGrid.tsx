'use client';

import { useState, useMemo } from 'react';
import type { BrandColorSet, ColorSwatch } from '@/lib/colors/types';

interface Props {
  brand: BrandColorSet;
  stockMap?: Record<string, number>;
}

function familyOf(code: string, order: string[]): string {
  for (const p of [...order].sort((a, b) => b.length - a.length)) {
    if (code.startsWith(p) && (code.length === p.length || /\d/.test(code[p.length]))) return p;
  }
  return 'Other';
}

function thumb(driveId: string): string {
  return `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`;
}

export default function ColorCardGrid({ brand, stockMap }: Props) {
  const [search, setSearch] = useState('');
  const [activeFamily, setActiveFamily] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [qtys, setQtys] = useState<Record<string, number>>({});

  const order = brand.familyOrder || [];
  const names = brand.familyNames || {};

  const availableFamilies = useMemo(
    () => order.filter(f => brand.colors.some(c => familyOf(c.code, order) === f)),
    [brand.colors, order]
  );

  const familyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of brand.colors) {
      const f = familyOf(c.code, order);
      map[f] = (map[f] || 0) + 1;
    }
    return map;
  }, [brand.colors, order]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return brand.colors.filter(c => {
      if (activeFamily && familyOf(c.code, order) !== activeFamily) return false;
      if (s && !c.code.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [brand.colors, search, activeFamily, order]);

  const totalSelected = Object.values(qtys).reduce((s, n) => s + n, 0);
  const totalClp = totalSelected * brand.basePriceClp;

  return (
    <div>
      {/* Search + family filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 sticky top-0 z-10">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar código: B23, YR07, E25..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400 mb-3"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveFamily('')}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
              !activeFamily ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200 hover:border-orange-400'
            }`}
          >
            Todos ({brand.colors.length})
          </button>
          {availableFamilies.map(f => (
            <button
              key={f}
              onClick={() => setActiveFamily(activeFamily === f ? '' : f)}
              className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                activeFamily === f ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200 hover:border-orange-400'
              }`}
              title={names[f]}
            >
              {f === '0' ? 'Colorless' : f} ({familyCounts[f]})
            </button>
          ))}
        </div>
      </div>

      <p className="text-gray-400 text-xs font-mono mb-3 px-1">{filtered.length} colores</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(color => {
          const stock = stockMap ? stockMap[color.code] ?? 0 : 1;
          const inStock = stock > 0 || !stockMap; // optimistic when no stockMap supplied
          const qty = qtys[color.code] || 0;
          const hasImg = !!color.driveId && !imgErrors[color.code];
          const family = familyOf(color.code, order);

          return (
            <ColorCard
              key={color.code}
              color={color}
              family={family}
              familyName={names[family] || family}
              hasImg={hasImg}
              stock={stock}
              inStock={inStock}
              hideStock={!stockMap}
              qty={qty}
              onQty={(n) => setQtys(q => ({ ...q, [color.code]: Math.max(0, Math.min(n, stock || 99)) }))}
              onImgError={() => setImgErrors(p => ({ ...p, [color.code]: true }))}
            />
          );
        })}
      </div>

      {/* Sticky cart summary */}
      {totalSelected > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 z-20">
          <span className="font-mono text-sm">{totalSelected} {totalSelected === 1 ? 'color' : 'colores'}</span>
          <span className="font-semibold">${totalClp.toLocaleString('es-CL')}</span>
          <button className="bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors">
            Ver carro
          </button>
        </div>
      )}
    </div>
  );
}

function ColorCard({
  color, family, familyName, hasImg, stock, inStock, hideStock, qty, onQty, onImgError,
}: {
  color: ColorSwatch;
  family: string;
  familyName: string;
  hasImg: boolean;
  stock: number;
  inStock: boolean;
  hideStock: boolean;
  qty: number;
  onQty: (n: number) => void;
  onImgError: () => void;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${!inStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full bg-gray-50" style={{ paddingBottom: '21.4%' }}>
        {hasImg ? (
          <img
            src={`https://drive.google.com/thumbnail?id=${color.driveId}&sz=w400`}
            alt={color.code}
            onError={onImgError}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : color.hex ? (
          <div className="absolute inset-0" style={{ backgroundColor: color.hex }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="font-mono font-bold text-gray-400 text-sm">{color.code}</span>
          </div>
        )}
        {!inStock && !hideStock && (
          <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">AGOTADO</div>
        )}
      </div>

      <div className="p-2">
        <div className="font-mono font-bold text-sm text-gray-900">{color.code}</div>
        {color.name && <div className="text-[10px] text-gray-600 truncate" title={color.name}>{color.name}</div>}
        <div className="text-[10px] text-gray-400 mb-2">{familyName}</div>

        {!hideStock && (
          <div className={`text-[10px] font-mono mb-2 ${inStock ? 'text-green-600' : 'text-red-400'}`}>
            {inStock ? `✓ ${stock} en stock` : '✗ Sin stock'}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 border border-gray-200 rounded-md p-0.5">
          <button
            onClick={() => onQty(qty - 1)}
            disabled={qty === 0}
            aria-label={`Restar ${color.code}`}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 font-bold transition-colors"
          >−</button>
          <span className="font-mono font-bold text-sm w-5 text-center">{qty}</span>
          <button
            onClick={() => onQty(qty + 1)}
            disabled={!inStock || (stock > 0 && qty >= stock)}
            aria-label={`Sumar ${color.code}`}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 font-bold transition-colors"
          >+</button>
        </div>
      </div>
    </div>
  );
}
