'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ParsedItem {
  product_slug?: string;
  product_name: string;
  product_sku?: string | null;
  product_brand?: string | null;
  product_image?: string | null;
  product_url?: string;
  qty: number;
  unit_price_clp: number;
  stock_available?: number | null;
  match_confidence: number;
  raw_match: string;
  match_status: 'matched' | 'not_found';
}

type Step = 'input' | 'review' | 'saving' | 'done';

export default function CotizadorClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [text, setText] = useState('');
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  // Customer info (step 'review')
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rut, setRut] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function parse() {
    setParsing(true);
    setParseError(null);
    try {
      const res = await fetch('/api/cotizacion/parse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
      setItems(data.items || []);
      setStep('review');
    } catch (e) {
      setParseError((e as Error).message);
    } finally {
      setParsing(false);
    }
  }

  function updateQty(idx: number, qty: number) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, qty) } : it)));
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/cotizacion/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_company: company,
          customer_email: email,
          customer_phone: phone,
          customer_rut: rut,
          customer_project: project,
          customer_notes: notes,
          raw_input: text,
          items: items.filter(i => i.match_status === 'matched').map(i => ({
            product_slug: i.product_slug,
            product_name: i.product_name,
            product_sku: i.product_sku || undefined,
            product_brand: i.product_brand || undefined,
            product_image: i.product_image || undefined,
            product_url: i.product_url,
            qty: i.qty,
            unit_price_clp: i.unit_price_clp,
            stock_available: i.stock_available ?? undefined,
            match_confidence: i.match_confidence,
            raw_match: i.raw_match,
            match_status: i.match_status,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || `HTTP ${res.status}`);
      router.push(`/cotizacion/${data.short_id}`);
    } catch (e) {
      setSaveError((e as Error).message);
      setSaving(false);
    }
  }

  const matched = items.filter(i => i.match_status === 'matched');
  const notFound = items.filter(i => i.match_status === 'not_found');
  const subtotal = matched.reduce((s, i) => s + i.qty * i.unit_price_clp, 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  if (step === 'input') {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Pegá tu lista de productos
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Ejemplo:

50 Copic Sketch surtidos (colores básicos)
20 Angelus pintura cuero 1oz, negro y blanco
30 marcadores POSCA 5M variados
2 sets de pinceles surtidos
Papel A3 100 hojas
Holbein acuarela básico

Para fondo INJUV 2026, plazo entrega 15 días.`}
          rows={14}
          className="w-full border-2 border-gray-300 focus:border-blue-500 rounded-lg p-4 text-sm sm:text-base font-mono outline-none transition-colors"
          maxLength={5000}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {text.length}/5000
        </div>

        {parseError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <strong>Error parseando:</strong> {parseError}
          </div>
        )}

        <button
          type="button"
          onClick={parse}
          disabled={parsing || text.length < 5}
          className="mt-4 w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm uppercase tracking-wider rounded-md disabled:opacity-50 transition-colors"
        >
          {parsing ? 'Analizando con IA...' : 'Analizar y cotizar →'}
        </button>
        <p className="text-xs text-gray-500 mt-3">
          La IA puede tardar 10-30 segundos en matchear todos los productos.
          Tomate un café ☕
        </p>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Revisá tu cotización</h2>
          <button
            type="button"
            onClick={() => setStep('input')}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Volver a editar
          </button>
        </div>

        {/* Items matched */}
        <div className="space-y-2 mb-6">
          {matched.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3"
            >
              <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {item.product_brand && (
                  <div className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                    {item.product_brand}
                  </div>
                )}
                <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                  {item.product_name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  {item.product_sku && <span className="font-mono bg-gray-100 px-1.5 rounded">{item.product_sku}</span>}
                  <span>${item.unit_price_clp.toLocaleString('es-CL')} c/u</span>
                  {item.match_confidence < 0.8 && (
                    <span className="text-amber-600">⚠ confianza {Math.round(item.match_confidence * 100)}%</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  <em>de tu input: "{item.raw_match}"</em>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={e => updateQty(items.indexOf(item), parseInt(e.target.value, 10) || 1)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                />
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    ${(item.qty * item.unit_price_clp).toLocaleString('es-CL')}
                  </div>
                  {item.stock_available != null && item.stock_available < item.qty && (
                    <div className="text-[10px] text-amber-600">⚠ stock {item.stock_available}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(items.indexOf(item))}
                  className="text-gray-400 hover:text-rose-600 px-2"
                  aria-label="Quitar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Not found */}
        {notFound.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm">
            <div className="font-semibold text-amber-900 mb-2">
              ⚠ {notFound.length} item{notFound.length === 1 ? '' : 's'} sin match en catálogo:
            </div>
            <ul className="text-amber-800 text-xs space-y-1 pl-4 list-disc">
              {notFound.map((i, idx) => (
                <li key={idx}>{i.raw_match || i.product_name}</li>
              ))}
            </ul>
            <p className="text-amber-900 text-xs mt-2">
              Estos los podemos cotizar manual por WhatsApp. La cotización solo incluye los matched.
            </p>
          </div>
        )}

        {/* Totals */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${subtotal.toLocaleString('es-CL')}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">IVA 19%</span><span>${iva.toLocaleString('es-CL')}</span></div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300"><span>Total CLP</span><span>${total.toLocaleString('es-CL')}</span></div>
        </div>

        {/* Customer info form */}
        <h3 className="text-base font-bold text-gray-900 mb-3">Tus datos (para que aparezcan en el PDF)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input type="text" placeholder="Nombre completo *" value={name} onChange={e => setName(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" placeholder="Empresa / Institución" value={company} onChange={e => setCompany(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} required className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="tel" placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" placeholder="RUT empresa" value={rut} onChange={e => setRut(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
          <input type="text" placeholder="Proyecto / Fondo (ej: INJUV 2026)" value={project} onChange={e => setProject(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas adicionales para el comprador (opcional)"
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
        />

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
            {saveError}
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving || matched.length === 0 || !name || !email}
          className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm uppercase tracking-wider rounded-md disabled:opacity-50 transition-colors"
        >
          {saving ? 'Guardando...' : `Generar cotización (${matched.length} items, $${total.toLocaleString('es-CL')})`}
        </button>
      </div>
    );
  }

  return null;
}
