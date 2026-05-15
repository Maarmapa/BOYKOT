// GET /api/bsale/variants?productid=2167 — lista todas las variants de un
// producto BSale paginadas. Devuelve {variantId, description, code (sku),
// barCode} por cada variante.
//
// Sirve para mapear color-codes (B00, BG13) a variantIds reales en BSale,
// que es lo que necesitamos para fetchVariantStock y fetchVariantPrice.

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const BASE = 'https://api.bsale.io/v1';

async function call(url: string, token: string): Promise<{
  items?: Array<{ id?: number; description?: string; code?: string; barCode?: string }>;
  next?: string;
  count?: number;
}> {
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

  const productId = req.nextUrl.searchParams.get('productid') || '2167';

  const all: Array<{ id: number; description: string; code: string; barCode: string }> = [];
  let next: string | null = `${BASE}/variants.json?productid=${productId}&limit=50&offset=0`;
  let pages = 0;
  const start = Date.now();

  while (next && Date.now() - start < 55_000) {
    const data = await call(next, token);
    for (const v of data.items ?? []) {
      if (typeof v.id !== 'number') continue;
      all.push({
        id: v.id,
        description: v.description ?? '',
        code: v.code ?? '',
        barCode: v.barCode ?? '',
      });
    }
    pages++;
    next = data.next ?? null;
  }

  // Parse cada description para extraer el código de color.
  // Patrones que vemos en Boykot's BSale:
  //   "B00", "BG13", "E00", "FB"      ← color individual
  //   "12 Color Set", "Set Manga"     ← set / kit (saltamos)
  //   "Sketch B00"                    ← prefijo redundante
  const codeMap: Record<string, { variantId: number; description: string; sku: string }> = {};
  const setEntries: typeof all = [];
  const unparsed: typeof all = [];

  for (const v of all) {
    const desc = (v.description || '').trim();
    // Strip "Sketch " prefix if present
    const clean = desc.replace(/^Sketch\s+/i, '').trim();

    // Pattern 1: letras + dígitos opcionales (B00, BG13, FY)
    let m = clean.match(/^([A-Z]{1,3}\d{0,4}[A-Z]?)$/i);
    if (m) {
      codeMap[m[1].toUpperCase()] = { variantId: v.id, description: desc, sku: v.code };
      continue;
    }
    // Pattern 2: fluor con paréntesis — "FRV (FRV1)", "FG (FYG2)"
    //   → tomá el primer token como código
    m = clean.match(/^([A-Z]{1,4})\s*\([A-Z0-9]+\)$/i);
    if (m) {
      codeMap[m[1].toUpperCase()] = { variantId: v.id, description: desc, sku: v.code };
      continue;
    }
    // Pattern 3: solo dígitos (0, 100, 110)
    m = clean.match(/^(\d{1,4})$/);
    if (m) {
      codeMap[m[1]] = { variantId: v.id, description: desc, sku: v.code };
      continue;
    }
    // Set / kit
    if (/set|kit|color\b|manga|trio|fusion|portrait|airy|vibrant|pc/i.test(clean)) {
      setEntries.push(v);
      continue;
    }
    unparsed.push(v);
  }

  return NextResponse.json(
    {
      product_id: Number(productId),
      total_variants: all.length,
      pages_fetched: pages,
      took_ms: Date.now() - start,
      colors_mapped: Object.keys(codeMap).length,
      sets_count: setEntries.length,
      unparsed_count: unparsed.length,
      colors_map: codeMap,
      sets: setEntries,
      unparsed: unparsed,
    },
    { headers: { 'cache-control': 'no-store' } },
  );
}
