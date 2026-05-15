import { requireAdmin } from './layout';
import { BRANDS } from '@/lib/colors/brands';
import bsaleVariants from '@/data/bsale-variants-all.json';
import Link from 'next/link';
import AdminChrome from '@/components/admin/Chrome';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();
  return <AdminChrome><DashboardBody /></AdminChrome>;
}

function DashboardBody() {
  const variantsByBrand = (bsaleVariants as { by_brand: Record<string, Record<string, number>> }).by_brand;

  const brandSlugs = Object.keys(BRANDS);
  const totalBrands = brandSlugs.length;
  const brandsWithBsaleId = brandSlugs.filter(s => BRANDS[s].bsaleProductId && BRANDS[s].bsaleProductId > 0).length;
  const totalColorsRegistered = brandSlugs.reduce((s, slug) => s + (BRANDS[slug].colors?.length ?? 0), 0);
  const totalVariantsMapped = Object.values(variantsByBrand).reduce((s, m) => s + Object.keys(m).length, 0);

  // BSale slugs en bsale-variants-all.json que NO están en brands.ts (futuras brand pages)
  const slugsInJsonNotInBrands = Object.keys(variantsByBrand).filter(s => !(s in BRANDS));

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">
        Panel de control del catálogo Boykot. Datos en tiempo real de la integración BSale.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Stat label="Brand pages activas" value={totalBrands} note={`${brandsWithBsaleId} con stock live`} />
        <Stat label="Colores registrados" value={totalColorsRegistered} note="suma de todos los swatches" />
        <Stat label="VariantIds BSale mapeados" value={totalVariantsMapped} note="stock-live ready" />
        <Stat label="Sub-slugs pendientes" value={slugsInJsonNotInBrands.length} note="en JSON, no en brands.ts" />
      </div>

      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-1">Acciones rápidas</h2>
        <p className="text-sm text-gray-500 mb-4">Operaciones administrativas comunes.</p>
        <div className="flex flex-wrap gap-2">
          <Action href="/admin/brands" label="Ver tabla de stock coverage" />
          <Action href="/admin/sync" label="Sync stock BSale" />
          <Action href="/api/bsale/build-all-maps" external label="Re-build variant maps (API)" />
          <Action href="/api/bsale/build-extended-maps" external label="Re-build extended maps (API)" />
        </div>
      </section>

      {slugsInJsonNotInBrands.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-sm font-semibold text-amber-900 mb-1">Sub-slugs pendientes de activar</h2>
          <p className="text-xs text-amber-800 mb-3">
            Estos slugs tienen variantIds mapeados pero todavía no aparecen como brand pages. Para activarlos: crear JSON en <code>web/public/colors/</code> y registrarlos en <code>brands.ts</code>.
          </p>
          <ul className="text-xs text-amber-900 space-y-1">
            {slugsInJsonNotInBrands.map(s => (
              <li key={s}><code>{s}</code> ({Object.keys(variantsByBrand[s]).length} colores)</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="text-3xl font-bold mt-1">{value.toLocaleString('es-CL')}</div>
      {note && <div className="text-xs text-gray-400 mt-1">{note}</div>}
    </div>
  );
}

function Action({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener" className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-3 py-1.5">
      {label} ↗
    </a>
  ) : (
    <Link href={href} className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-3 py-1.5">
      {label} →
    </Link>
  );
}
