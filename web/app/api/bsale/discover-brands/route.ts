// GET /api/bsale/discover-brands
//
// Busca en BSale productos por nombre de cada marca registrada localmente
// pero sin bsaleProductId. Devuelve candidatos ordenados por variant_count
// (mayor = más probable que sea la carta de color principal).
//
// Output va directo a stdout, vos copiás los IDs al brands.ts y listo.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

interface BsaleProduct {
  id?: number;
  name?: string;
  classification?: number;
}

async function call<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { access_token: token, accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`BSale ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

interface Hit {
  id: number;
  name: string;
  variant_count: number;
}

// Para cada marca conocida en boykot, busco la palabra clave en BSale
// y devuelvo los productos con su variant count.
const SEARCH_TERMS = [
  { brand_slug: 'copic-classic', terms: ['Classic'] },
  { brand_slug: 'copic-wide', terms: ['Wide'] },
  { brand_slug: 'copic-multiliner', terms: ['Multiliner'] },
  { brand_slug: 'angelus-standard-1oz', terms: ['Angelus 1oz', 'Standard 1', 'Leather 1oz'] },
  { brand_slug: 'angelus-standard-4oz', terms: ['Angelus 4oz', 'Standard 4', 'Leather 4oz'] },
  { brand_slug: 'angelus-pearlescents-1oz', terms: ['Pearlescent', 'Pearlescents'] },
  { brand_slug: 'angelus-pearlescents-4oz', terms: ['Pearlescent 4', 'Pearl 4oz'] },
  { brand_slug: 'angelus-neon-1oz', terms: ['Neon 1oz', 'Neon Angelus'] },
  { brand_slug: 'angelus-neon-4oz', terms: ['Neon 4oz'] },
  { brand_slug: 'angelus-glitterlites-1oz', terms: ['Glitterlite', 'Glitter'] },
  { brand_slug: 'angelus-tintura-cuero-3oz', terms: ['Tintura', 'Leather Dye'] },
  { brand_slug: 'angelus-tintura-gamuza-3oz', terms: ['Gamuza', 'Suede'] },
  { brand_slug: 'holbein-acuarela-15ml', terms: ['Acuarela 15', 'Watercolor 15'] },
  { brand_slug: 'holbein-acuarela-60ml', terms: ['Acuarela 60', 'Watercolor 60'] },
  { brand_slug: 'holbein-oleo-20ml', terms: ['Oleo', 'Óleo', 'Oil'] },
  { brand_slug: 'holbein-gouache-15ml', terms: ['Gouache'] },
  { brand_slug: 'holbein-acryla-gouache-20ml', terms: ['Acryla 20', 'Acryla Gouache 20'] },
  { brand_slug: 'holbein-acryla-gouache-40ml', terms: ['Acryla 40', 'Acryla Gouache 40'] },
  { brand_slug: 'createx-airbrush-60ml', terms: ['Createx 60', 'Airbrush 60'] },
  { brand_slug: 'createx-airbrush-120ml', terms: ['Createx 120', 'Airbrush 120'] },
  { brand_slug: 'createx-airbrush-240ml', terms: ['Createx 240', 'Airbrush 240'] },
  { brand_slug: 'createx-illustration-30ml', terms: ['Illustration', 'Createx Illustration'] },
  { brand_slug: 'wicked-colors-480ml', terms: ['Wicked'] },
  { brand_slug: 'zig-calligraphy', terms: ['Calligraphy', 'ZIG Calligraphy'] },
  { brand_slug: 'zig-acrylista-6mm', terms: ['Acrylista 6'] },
  { brand_slug: 'zig-acrylista-15mm', terms: ['Acrylista 15'] },
  { brand_slug: 'zig-fabricolor-twin', terms: ['Fabricolor'] },
  { brand_slug: 'uni-posca-5m', terms: ['Posca 5M', 'POSCA 5M', 'PC-5M'] },
  { brand_slug: 'aqua-color-brush', terms: ['Aqua Color Brush', 'AquaColor'] },
  { brand_slug: 'aqua-twin', terms: ['Aqua Twin'] },
  { brand_slug: 'molotow-premium-neon', terms: ['Premium Neon', 'Molotow Neon'] },
  { brand_slug: 'molotow-premium-plus', terms: ['Premium Plus', 'Molotow Plus'] },
];

async function searchByName(name: string, token: string): Promise<BsaleProduct[]> {
  try {
    const data = await call<{ items?: BsaleProduct[] }>(
      `${BASE}/products.json?name=${encodeURIComponent(name)}&limit=10`,
      token,
    );
    return data.items ?? [];
  } catch {
    return [];
  }
}

async function variantCount(productId: number, token: string): Promise<number> {
  try {
    const data = await call<{ count?: number }>(
      `${BASE}/variants.json?productid=${productId}&limit=1`,
      token,
    );
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function GET(_req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: 'BSALE_ACCESS_TOKEN missing' }, { status: 500 });

  const start = Date.now();
  const results: Array<{ brand_slug: string; candidates: Hit[] }> = [];

  for (const { brand_slug, terms } of SEARCH_TERMS) {
    if (Date.now() - start > 50_000) {
      results.push({ brand_slug, candidates: [{ id: 0, name: 'TIMEOUT', variant_count: 0 }] });
      continue;
    }
    const seen = new Set<number>();
    const candidates: Hit[] = [];
    for (const term of terms) {
      const matches = await searchByName(term, token);
      for (const p of matches) {
        if (typeof p.id !== 'number' || seen.has(p.id) || !p.name) continue;
        seen.add(p.id);
        const vc = await variantCount(p.id, token);
        candidates.push({ id: p.id, name: p.name, variant_count: vc });
      }
    }
    // Sort por variant_count desc (la carta de color principal va a tener
    // muchos variants, los productos sueltos solo 1).
    candidates.sort((a, b) => b.variant_count - a.variant_count);
    results.push({ brand_slug, candidates: candidates.slice(0, 5) });
  }

  // Sugerencia automática: el top candidato con variant_count >= 5
  const suggestions: Record<string, number> = {};
  for (const r of results) {
    const top = r.candidates[0];
    if (top && top.variant_count >= 5) suggestions[r.brand_slug] = top.id;
  }

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    took_ms: Date.now() - start,
    suggestions,
    results,
  }, { headers: { 'cache-control': 'no-store' } });
}
