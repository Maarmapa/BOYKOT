// GET /api/bsale/build-map — escanea BSale y devuelve un mapa de productos
// por código (B00, BG13, etc) agrupado por marca. Pesado: hace ~75 requests
// paginadas a /products.json + 1 por producto a /variants.json. Tarda ~30s.
//
// Devuelve el JSON listo para guardar como web/data/bsale-products.json y
// shippearlo en el próximo deploy. Esto reemplaza el campo bsaleProductId
// del registry brands.ts que apuntaba al modelo viejo.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

const BRAND_PATTERNS: Array<{ regex: RegExp; brand: string }> = [
  { regex: /^Sketch\s+([A-Z0-9]+)$/i, brand: 'copic-sketch' },
  { regex: /^Ciao\s+([A-Z0-9]+)$/i, brand: 'copic-ciao' },
  { regex: /^Classic\s+([A-Z0-9]+)$/i, brand: 'copic-classic' },
  { regex: /^Wide\s+([A-Z0-9]+)$/i, brand: 'copic-wide' },
  { regex: /^Ink\s+([A-Z0-9]+)$/i, brand: 'copic-ink' },
  { regex: /^Various\s+Ink\s+([A-Z0-9]+)$/i, brand: 'copic-ink' },
  { regex: /^Multiliner\s+([A-Z0-9.]+)$/i, brand: 'copic-multiliner' },
];

interface MapEntry {
  productId: number;
  variantId: number | null;
  name: string;
  code: string;
  brand: string;
}

async function call(url: string, token: string): Promise<{ items?: Array<Record<string, unknown>>; next?: string }> {
  const res = await fetch(url, {
    headers: { access_token: token, accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BSale ${res.status} ${url}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'BSALE_ACCESS_TOKEN missing' }, { status: 500 });

  // No gate: este endpoint solo devuelve productIds + nombres + códigos (no
  // expone precios ni stock real, esa data ya está en /catalog.json y es
  // pública). El Vercel SSO de previews ya filtra el acceso público.

  // Permite limitar la corrida con ?onlybrand=copic-sketch para test rápido
  const onlyBrand = req.nextUrl.searchParams.get('onlybrand');

  const byCode: Record<string, MapEntry> = {};
  const byBrand: Record<string, Record<string, MapEntry>> = {};
  const sketchSample: string[] = [];
  const allNames: string[] = [];
  let total = 0;
  let pages = 0;
  let next: string | null = `${BASE}/products.json?limit=50&offset=0`;

  const start = Date.now();

  while (next && Date.now() - start < 55_000) {
    const data: { items?: Array<{ id?: number; name?: string }>; next?: string } =
      await call(next, token);
    for (const p of data.items ?? []) {
      total++;
      if (!p.name || typeof p.id !== 'number') continue;
      if (allNames.length < 50) allNames.push(p.name);
      if (/sketch/i.test(p.name) && sketchSample.length < 60) sketchSample.push(p.name);

      for (const { regex, brand } of BRAND_PATTERNS) {
        if (onlyBrand && brand !== onlyBrand) continue;
        const m = p.name.match(regex);
        if (!m) continue;
        const code = m[1].toUpperCase();
        // Variant lookup
        let variantId: number | null = null;
        try {
          const v = await call(`${BASE}/variants.json?productid=${p.id}&limit=1`, token);
          const first = v.items?.[0];
          if (first && typeof (first as { id?: number }).id === 'number') {
            variantId = (first as { id: number }).id;
          }
        } catch { /* keep null */ }
        const entry: MapEntry = { productId: p.id, variantId, name: p.name, code, brand };
        if (!byCode[code]) byCode[code] = entry;
        byBrand[brand] = byBrand[brand] ?? {};
        byBrand[brand][code] = entry;
        break;
      }
    }
    pages++;
    next = data.next ?? null;
  }

  const summary: Record<string, number> = {};
  for (const brand of Object.keys(byBrand)) summary[brand] = Object.keys(byBrand[brand]).length;

  return NextResponse.json(
    {
      generated_at: new Date().toISOString(),
      took_ms: Date.now() - start,
      products_scanned: total,
      pages_fetched: pages,
      complete: !next,
      summary,
      debug_sample_all_names: allNames.slice(0, 30),
      debug_sample_sketch_names: sketchSample,
      byBrand,
      byCode,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
