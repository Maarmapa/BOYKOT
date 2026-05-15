// POST /api/admin/revalidate-stock
//
// Invalida todos los caches de stock BSale. Útil después de cambiar la
// pipeline (ej. quitar OFFICE_ID filter) para forzar refresh sin esperar
// la TTL de 1 hora.

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Operación idempotente — public OK (solo invalida cache local).
async function handler() {
  revalidateTag('stock:all');
  return NextResponse.json({
    ok: true,
    invalidated: ['stock:all'],
    note: 'Próximas requests van a refetcher BSale desde cero.',
  });
}

export async function POST(_req: NextRequest) { return handler(); }
export async function GET(_req: NextRequest) { return handler(); }
