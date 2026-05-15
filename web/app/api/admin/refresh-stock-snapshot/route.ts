// GET/POST /api/admin/refresh-stock-snapshot
//
// Refresca el snapshot Supabase con stock live de BSale para TODOS los
// variantIds que tenemos en bsale-variants-all.json. Tarda ~30-60s con
// 2,850 variants (paralelo en chunks de 12).
//
// Se puede llamar via:
//   - Cron Vercel (configurado en vercel.json)
//   - Webhook BSale (en cambios de stock)
//   - Manual desde /admin/sync
//
// Sin auth gate — operación idempotente que solo afecta la cache local.

import { NextRequest, NextResponse } from 'next/server';
import { refreshSnapshot } from '@/lib/stock-snapshot';
import { revalidateTag } from 'next/cache';
import bsaleVariants from '@/data/bsale-variants-all.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface VariantsJson {
  by_brand: Record<string, Record<string, number>>;
}

async function handler() {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'BSALE_ACCESS_TOKEN missing' }, { status: 500 });
  }

  // Coleccionar todos los variantIds únicos de bsale-variants-all.json
  const data = bsaleVariants as VariantsJson;
  const seen = new Set<number>();
  const variants: { variantId: number }[] = [];
  for (const slugMap of Object.values(data.by_brand)) {
    for (const vid of Object.values(slugMap)) {
      if (typeof vid === 'number' && !seen.has(vid)) {
        seen.add(vid);
        variants.push({ variantId: vid });
      }
    }
  }

  const stats = await refreshSnapshot(variants);

  // Invalidar caches de stock para que las brand pages refetchen
  revalidateTag('stock:all', 'max');

  return NextResponse.json({
    ok: true,
    ...stats,
  }, { headers: { 'cache-control': 'no-store' } });
}

export async function GET(_req: NextRequest) { return handler(); }
export async function POST(_req: NextRequest) { return handler(); }
