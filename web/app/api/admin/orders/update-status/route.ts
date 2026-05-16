// POST /api/admin/orders/update-status
// Body: { short_id, status }
// Cambia status de una orden + log audit

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VALID_STATUS = ['pending', 'contacted', 'confirmed', 'shipped', 'completed', 'cancelled'];

interface Body {
  short_id?: string;
  status?: string;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.short_id || !body.status) {
    return NextResponse.json({ error: 'short_id_and_status_required' }, { status: 400 });
  }
  if (!VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ error: 'invalid_status', valid: VALID_STATUS }, { status: 400 });
  }

  // Get previous status for audit
  const { data: before } = await supabaseAdmin()
    .from('pending_orders')
    .select('status')
    .eq('short_id', body.short_id)
    .maybeSingle();

  const { error } = await supabaseAdmin()
    .from('pending_orders')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('short_id', body.short_id);

  if (error) {
    return NextResponse.json({ error: 'update_failed', message: error.message }, { status: 500 });
  }

  await audit({
    actor: 'admin',
    action: 'order_status_change',
    entity_type: 'pending_orders',
    entity_id: body.short_id,
    details: {
      from: (before as { status?: string } | null)?.status || 'unknown',
      to: body.status,
    },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() || undefined,
  });

  return NextResponse.json({ ok: true, short_id: body.short_id, status: body.status });
}
