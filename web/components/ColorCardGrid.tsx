'use client';

import { useState, useMemo } from 'react';
import type { BrandColorSet, ColorSwatch } from '@/lib/colors/types';
import { useCart } from '@/lib/use-cart';

interface Props {
  brand: BrandColorSet;
  stockMap?: Record<string, number>;
}

// Group by the swatch's explicit family field when present (Molotow uses
// 'yellow' / 'red' / 'pastel' / ...), otherwise fall back to detecting a code
// prefix from the brand's familyOrder list (the Copic pattern: B / BG / BV ...).
function familyOf(swatch: ColorSwatch, order: string[]): string {
  if (swatch.family) return swatch.family;
  for (const p of [...order].sort((a, b) => b.length - a.length)) {
    if (swatch.code.startsWith(p) && (swatch.code.length === p.length || /\d/.test(swatch.code[p.length]))) return p;
  }
  return 'Other';
}

// Stable synthetic variant_id when BSale didn't expose one for this swatch.
// Encodes (productId, codeHash) so the same color always lands on the same
// integer key in supabase carts/reservations.
function syntheticVariantId(productId: number, code: string): number {
  let h = 5381;
  for (let i = 0; i < code.length; i++) h = ((h << 5) + h + code.charCodeAt(i)) & 0x7fffffff;
  return (productId || 0) * 100000 + (h % 99000);
}

export default function ColorCardGrid({ brand, stockMap }: Props) {
  const [search, setSearch] = useState('');
  const [activeFamily, setActiveFamily] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const { qtys, setItem, loading } = useCart();

  const order = brand.familyOrder || [];
  const names = brand.familyNames || {};

  // When the brand has explicit families on its swatches (Molotow), discover
  // them dynamically. When it has a static familyOrder (Copic), use that.
  const availableFamilies = useMemo(() => {
    if (order.length > 0) {
      return order.filter(f => brand.colors.some(c => familyOf(c, order) === f));
    }
    const set = new Set<string>();
    for (const c of brand.colors) if (c.family) set.add(c.family);
    return Array.from(set).sort();
  }, [brand.colors, order]);

  const familyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of brand.colors) {
      const f = familyOf(c, order);
      map[f] = (map[f] || 0) + 1;
    }
    return map;
  }, [brand.colors, order]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return brand.colors.filter(c => {
      if (activeFamily && familyOf(c, order) !== activeFamily) return false;
      if (s && !(c.code.toLowerCase().includes(s) || (c.name?.toLowerCase().includes(s) ?? false))) return false;
      return true;
    });
  }, [brand.colors, search, activeFamily, order]);

  // Subtotal for the SELECTED colors in THIS brand (cart may also hold other brands).
  const brandQtys = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of brand.colors) {
      const id = c.variantId || syntheticVariantId(brand.bsaleProductId, c.code);
      m[c.code] = qtys[id] || 0;
    }
    return m;
  }, [brand.colors, brand.bsaleProductId, qtys]);

  const totalSelected = Object.values(brandQtys).reduce((s, n) => s + n, 0);
  const totalClp = totalSelected * brand.basePriceClp;

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 sticky top-0 z-10">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar código o nombre..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400 mb-3"
        />
        {availableFamilies.length > 1 && (
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
        )}
      </div>

      <p className="text-gray-400 text-xs font-mono mb-3 px-1">{filtered.length} colores</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(color => {
          const stock = stockMap ? stockMap[color.code] ?? 0 : 1;
          const inStock = stock > 0 || !stockMap;
          const variantId = color.variantId || syntheticVariantId(brand.bsaleProductId, color.code);
          const qty = qtys[variantId] || 0;
          const hasImg = !!color.driveId && !imgErrors[color.code];
          const family = familyOf(color, order);

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
              disabled={loading}
              onQty={(n) => setItem({
                variant_id: variantId,
                product_id: brand.bsaleProductId,
                qty: Math.max(0, Math.min(n, stock || 99)),
                unit_price_clp: brand.basePriceClp,
                name: `${brand.productName} - ${color.code}${color.name ? ` (${color.name})` : ''}`,
                image_url: color.driveId ? `https://drive.google.com/thumbnail?id=${color.driveId}&sz=w400` : undefined,
                color_code: color.code,
              })}
              onImgError={() => setImgErrors(p => ({ ...p, [color.code]: true }))}
            />
          );
        })}
      </div>

      {totalSelected > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 z-20">
          <span className="font-mono text-sm">{totalSelected} {totalSelected === 1 ? 'color' : 'colores'}</span>
          <span className="font-semibold">${totalClp.toLocaleString('es-CL')}</span>
          <a
            href="/carrito"
            className="bg-orange-500 hover:bg-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
          >
            Ver carro
          </a>
        </div>
      )}
    </div>
  );
}

function ColorCard({
  color, familyName, hasImg, stock, inStock, hideStock, qty, disabled, onQty, onImgError,
}: {
  color: ColorSwatch;
  family: string;
  familyName: string;
  hasImg: boolean;
  stock: number;
  inStock: boolean;
  hideStock: boolean;
  qty: number;
  disabled: boolean;
  onQty: (n: number) => void;
  onImgError: () => void;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${!inStock ? 'opacity-60' : ''} ${qty > 0 ? 'ring-2 ring-orange-400' : ''}`}>
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
        {color.name && (
          <div className="text-[10px] text-gray-600 truncate" title={color.name}>{color.name}</div>
        )}
        <div className="text-[10px] text-gray-400 mb-2">{familyName}</div>

        {!hideStock && (
          <div className={`text-[10px] font-mono mb-2 ${inStock ? 'text-green-600' : 'text-red-400'}`}>
            {inStock ? `✓ ${stock} en stock` : '✗ Sin stock'}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 border border-gray-200 rounded-md p-0.5">
          <button
            onClick={() => onQty(qty - 1)}
            disabled={qty === 0 || disabled}
            aria-label={`Restar ${color.code}`}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 font-bold transition-colors"
          >−</button>
          <span className="font-mono font-bold text-sm w-5 text-center">{qty}</span>
          <button
            onClick={() => onQty(qty + 1)}
            disabled={!inStock || disabled || (stock > 0 && qty >= stock)}
            aria-label={`Sumar ${color.code}`}
            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-orange-500 disabled:opacity-30 font-bold transition-colors"
          >+</button>
        </div>
      </div>
    </div>
  );
}
