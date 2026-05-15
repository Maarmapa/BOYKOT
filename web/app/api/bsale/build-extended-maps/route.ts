// GET /api/bsale/build-extended-maps
//
// Maps especiales que el build-all-maps no puede hacer porque:
// 1. Angelus Pintura Cuero (2262) tiene 8 sub-lineas convivendo en 1 producto.
//    Se separan por SKU prefix (ANGE72001 = Standard 1oz, etc.).
// 2. Holbein Acuarela/Gouache/Oleo están en MULTIPLE productos (Serie A, B, C…)
//    pero en boykot.cl son UN solo slug consolidado.
//
// Output: { by_brand: { slug: { code: variantId }, ... } } para mergear con
// data/bsale-variants-all.json.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

interface BsaleVariant { id?: number; description?: string; code?: string }

async function call(url: string, token: string): Promise<{
  items?: BsaleVariant[];
  next?: string;
}> {
  const res = await fetch(url, {
    headers: { access_token: token, accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BSale ${res.status} ${url}`);
  return res.json();
}

async function dumpAllVariants(productId: number, token: string): Promise<BsaleVariant[]> {
  const out: BsaleVariant[] = [];
  let next: string | null = `${BASE}/variants.json?productid=${productId}&limit=50&offset=0`;
  while (next) {
    const data = await call(next, token);
    for (const v of data.items ?? []) out.push(v);
    next = data.next ?? null;
  }
  return out;
}

// Extrae el código de color del description: "001 Black 1 onza" → "001"
function extractCode(description: string): string | null {
  const clean = (description || '').trim();
  // Pattern: NNN(-N)? NombreColor [tamaño]
  const m = clean.match(/^(\d{1,4}(?:-\d{1,2})?)\s+/);
  if (m) return m[1];
  // Fallback: BASICS, KIT etc.
  return null;
}

export async function GET(_req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'BSALE_ACCESS_TOKEN missing' }, { status: 500 });

  const start = Date.now();
  const byBrand: Record<string, Record<string, number>> = {};
  const stats: Record<string, { mapped: number; sources?: string[] }> = {};

  // ───── 1. ANGELUS PINTURA CUERO (2262) — separar por SKU prefix
  try {
    const vs = await dumpAllVariants(2262, token);
    // SKU → slug mapping
    const skuToSlug = (sku: string): string | null => {
      if (sku.startsWith('ANGE72001')) return 'angelus-standard-1oz';
      if (sku.startsWith('ANGE72004')) return 'angelus-standard-4oz';
      if (sku.startsWith('720PT')) return 'angelus-standard-pint';
      if (sku.startsWith('ANGE720QT')) return 'angelus-standard-quart';
      if (sku.startsWith('ANGE72501')) return 'angelus-neon-1oz';
      if (sku.startsWith('ANGE72504')) return 'angelus-neon-4oz';
      if (sku.startsWith('ANGE73201') || sku.startsWith('ANGE73301')) return 'angelus-pearlescents-1oz';
      if (sku.startsWith('ANGE73204') || sku.startsWith('ANGE73304')) return 'angelus-pearlescents-4oz';
      if (sku.startsWith('ANGE72701')) return 'angelus-collector';
      if (sku.startsWith('ANGE72101')) return 'angelus-glow-1oz';
      return null;
    };
    for (const v of vs) {
      const sku = v.code || '';
      const slug = skuToSlug(sku);
      if (!slug || typeof v.id !== 'number') continue;
      const code = extractCode(v.description || '');
      if (!code) continue;
      byBrand[slug] = byBrand[slug] || {};
      byBrand[slug][code] = v.id;
    }
    for (const slug of [
      'angelus-standard-1oz', 'angelus-standard-4oz', 'angelus-standard-pint', 'angelus-standard-quart',
      'angelus-neon-1oz', 'angelus-neon-4oz',
      'angelus-pearlescents-1oz', 'angelus-pearlescents-4oz',
      'angelus-collector', 'angelus-glow-1oz',
    ]) {
      stats[slug] = { mapped: Object.keys(byBrand[slug] || {}).length, sources: ['2262'] };
    }
  } catch (e) {
    stats['angelus-pintura-cuero'] = { mapped: 0, sources: [`error: ${(e as Error).message}`] };
  }

  // ───── 2. HOLBEIN ACUARELA 15ml (multi-product) — series A-F
  // Series A=3226, B=3221, C=3224, D=3222, E=3223, F=3225
  // Descriptions: "W201 Chinese White" → code = W201 (ya único cross-serie)
  const holbeinAcuarela15: number[] = [3226, 3221, 3224, 3222, 3223, 3225];
  byBrand['holbein-acuarela-15ml'] = {};
  for (const pid of holbeinAcuarela15) {
    try {
      const vs = await dumpAllVariants(pid, token);
      for (const v of vs) {
        if (typeof v.id !== 'number') continue;
        const desc = (v.description || '').trim();
        // "W201 Chinese White" → "W201"
        const m = desc.match(/^([A-Z]{1,3}\d{3,4})\s+/i);
        if (m) byBrand['holbein-acuarela-15ml'][m[1].toUpperCase()] = v.id;
      }
    } catch {}
  }
  stats['holbein-acuarela-15ml'] = {
    mapped: Object.keys(byBrand['holbein-acuarela-15ml']).length,
    sources: holbeinAcuarela15.map(String),
  };

  // ───── 3. HOLBEIN ACUARELA 60ml — series A=3230, B=3227, C=3228, D=3229
  const holbeinAcuarela60: number[] = [3230, 3227, 3228, 3229];
  byBrand['holbein-acuarela-60ml'] = {};
  for (const pid of holbeinAcuarela60) {
    try {
      const vs = await dumpAllVariants(pid, token);
      for (const v of vs) {
        if (typeof v.id !== 'number') continue;
        const desc = (v.description || '').trim();
        const m = desc.match(/^([A-Z]{1,3}\d{3,4})\s+/i);
        if (m) byBrand['holbein-acuarela-60ml'][m[1].toUpperCase()] = v.id;
      }
    } catch {}
  }
  stats['holbein-acuarela-60ml'] = {
    mapped: Object.keys(byBrand['holbein-acuarela-60ml']).length,
    sources: holbeinAcuarela60.map(String),
  };

  // ───── 4. HOLBEIN GOUACHE 15ml — series A=2693, B=2694, C=2695, D=2696, E=2697, G=2698
  const holbeinGouache15: Record<string, number> = { A: 2693, B: 2694, C: 2695, D: 2696, E: 2697, G: 2698 };
  // Reseteo el slug porque ya estaba mapeado con solo Serie A en bsale-variants-all.json viejo
  byBrand['holbein-gouache-15ml'] = {};
  for (const [serie, pid] of Object.entries(holbeinGouache15)) {
    try {
      const vs = await dumpAllVariants(pid, token);
      for (const v of vs) {
        if (typeof v.id !== 'number') continue;
        // Holbein Gouache descriptions tienen prefix tipo "G503 Geranium"
        // El parser actual extrae "G503" — pero quiero limpiarlo a solo 503 + serie G
        const desc = (v.description || '').trim();
        // Patrón: <letra><digitos> <nombre>
        const m = desc.match(/^[A-Z](\d{2,4})\s+/i);
        if (m) byBrand['holbein-gouache-15ml'][`${serie}${m[1]}`] = v.id;
      }
    } catch {}
  }
  stats['holbein-gouache-15ml'] = {
    mapped: Object.keys(byBrand['holbein-gouache-15ml']).length,
    sources: Object.values(holbeinGouache15).map(String),
  };

  // ───── 4b. HOLBEIN ACRYLA GOUACHE 20ml — 2690+2691+2692 (Series A, C, P)
  const acryla20: number[] = [2690, 2691, 2692];
  byBrand['holbein-acryla-gouache-20ml'] = {};
  for (const pid of acryla20) {
    try {
      const vs = await dumpAllVariants(pid, token);
      for (const v of vs) {
        if (typeof v.id !== 'number') continue;
        const sku = (v.code || '').trim();
        // Codes son D001 etc. Para 20ml van D001-D6xx (descripción incluye "20ml" o "20 ml")
        const desc = (v.description || '').trim();
        if (!/20\s*ml/i.test(desc)) continue;
        const m = sku.match(/^([A-Z]\d{3,4})$/i);
        if (m) byBrand['holbein-acryla-gouache-20ml'][m[1].toUpperCase()] = v.id;
      }
    } catch {}
  }
  stats['holbein-acryla-gouache-20ml'] = {
    mapped: Object.keys(byBrand['holbein-acryla-gouache-20ml']).length,
    sources: acryla20.map(String),
  };

  // ───── 4c. HOLBEIN ACRYLA GOUACHE 40ml — 2809+2810 (Series A, C)
  const acryla40: number[] = [2809, 2810];
  byBrand['holbein-acryla-gouache-40ml'] = {};
  for (const pid of acryla40) {
    try {
      const vs = await dumpAllVariants(pid, token);
      for (const v of vs) {
        if (typeof v.id !== 'number') continue;
        const sku = (v.code || '').trim();
        const desc = (v.description || '').trim();
        if (!/40\s*ml/i.test(desc)) continue;
        const m = sku.match(/^([A-Z]\d{3,4})$/i);
        if (m) byBrand['holbein-acryla-gouache-40ml'][m[1].toUpperCase()] = v.id;
      }
    } catch {}
  }
  stats['holbein-acryla-gouache-40ml'] = {
    mapped: Object.keys(byBrand['holbein-acryla-gouache-40ml']).length,
    sources: acryla40.map(String),
  };

  // ───── 5. HOLBEIN OLEO 20ml — series A=2670, B=2671, C=2672, CW=2677, D=2673,
  //         E=2674, H=2675, I=2676, L=2684, W=2678, W1=2679
  const holbeinOleo: Record<string, number> = {
    A: 2670, B: 2671, C: 2672, CW: 2677, D: 2673,
    E: 2674, H: 2675, I: 2676, L: 2684, W: 2678, W1: 2679,
  };
  byBrand['holbein-oleo-20ml'] = {};
  for (const [serie, pid] of Object.entries(holbeinOleo)) {
    try {
      const vs = await dumpAllVariants(pid, token);
      for (const v of vs) {
        if (typeof v.id !== 'number') continue;
        // Oleo descriptions: "20 ml <Name> <Hxxx>" donde Hxxx es el código original
        const desc = (v.description || '').trim().replace(/^20\s+ml\s+/i, '');
        const m = desc.match(/\s([HG]\d{3,4})$/i);
        if (m) byBrand['holbein-oleo-20ml'][m[1].toUpperCase()] = v.id;
      }
    } catch {}
  }
  stats['holbein-oleo-20ml'] = {
    mapped: Object.keys(byBrand['holbein-oleo-20ml']).length,
    sources: Object.values(holbeinOleo).map(String),
  };

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    took_ms: Date.now() - start,
    stats,
    by_brand: byBrand,
  }, { headers: { 'cache-control': 'no-store' } });
}
