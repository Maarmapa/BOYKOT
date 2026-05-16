// POST /api/admin/seed-fts
//
// Pobla la tabla public.products_fts desde data/products.json + wc-products.json.
// Server-side, NO requiere envs locales — usa SUPABASE_SERVICE_ROLE_KEY de Vercel.
//
// Auth: admin cookie (HMAC).
//
// Idempotente: usa ON CONFLICT DO UPDATE, re-corre sin duplicados.
// Re-correr cuando products.json o wc-products.json cambien.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import productsData from '@/data/products.json';
import wcData from '@/data/wp-archive/wc-products.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // larger than default for the bulk upsert

interface SlimProduct {
  slug: string;
  name: string;
  sku: string | null;
  price: number | null;
  availability: string;
  short: string;
  image: string | null;
  brand: string | null;
  cat: string | null;
}

interface WcProduct {
  slug: string;
  categories?: Array<{ name: string }>;
}

const PRODUCTS = productsData as unknown as Record<string, SlimProduct>;
const WC = wcData as unknown as WcProduct[];

const WC_BY_SLUG: Record<string, WcProduct> = {};
for (const p of WC) WC_BY_SLUG[p.slug] = p;

async function handler() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const slugs = Object.keys(PRODUCTS);
  const rows = slugs.map(slug => {
    const p = PRODUCTS[slug];
    const wc = WC_BY_SLUG[slug];
    const cats = wc?.categories?.map(c => c.name).join(', ') || p.cat || '';
    return {
      slug,
      name: (p.name || slug).slice(0, 300),
      sku: p.sku,
      brand: p.brand,
      category: cats.slice(0, 200),
      short: (p.short || '').slice(0, 500),
      price_clp: p.price,
      image: p.image,
      availability: p.availability || 'InStock',
    };
  });

  // Bulk upsert en batches de 500
  const BATCH = 500;
  let inserted = 0;
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabaseAdmin()
      .from('products_fts')
      .upsert(batch, { onConflict: 'slug' });
    if (error) {
      errors.push(`batch ${i}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  // Count actual rows
  const { count } = await supabaseAdmin()
    .from('products_fts')
    .select('slug', { count: 'exact', head: true });

  return NextResponse.json({
    ok: errors.length === 0,
    inserted,
    total_in_table: count,
    errors: errors.length > 0 ? errors : undefined,
  });
}

export async function POST() { return handler(); }
export async function GET() { return handler(); }  // GET por conveniencia (visita en browser)
