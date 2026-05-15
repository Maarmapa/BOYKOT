'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrandOverride } from '@/lib/brand-overrides';

interface Props {
  slug: string;
  base: {
    basePriceClp: number;
    description: string;
    heroImage: string;
    productName: string;
  };
  override: BrandOverride | null;
}

export default function BrandEditForm({ slug, base, override }: Props) {
  const router = useRouter();
  const [priceStr, setPriceStr] = useState<string>(override?.base_price_clp != null ? String(override.base_price_clp) : '');
  const [description, setDescription] = useState<string>(override?.description ?? '');
  const [heroImage, setHeroImage] = useState<string>(override?.hero_image ?? '');
  const [displayName, setDisplayName] = useState<string>(override?.display_name ?? '');
  const [hidden, setHidden] = useState<boolean>(!!override?.hidden);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const priceNum = priceStr.trim() === '' ? null : Number(priceStr.replace(/[^0-9]/g, ''));
      if (priceStr.trim() !== '' && (priceNum === null || !Number.isFinite(priceNum))) {
        throw new Error('Precio inválido');
      }
      const res = await fetch(`/api/admin/brand/${slug}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          base_price_clp: priceNum,
          description: description.trim() || null,
          hero_image: heroImage.trim() || null,
          display_name: displayName.trim() || null,
          hidden,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Falló el guardado');
      setMsg({ ok: true, text: 'Guardado. Refrescá el sitio público en 5min o invalidá cache para verlo.' });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    if (!confirm(`¿Borrar TODOS los overrides de ${slug}? La metadata vuelve al código.`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/brand/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falló el borrado');
      setMsg({ ok: true, text: 'Overrides borrados.' });
      setPriceStr(''); setDescription(''); setHeroImage(''); setDisplayName(''); setHidden(false);
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Precio base CLP" hint={`Default en código: $${base.basePriceClp.toLocaleString('es-CL')}`}>
        <input
          type="text"
          inputMode="numeric"
          value={priceStr}
          onChange={e => setPriceStr(e.target.value)}
          placeholder={String(base.basePriceClp)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Nombre visible" hint={`Default en código: ${base.productName}`}>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder={base.productName}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Descripción" hint="Aparece en la brand page bajo el hero. Markdown no soportado todavía.">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={base.description || '(sin descripción)'}
          rows={5}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Field>

      <Field label="Hero image URL" hint="Foto grande del banner. Debe ser URL absoluta (https://...).">
        <input
          type="url"
          value={heroImage}
          onChange={e => setHeroImage(e.target.value)}
          placeholder={base.heroImage || 'https://...'}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {heroImage && (
          <img src={heroImage} alt="preview" className="mt-2 max-h-32 rounded border border-gray-200" />
        )}
      </Field>

      <Field label="Visibilidad">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hidden}
            onChange={e => setHidden(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Ocultar del sitio público (404 en /colores/{slug})
        </label>
      </Field>

      {msg && (
        <div className={`text-sm px-3 py-2 rounded ${msg.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {override && (
          <button
            type="button"
            onClick={onClear}
            disabled={saving}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            Borrar overrides
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">{label}</label>
      {hint && <div className="text-xs text-gray-500 mb-1.5">{hint}</div>}
      {children}
    </div>
  );
}
