// POST /api/admin/revalidate-stock
//
// Invalida todos los caches de stock BSale. Útil después de cambiar la
// pipeline (ej. quitar OFFICE_ID filter) para forzar refresh sin esperar
// la TTL de 1 hora.

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isAdmin } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  revalidateTag('stock:all');
  return NextResponse.json({
    ok: true,
    invalidated: ['stock:all'],
    note: 'Próximas requests van a refetcher BSale desde cero.',
  });
}

// GET también (idempotent, útil para curl quick)
export async function GET(req: NextRequest) {
  return POST(req);
}
