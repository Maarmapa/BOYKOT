'use client';
import { useState, useMemo } from 'react';

interface CopicColor { code: string; hex: string; family: string; driveId?: string; }

const FAMILY_ORDER = ['0','100','B','BG','BV','C','E','G','N','R','RV','T','V','W','Y','YG','YR'];
const FAMILY_NAMES: Record<string,string> = {
  '0':'Colorless','100':'Black','B':'Blue','BG':'Blue Green','BV':'Blue Violet',
  'C':'Cool Gray','E':'Earth','G':'Green','N':'Neutral Gray','R':'Red',
  'RV':'Red Violet','T':'Toner Gray','V':'Violet','W':'Warm Gray',
  'Y':'Yellow','YG':'Yellow Green','YR':'Yellow Red',
};

function getPrefix(code: string) {
  return FAMILY_ORDER.find(p => code.startsWith(p) && (code.length === p.length || /\d/.test(code[p.length]))) || 'Other';
}

function copicSort(a: CopicColor, b: CopicColor) {
  const pa = FAMILY_ORDER.indexOf(getPrefix(a.code));
  const pb = FAMILY_ORDER.indexOf(getPrefix(b.code));
  if (pa !== pb) return pa - pb;
  const numA = parseFloat(a.code.replace(/^[A-Z]+/, '')) || 0;
  const numB = parseFloat(b.code.replace(/^[A-Z]+/, '')) || 0;
  return numA - numB;
}

const thumb = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w400`;

export default function ColorPicker({ colors, stockMap, priceMap }: {
  colors: Record<string, CopicColor>;
  stockMap?: Record<string, number>;
  priceMap?: Record<string, number>;
}) {
  const [search, setSearch] = useState('');
  const [activePrefix, setActivePrefix] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const prefixes = useMemo(() =>
    FAMILY_ORDER.filter(p => Object.values(colors).some(c => getPrefix(c.code) === p)), [colors]);

  const filtered = useMemo(() =>
    Object.values(colors)
      .filter(c => (!activePrefix || getPrefix(c.code) === activePrefix) && (!search || c.code.toLowerCase().includes(search.toLowerCase())))
      .sort(copicSort),
  [colors, activePrefix, search]);return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar: B23, YR07, E25..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400 mb-3" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActivePrefix('')}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${!activePrefix ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200 hover:border-orange-400'}`}>
            Todos ({Object.keys(colors).length})
          </button>
          {prefixes.map(p => (
            <button key={p} onClick={() => setActivePrefix(activePrefix === p ? '' : p)}
              className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${activePrefix === p ? 'bg-orange-500 text-white border-orange-500' : 'text-gray-500 border-gray-200 hover:border-orange-400'}`}>
              {p === '0' ? 'Colorless' : p} ({Object.values(colors).filter(c => getPrefix(c.code) === p).length})
            </button>
          ))}
        </div>
      </div>
      <p className="text-gray-400 text-xs font-mono mb-3">{filtered.length} colores</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map(color => {
          const hasImg = color.driveId && !errors[color.code];
          const stock = stockMap ? (stockMap[color.code] ?? 0) : 1;
          const inStock = stock > 0;
          const price = priceMap?.[color.code];
          return (
            <div key={color.code} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="relative w-full bg-gray-50" style={{paddingBottom:'21.4%'}}>
                {hasImg ? (
                  <img src={thumb(color.driveId!)} alt={`Copic ${color.code}`}
                    onError={() => setErrors(p => ({...p,[color.code]:true}))}
                    className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="absolute inset-0" style={{backgroundColor: color.hex}} />
                )}
                {!inStock && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">AGOTADO</div>
                )}
              </div>
              <div className="p-2">
                <div className="font-mono font-bold text-sm text-gray-900">{color.code}</div>
                <div className="text-[10px] text-gray-400 mb-1">{FAMILY_NAMES[getPrefix(color.code)] || ''}</div>
                {price && <div className="text-sm font-semibold text-gray-900 mb-1">${price.toLocaleString('es-CL')}</div>}
                <div className={`text-[10px] font-mono mb-2 ${inStock ? 'text-green-600' : 'text-red-400'}`}>
                  {inStock ? `✓ En stock${stock > 1 ? ` (${stock})` : ''}` : '✗ Sin stock'}
                </div>
                <button disabled={!inStock}
                  className={`w-full py-1.5 rounded text-xs font-semibold transition-colors ${inStock ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  {inStock ? 'Agregar' : 'Sin stock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}