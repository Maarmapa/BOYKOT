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
// Ronda 2: termsmás agresivos para los que no matchearon antes.
// BSale a veces tiene productos sin prefijo de marca ("Pintura Cuero" en vez
// de "Angelus Pintura Cuero").
const SEARCH_TERMS = [
  // Angelus — buscar por "Leather", "Pintura Cuero", "Standard"
  { brand_slug: 'angelus-standard-1oz', terms: ['Leather 1oz', 'Cuero 1oz', 'Pintura Cuero 1', 'Standard 1oz', 'Leather Paint 1', 'Acrylic Leather'] },
  { brand_slug: 'angelus-standard-4oz', terms: ['Leather 4oz', 'Cuero 4oz', 'Pintura Cuero 4', 'Standard 4oz', 'Leather Paint 4'] },
  { brand_slug: 'angelus-pearlescents-1oz', terms: ['Pearl 1oz', 'Pearlescent 1', 'Perlado 1', 'Perlescente'] },
  { brand_slug: 'angelus-pearlescents-4oz', terms: ['Pearl 4oz', 'Pearlescent 4', 'Perlado 4'] },
  { brand_slug: 'angelus-neon-1oz', terms: ['Neon Cuero', 'Pintura Neon 1', 'Neon Leather', 'Neon 1 oz', 'Neon Paint 1'] },
  { brand_slug: 'angelus-neon-4oz', terms: ['Neon 4 oz', 'Neon Paint 4', 'Pintura Neon 4'] },
  // Holbein — buscar por "Watercolor", "Acuarela", series
  { brand_slug: 'holbein-acuarela-15ml', terms: ['Acuarela Serie', 'Watercolor 15', 'Aqua Watercolor', 'HWC 15ml', 'Watercolour 15'] },
  { brand_slug: 'holbein-acuarela-60ml', terms: ['Acuarela 60', 'Watercolor 60', 'HWC 60', 'Watercolour 60'] },
  { brand_slug: 'holbein-acryla-gouache-20ml', terms: ['Acryla Gouache 20', 'Acryla 20'] },
  { brand_slug: 'holbein-acryla-gouache-40ml', terms: ['Acryla Gouache 40', 'Acryla 40'] },
  // Createx Airbrush — buscar por "Airbrush", "Createx"
  { brand_slug: 'createx-airbrush-60ml', terms: ['Createx Colors 60', 'Airbrush Colors 60', 'Createx 60'] },
  { brand_slug: 'createx-airbrush-120ml', terms: ['Createx Colors 120', 'Airbrush Colors 120', 'Createx 120'] },
  { brand_slug: 'createx-airbrush-240ml', terms: ['Createx Colors 240', 'Airbrush Colors 240', 'Createx 240'] },
  // Copic Classic
  { brand_slug: 'copic-classic', terms: ['Copic Classic', 'Marcador Classic'] },
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
