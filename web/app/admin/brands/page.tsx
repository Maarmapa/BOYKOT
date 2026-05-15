import { requireAdmin } from '../layout';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import bsaleVariants from '@/data/bsale-variants-all.json';
import Link from 'next/link';
import AdminChrome from '@/components/admin/Chrome';

export const dynamic = 'force-dynamic';

export default async function BrandsAdminPage() {
  await requireAdmin();
  return <AdminChrome><BrandsBody /></AdminChrome>;
}

function BrandsBody() {
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
    return {
      slug,
      brandName: b.brandName || '',
      productName: b.productName,
      bsaleProductId: b.bsaleProductId ?? 0,
      basePriceClp: b.basePriceClp ?? 0,
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
                  <div className="font-medium text-gray-900">
                    {r.brandName} <span className="text-gray-500">{r.productName}</span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">{r.slug}</div>
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
                  <div className="flex gap-2 justify-end">
                    <Link href={`/colores/${r.slug}`} target="_blank" className="text-xs text-blue-700 hover:underline">
                      Ver →
                    </Link>
                    <Link href={`/api/bsale/test-brand-stock?slug=${r.slug}`} target="_blank" className="text-xs text-gray-500 hover:underline">
                      Test
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
