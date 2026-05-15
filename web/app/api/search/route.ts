import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

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

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '12', 10), 50);

  if (q.length < 2) return NextResponse.json({ results: [] });

  const idx = loadIndex();
  const qn = normalize(q);
  const tokens = qn.split(/\s+/).filter(Boolean);

  // Score: name match > sku > brand. Boost full-token contiguity.
  const scored: Array<{ p: SlimProduct; score: number }> = [];
  for (const p of idx) {
    const haystack = normalize(`${p.name} ${p.sku ?? ''} ${p.brand ?? ''}`);
    let score = 0;
    for (const t of tokens) {
      if (haystack.includes(t)) score += t.length;
    }
    if (haystack.startsWith(qn)) score += 10;
    if (haystack.includes(qn)) score += 5;
    if (score > 0) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    results: scored.slice(0, limit).map(s => s.p),
    total: scored.length,
  });
}
