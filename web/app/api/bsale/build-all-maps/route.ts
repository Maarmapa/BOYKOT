// GET /api/bsale/build-all-maps
//
// Escanea variants para cada brand con bsaleProductId conocido, parsea
// descriptions y devuelve un mega-mapa { brandSlug: { code: variantId, ... } }
// Pegá la respuesta en web/data/bsale-variants-all.json y lista para wirear.

import { NextRequest, NextResponse } from 'next/server';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

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
  if (!res.ok) throw new Error(`BSale ${res.status}`);
  return res.json();
}

function parseCode(description: string): string | null {
  const clean = (description || '')
    .trim()
    .replace(/^Sketch\s+/i, '')
    .replace(/^Ciao\s+/i, '')
    .replace(/^Ink\s+/i, '')
    .replace(/^Classic\s+/i, '')
    .replace(/^Wide\s+/i, '')
    .trim();
  // Copic letras+dígitos: B00, BG13, FY
  let m = clean.match(/^([A-Z]{1,3}\d{0,4}[A-Z]?)$/i);
  if (m) return m[1].toUpperCase();
  // Fluor con paréntesis
  m = clean.match(/^([A-Z]{1,4})\s*\([A-Z0-9]+\)$/i);
  if (m) return m[1].toUpperCase();
  // Numérico solo
  m = clean.match(/^(\d{1,4})$/);
  if (m) return m[1];
  // Molotow Premium: "001 Jasmin Yellow 327001" o "220-1 Gold Dollar 327243"
  //   → code = primer token (001, 220-1, etc)
  m = clean.match(/^(\d{1,3}(?:-\d{1,2})?)\s+.+\s+\d{6}$/);
  if (m) return m[1];
  return null;
}

async function mapBrand(productId: number, token: string) {
  const codes: Record<string, number> = {};
  const sets: BsaleVariant[] = [];
  const unparsed: BsaleVariant[] = [];
  let next: string | null = `${BASE}/variants.json?productid=${productId}&limit=50&offset=0`;
  let total = 0;

  while (next) {
    const data = await call(next, token);
    for (const v of data.items ?? []) {
      total++;
      if (typeof v.id !== 'number') continue;
      const code = parseCode(v.description || '');
      if (code) {
        codes[code] = v.id;
        continue;
      }
      if (/\b(set|kit|colors?|manga|trio|fusion|portrait|airy|vibrant|pc)\b/i.test(v.description || '')) {
        sets.push(v);
      } else {
        unparsed.push(v);
      }
    }
    next = data.next ?? null;
  }

  return {
    total,
    mapped: Object.keys(codes).length,
    codes,
    sets_count: sets.length,
    unparsed_count: unparsed.length,
    unparsedList: unparsed,
  };
}

export async function GET(_req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'BSALE_ACCESS_TOKEN missing' }, { status: 500 });

  const targets = BRAND_SLUGS
    .map(slug => ({ slug, brand: BRANDS[slug] }))
    .filter(x => x.brand?.bsaleProductId && x.brand.bsaleProductId > 0);

  const results: Record<string, unknown> = {};
  const consolidatedColors: Record<string, Record<string, number>> = {};

  const start = Date.now();

  for (const { slug, brand } of targets) {
    if (Date.now() - start > 50_000) {
      results[slug] = { error: 'timeout — re-runeá' };
      continue;
    }
    try {
      const r = await mapBrand(brand.bsaleProductId, token);
      const row: Record<string, unknown> = {
        product_id: brand.bsaleProductId,
        total_variants: r.total,
        colors_mapped: r.mapped,
        sets_count: r.sets_count,
        unparsed_count: r.unparsed_count,
      };
      // Expose unparsed sample para brands con cobertura baja (debug)
      if (r.mapped === 0 && r.total > 0) {
        row.unparsed_sample = r.unparsedList?.slice(0, 5) ?? [];
      }
      results[slug] = row;
      consolidatedColors[slug] = r.codes;
    } catch (e) {
      results[slug] = { error: (e as Error).message };
    }
  }

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    took_ms: Date.now() - start,
    brands_processed: Object.keys(results).length,
    summary: results,
    by_brand: consolidatedColors,
  }, { headers: { 'cache-control': 'no-store' } });
}
