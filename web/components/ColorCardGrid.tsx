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
          placeholder="Buscar código o nombre"
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

      {/* Column-major flow (matches Boykot: 0→C7 fills col 1, C8→N0 fills col 2, ...).
          CSS multicolumns handle this natively; break-inside keeps each card whole. */}
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
              <div className="relative bg-gray-50 flex-1 aspect-[5/2] overflow-hidden">
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
                  <div className="absolute inset-0" style={{ backgroundColor: color.hex }} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <span className="font-mono text-[10px] text-gray-400">{color.code}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-3 shrink-0 min-w-[110px] justify-end">
                <span className="font-mono text-xs text-gray-900 mr-1 w-12 text-right">
                  {color.code}
                </span>
                <button
                  onClick={() => setItem({ ...itemTemplate, qty: Math.max(0, qty - 1) })}
                  disabled={qty === 0 || loading}
                  aria-label={`Restar ${color.code}`}
                  className="w-5 h-5 flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
                >−</button>
                <span className="font-mono text-xs w-4 text-center">{qty}</span>
                <button
                  onClick={() => setItem({ ...itemTemplate, qty: qty + 1 })}
                  disabled={!inStock || loading || (stock > 0 && qty >= stock)}
                  aria-label={`Sumar ${color.code}`}
                  className="w-5 h-5 flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
                >+</button>
              </div>
            </div>
          );
        })}
      </div>

      {brandTotal > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-6 py-3 shadow-lg flex items-center gap-4 z-20">
          <span className="text-sm">
            {brandTotal} {brandTotal === 1 ? 'unidad' : 'unidades'} ·{' '}
            <span className="font-semibold">${totalClp.toLocaleString('es-CL')}</span>
          </span>
          <a
            href="/carrito"
            className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100"
          >
            Ver carro
          </a>
        </div>
      )}
    </div>
  );
}
