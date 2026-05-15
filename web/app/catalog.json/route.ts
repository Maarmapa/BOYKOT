// /catalog.json — agent-friendly catalog feed. Differs from /products-feed.xml
// (Meta Catalog RSS) in being clean JSON, paginated, with explicit stock and
// canonical URLs. Cached at the edge.

import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SlimProduct {
  slug: string;
  name: string;
  sku: string | null;
  price: number | null;
  image: string | null;
  cat: string | null;
  brand: string | null;
}

let _index: SlimProduct[] | null = null;
function loadIndex(): SlimProduct[] {
  if (_index) return _index;
  const file = path.join(process.cwd(), 'public', 'products-index.json');
  _index = JSON.parse(fs.readFileSync(file, 'utf8')) as SlimProduct[];
  return _index;
}

const SITE = 'https://boykot.cl';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '200', 10), 1000);
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
  const brand = url.searchParams.get('brand');
  const cat = url.searchParams.get('cat');

  let idx = loadIndex();
  if (brand) idx = idx.filter(p => p.brand?.toLowerCase() === brand.toLowerCase());
  if (cat) idx = idx.filter(p => p.cat === cat);

  const total = idx.length;
  const slice = idx.slice(offset, offset + limit);

  const items = slice.map(p => ({
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    brand: p.brand,
    category: p.cat,
    price_clp: p.price,
    currency: 'CLP',
    image: p.image,
    url: `${SITE}/producto/${p.slug}`,
  }));

  const body = {
    site: 'Boykot',
    description: 'Tienda chilena de arte y graffiti. Distribuidor oficial Copic, Angelus, Holbein, Molotow.',
    version: '1.0',
    generated_at: new Date().toISOString(),
    pagination: {
      total,
      offset,
      limit,
      next_offset: offset + slice.length < total ? offset + slice.length : null,
    },
    filters: { brand, cat },
    items,
  };

  return Response.json(body, {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=3600',
      'access-control-allow-origin': '*',
    },
  });
}
