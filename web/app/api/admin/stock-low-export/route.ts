// GET /api/admin/stock-low-export?threshold=5
// Devuelve CSV de variantes con stock bajo. Util para reorden manual.

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return new NextResponse('unauthorized', { status: 401 });
  }
  const threshold = parseInt(req.nextUrl.searchParams.get('threshold') || '5', 10);

  const { data } = await supabaseAdmin()
    .from('bsale_stock_snapshot')
    .select('variant_id, stock, updated_at')
    .lte('stock', threshold)
    .order('stock', { ascending: true });

  const rows = (data ?? []) as Array<{ variant_id: number; stock: number; updated_at: string }>;

  // Build CSV
  const header = 'variant_id,stock,updated_at';
  const csvRows = rows.map(r => `${r.variant_id},${r.stock},${r.updated_at}`);
  const csv = [header, ...csvRows].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="boykot-stock-low-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
