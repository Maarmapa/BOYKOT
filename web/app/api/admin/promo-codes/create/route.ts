// POST /api/admin/promo-codes/create
// Body: { code, discount_type, discount_value, min_subtotal_clp?, max_uses?, valid_until? }

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  code?: string;
  description?: string;
  discount_type?: 'percent' | 'fixed' | 'free_shipping';
  discount_value?: number;
  min_subtotal_clp?: number | null;
  max_uses?: number | null;
  max_uses_per_customer?: number | null;
  valid_until?: string | null;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const code = (body.code || '').trim().toUpperCase();
  if (!code || code.length < 3) {
    return NextResponse.json({ error: 'code_too_short' }, { status: 400 });
  }
  if (!body.discount_type || !['percent', 'fixed', 'free_shipping'].includes(body.discount_type)) {
    return NextResponse.json({ error: 'invalid_discount_type' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('promo_codes')
      .insert({
        code,
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: Math.max(0, Math.floor(body.discount_value || 0)),
        min_subtotal_clp: body.min_subtotal_clp,
        max_uses: body.max_uses,
        max_uses_per_customer: body.max_uses_per_customer ?? 1,
        valid_until: body.valid_until || null,
        created_by: 'admin',
      })
      .select()
      .single();
    if (error) {
      if (/duplicate/i.test(error.message)) {
        return NextResponse.json({ error: 'code_already_exists' }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json({ error: 'create_failed', message: (e as Error).message }, { status: 500 });
  }
}
