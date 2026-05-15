// GET /api/bsale/test-brand-stock?slug=angelus-standard-1oz
//
// Replica la pipeline real de brand page:
//   1. Lookup BRANDS[slug] → bsaleProductId
//   2. getProductStock(productId) → list de {variant_id, available}
//   3. Para cada color con variantId hidratado, lookup available
//   4. Devuelve sample de stock + diagnóstico (cobertura, missing).
//
// Sirve para verificar end-to-end que el wiring stock-live funciona.

import { NextRequest, NextResponse } from 'next/server';
import { BRANDS } from '@/lib/colors/brands';
import { getProductStock } from '@/lib/stock';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || 'angelus-standard-1oz';
  const brand = BRANDS[slug];
  if (!brand) return NextResponse.json({ error: `slug ${slug} not found` }, { status: 404 });

  const out: Record<string, unknown> = {
    slug,
    brandName: brand.brandName,
    productName: brand.productName,
    bsaleProductId: brand.bsaleProductId,
    total_colors: brand.colors.length,
  };

  if (!brand.bsaleProductId) {
    out.error = 'bsaleProductId no configurado (sin stock)';
    return NextResponse.json(out);
  }

  if (!process.env.BSALE_ACCESS_TOKEN) {
    out.error = 'BSALE_ACCESS_TOKEN no set';
    return NextResponse.json(out);
  }

  const start = Date.now();
  try {
    const variantIds = brand.colors
      .map(c => c.variantId)
      .filter((v): v is number => typeof v === 'number');
    const rows = await getProductStock(brand.bsaleProductId, variantIds);
    out.stock_rows_total = rows.length;
    out.took_ms = Date.now() - start;

    const byVariant: Record<number, number> = {};
    for (const r of rows) byVariant[r.variant_id] = r.available;

    let withVariantId = 0;
    let withStock = 0;
    let zeroStock = 0;
    const sample: Array<{ code: string; variantId?: number; available?: number }> = [];

    for (const c of brand.colors) {
      if (typeof c.variantId === 'number') {
        withVariantId++;
        if (c.variantId in byVariant) {
          withStock++;
          if (byVariant[c.variantId] <= 0) zeroStock++;
          if (sample.length < 10) {
            sample.push({ code: c.code, variantId: c.variantId, available: byVariant[c.variantId] });
          }
        }
      }
    }

    out.diagnostic = {
      colors_with_variantId: withVariantId,
      colors_with_stock_row: withStock,
      colors_zero_stock: zeroStock,
      coverage_percent: brand.colors.length > 0 ? Math.round((withStock / brand.colors.length) * 100) : 0,
    };
    out.sample = sample;
  } catch (e) {
    out.error = (e as Error).message;
  }

  return NextResponse.json(out, { headers: { 'cache-control': 'no-store' } });
}
