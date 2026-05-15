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

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-6">
        {filtered.map(color => {
          const stock = stockMap ? stockMap[color.code] ?? 0 : 1;
          const inStock = stock > 0 || !stockMap;
          const variantId = color.variantId || syntheticVariantId(brand.bsaleProductId, color.code);
          const qty = qtys[variantId] || 0;
          const showImage = !!color.imageUrl && !imgErrors[color.code];
          const showDrive = !showImage && !!color.driveId && !imgErrors[color.code];

          return (
            <div key={color.code} className="flex flex-col">
              <div className="relative w-full bg-gray-50 aspect-square overflow-hidden">
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
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-xs text-gray-400">{color.code}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-center">
                <div className="font-mono text-sm font-medium text-gray-900">{color.code}</div>
                {!inStock && !!stockMap && (
                  <div className="text-[11px] text-gray-400 mt-0.5">Sin stock</div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-center gap-3 text-gray-700">
                <button
                  onClick={() => setItem({
                    variant_id: variantId,
                    product_id: brand.bsaleProductId,
                    qty: Math.max(0, qty - 1),
                    unit_price_clp: brand.basePriceClp,
                    name: `${brand.productName} - ${color.code}${color.name ? ` (${color.name})` : ''}`,
                    image_url: color.imageUrl ?? (color.driveId ? `https://drive.google.com/thumbnail?id=${color.driveId}&sz=w400` : undefined),
                    color_code: color.code,
                  })}
                  disabled={qty === 0 || loading}
                  aria-label={`Restar ${color.code}`}
                  className="w-6 h-6 flex items-center justify-center text-base disabled:opacity-30"
                >−</button>
                <span className="font-mono text-sm w-4 text-center">{qty}</span>
                <button
                  onClick={() => setItem({
                    variant_id: variantId,
                    product_id: brand.bsaleProductId,
                    qty: qty + 1,
                    unit_price_clp: brand.basePriceClp,
                    name: `${brand.productName} - ${color.code}${color.name ? ` (${color.name})` : ''}`,
                    image_url: color.imageUrl ?? (color.driveId ? `https://drive.google.com/thumbnail?id=${color.driveId}&sz=w400` : undefined),
                    color_code: color.code,
                  })}
                  disabled={!inStock || loading || (stock > 0 && qty >= stock)}
                  aria-label={`Sumar ${color.code}`}
                  className="w-6 h-6 flex items-center justify-center text-base disabled:opacity-30"
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
