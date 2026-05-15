import { requireAdmin } from '../layout';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import bsaleVariants from '@/data/bsale-variants-all.json';
import Link from 'next/link';
import AdminChrome from '@/components/admin/Chrome';
import { loadAllOverrides } from '@/lib/brand-overrides';

export const dynamic = 'force-dynamic';

export default async function BrandsAdminPage() {
  await requireAdmin();
  const overrides = await loadAllOverrides();
  return <AdminChrome><BrandsBody overridesBySlug={overrides} /></AdminChrome>;
}

function BrandsBody({ overridesBySlug }: { overridesBySlug: Map<string, { hidden: boolean; base_price_clp: number | null; updated_at: string }> }) {
  const variantsByBrand = (bsaleVariants as { by_brand: Record<string, Record<string, number>> }).by_brand;

  const rows = BRAND_SLUGS.map(slug => {
    const b = BRANDS[slug];
    const variantMap = variantsByBrand[slug] ?? {};
    const colorsCount = b.colors?.length ?? 0;
    const variantsMapped = Object.keys(variantMap).length;
    const colorsWithVariantId = (b.colors ?? []).filter(c =>
      typeof c.variantId === 'number' ||
      variantMap[c.code] !== undefined ||
      variantMap[c.code?.toUpperCase()] !== undefined,
    ).length;
    const override = overridesBySlug.get(slug);
    return {
      slug,
      brandName: b.brandName || '',
      productName: b.productName,
      bsaleProductId: b.bsaleProductId ?? 0,
      basePriceClp: override?.base_price_clp ?? b.basePriceClp ?? 0,
      hasOverride: !!override,
      isHidden: !!override?.hidden,
      colorsCount,
      variantsMapped,
      colorsHydrated: colorsWithVariantId,
      coverage: colorsCount > 0 ? Math.round((colorsWithVariantId / colorsCount) * 100) : 0,
    };
  }).sort((a, b) => b.coverage - a.coverage);

  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Brands & Stock Coverage</h1>
      <p className="text-sm text-gray-500 mb-6">
        {rows.length} brand pages. Coverage = % de colores con variantId mapeado.
        Stock live requiere <code>bsaleProductId</code> + variantId.
      </p>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">BSale ID</th>
              <th className="px-4 py-3 text-right">Colores</th>
              <th className="px-4 py-3 text-right">Mapeados</th>
              <th className="px-4 py-3 text-right">Coverage</th>
              <th className="px-4 py-3 text-right">Precio base</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(r => (
              <tr key={r.slug} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/brands/${r.slug}`} className="block group">
                    <div className="font-medium text-gray-900 group-hover:text-blue-700">
                      {r.brandName} <span className="text-gray-500">{r.productName}</span>
                      {r.hasOverride && <span className="ml-2 text-[10px] uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">editado</span>}
                      {r.isHidden && <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">oculto</span>}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{r.slug}</div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 font-mono">
                  {r.bsaleProductId || <span className="text-amber-600">—</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r.colorsCount}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">{r.colorsHydrated}</td>
                <td className="px-4 py-3 text-right">
                  <CoverageBar pct={r.coverage} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                  ${r.basePriceClp.toLocaleString('es-CL')}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end items-center">
                    <Link href={`/admin/brands/${r.slug}`} className="text-xs font-medium text-blue-700 hover:underline">
                      Editar
                    </Link>
                    <Link href={`/colores/${r.slug}`} target="_blank" className="text-xs text-gray-500 hover:underline">
                      Ver ↗
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CoverageBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-gray-600 w-9 text-right">{pct}%</span>
    </div>
  );
}
