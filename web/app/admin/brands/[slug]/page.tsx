import { requireAdmin } from '../../layout';
import AdminChrome from '@/components/admin/Chrome';
import { BRANDS } from '@/lib/colors/brands';
import { getOverride } from '@/lib/brand-overrides';
import { getProductStock } from '@/lib/stock';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrandEditForm from './BrandEditForm';

export const dynamic = 'force-dynamic';

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const base = BRANDS[slug];
  if (!base) notFound();

  const override = await getOverride(slug);

  // Live stock para mostrar coverage real
  let stockRows: { variant_id: number; stock: number; available: number }[] = [];
  let stockErr: string | null = null;
  if (base.bsaleProductId && process.env.BSALE_ACCESS_TOKEN) {
    try {
      const variantIds = base.colors.map(c => c.variantId).filter((v): v is number => typeof v === 'number');
      stockRows = await getProductStock(base.bsaleProductId, variantIds);
    } catch (e) {
      stockErr = (e as Error).message;
    }
  }
  const byVariant = new Map(stockRows.map(r => [r.variant_id, r.stock]));
  const colorsWithStock = base.colors.filter(c => typeof c.variantId === 'number' && byVariant.has(c.variantId));
  const totalUnits = colorsWithStock.reduce((s, c) => s + (byVariant.get(c.variantId!) ?? 0), 0);
  const zeroStock = colorsWithStock.filter(c => (byVariant.get(c.variantId!) ?? 0) <= 0).length;

  return (
    <AdminChrome>
      <div className="mb-6">
        <Link href="/admin/brands" className="text-xs text-gray-500 hover:text-gray-900">← Volver a brands</Link>
      </div>
      <div className="flex items-start justify-between gap-6 mb-2">
        <div>
          <h1 className="text-2xl font-bold">{base.brandName} <span className="text-gray-500">{base.productName}</span></h1>
          <p className="text-sm text-gray-500 font-mono mt-1">{slug}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/colores/${slug}`} target="_blank" className="text-sm text-blue-700 hover:underline">Ver pública →</Link>
          <Link href={`/api/bsale/test-brand-stock?slug=${slug}`} target="_blank" className="text-sm text-gray-500 hover:underline">Stock JSON</Link>
        </div>
      </div>

      {override?.hidden && (
        <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          ⚠️ Esta brand está <strong>oculta</strong> (no aparece en el sitio público).
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Stat label="BSale Product ID" value={base.bsaleProductId || '—'} mono />
        <Stat label="Colores registrados" value={base.colors.length} />
        <Stat label="Precio base (CLP)" value={`$${(override?.base_price_clp ?? base.basePriceClp ?? 0).toLocaleString('es-CL')}`} note={override?.base_price_clp ? 'override activo' : 'desde brands.ts'} />
        <Stat label="Stock total (unidades)" value={stockErr ? '—' : totalUnits.toLocaleString('es-CL')} note={stockErr ?? `${colorsWithStock.length}/${base.colors.length} mapeados`} />
        <Stat label="Colores agotados" value={stockErr ? '—' : zeroStock} note="qty = 0 en BSale" />
        <Stat label="Última edición" value={override?.updated_at ? new Date(override.updated_at).toLocaleString('es-CL') : '—'} note={override ? 'override en Supabase' : 'sin overrides'} />
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-1">Edit metadata</h2>
        <p className="text-sm text-gray-500 mb-4">
          Estos cambios se mergean encima de la metadata definida en código. Aplican
          al sitio público inmediatamente (sin redeploy). Dejá un campo vacío para usar el valor del código.
        </p>
        <BrandEditForm slug={slug} base={{
          basePriceClp: base.basePriceClp ?? 0,
          description: base.description ?? '',
          heroImage: base.heroImage ?? '',
          productName: base.productName,
        }} override={override} />
      </section>
    </AdminChrome>
  );
}

function Stat({ label, value, note, mono }: { label: string; value: string | number; note?: string; mono?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${mono ? 'font-mono' : ''}`}>{value}</div>
      {note && <div className="text-xs text-gray-400 mt-1">{note}</div>}
    </div>
  );
}
