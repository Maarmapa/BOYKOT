'use client';

import { useState, useMemo } from 'react';
import type { BrandColorSet, ColorSwatch } from '@/lib/colors/types';
import { useCart } from '@/lib/use-cart';

interface Props {
  brand: BrandColorSet;
  stockMap?: Record<string, number>;
}

function familyOf(swatch: ColorSwatch, order: string[]): string {
  if (swatch.family) return swatch.family;
  for (const p of [...order].sort((a, b) => b.length - a.length)) {
    if (swatch.code.startsWith(p) && (swatch.code.length === p.length || /\d/.test(swatch.code[p.length]))) return p;
  }
  return 'Other';
}

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

  const availableFamilies = useMemo(() => {
    if (order.length > 0) {
      return order.filter(f => brand.colors.some(c => familyOf(c, order) === f));
    }
    const set = new Set<string>();
    for (const c of brand.colors) if (c.family) set.add(c.family);
    return Array.from(set).sort();
  }, [brand.colors, order]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return brand.colors.filter(c => {
      if (activeFamily && familyOf(c, order) !== activeFamily) return false;
      if (s && !(c.code.toLowerCase().includes(s) || (c.name?.toLowerCase().includes(s) ?? false))) return false;
      return true;
    });
  }, [brand.colors, search, activeFamily, order]);

  const brandTotal = useMemo(() => {
    let n = 0;
    for (const c of brand.colors) {
      const id = c.variantId || syntheticVariantId(brand.bsaleProductId, c.code);
      n += qtys[id] || 0;
    }
    return n;
  }, [brand.colors, brand.bsaleProductId, qtys]);

  const totalClp = brandTotal * brand.basePriceClp;

  return (
    <div>
      <div className="border-b border-gray-200 pb-4 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar código"
          className="w-full max-w-md border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors"
        />
        {availableFamilies.length > 1 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            <button
              onClick={() => setActiveFamily('')}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                !activeFamily ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Todos · {brand.colors.length}
            </button>
            {availableFamilies.map(f => (
              <button
                key={f}
                onClick={() => setActiveFamily(activeFamily === f ? '' : f)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  activeFamily === f ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column-major flow (CSS multi-column). */}
      <div className="boykot-color-grid">
        {filtered.map(color => {
          const stock = stockMap ? stockMap[color.code] ?? 0 : 1;
          const inStock = stock > 0 || !stockMap;
          const variantId = color.variantId || syntheticVariantId(brand.bsaleProductId, color.code);
          const qty = qtys[variantId] || 0;
          const showImage = !!color.imageUrl && !imgErrors[color.code];
          const showDrive = !showImage && !!color.driveId && !imgErrors[color.code];
          const itemTemplate = {
            variant_id: variantId,
            product_id: brand.bsaleProductId,
            unit_price_clp: brand.basePriceClp,
            name: `${brand.productName} - ${color.code}${color.name ? ` (${color.name})` : ''}`,
            image_url: color.imageUrl ?? (color.driveId ? `https://drive.google.com/thumbnail?id=${color.driveId}&sz=w400` : undefined),
            color_code: color.code,
          };

          return (
            <div key={color.code} className="boykot-color-row">
              {/* Swatch takes the full width of the row at its native 560x120 ratio.
                  The selector floats as an overlay on the right side of the swatch. */}
              <div className="relative w-full bg-gray-50 overflow-hidden" style={{ paddingBottom: '21.42%' }}>
                {showImage ? (
                  <img
                    src={color.imageUrl!}
                    alt={color.code}
                    onError={() => setImgErrors(p => ({ ...p, [color.code]: true }))}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : showDrive ? (
                  <img
                    src={`https://drive.google.com/thumbnail?id=${color.driveId}&sz=w400`}
                    alt={color.code}
                    onError={() => setImgErrors(p => ({ ...p, [color.code]: true }))}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : color.hex ? (
                  <div className="absolute inset-0 flex items-center pl-3" style={{ backgroundColor: color.hex }}>
                    <span className="font-mono text-xs text-gray-900/70">{color.code}</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center pl-3 bg-gray-100">
                    <span className="font-mono text-xs text-gray-500">{color.code}</span>
                  </div>
                )}

                {/* Selector overlay — sits on the right side of the swatch */}
                <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 pr-2 bg-white/85 backdrop-blur-[1px] rounded-l">
                  <button
                    onClick={() => setItem({ ...itemTemplate, qty: Math.max(0, qty - 1) })}
                    disabled={qty === 0 || loading}
                    aria-label={`Restar ${color.code}`}
                    className="w-5 h-5 flex items-center justify-center text-base font-semibold text-gray-900 hover:text-black disabled:opacity-25"
                  >−</button>
                  <span className="font-mono text-xs w-4 text-center text-gray-900">{qty}</span>
                  <button
                    onClick={() => setItem({ ...itemTemplate, qty: qty + 1 })}
                    disabled={!inStock || loading || (stock > 0 && qty >= stock)}
                    aria-label={`Sumar ${color.code}`}
                    className="w-5 h-5 flex items-center justify-center text-base font-semibold text-gray-900 hover:text-black disabled:opacity-25"
                  >+</button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Boykot-celeste CTA as the last item in the multicolumn flow. */}
        <div className="boykot-color-row">
          <button
            onClick={() => { if (brandTotal > 0) window.location.href = '/carrito'; }}
            disabled={brandTotal === 0}
            className={`w-full text-center font-medium py-2.5 rounded-md transition-colors text-white ${
              brandTotal > 0
                ? 'hover:opacity-90 cursor-pointer'
                : 'opacity-50 cursor-not-allowed'
            }`}
            style={{ backgroundColor: '#0066ff' }}
          >
            Agregar al carro ({brandTotal})
            {totalClp > 0 && (
              <span className="ml-2 font-semibold">${totalClp.toLocaleString('es-CL')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
