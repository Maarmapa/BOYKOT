// POST /api/admin/credits/adjust
// Body: { email, name?, amount_clp, type, note?, reference? }

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { applyCreditsTransaction } from '@/lib/credits';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  email?: string;
  name?: string;
  amount_clp?: number;
  type?: 'topup' | 'purchase' | 'bonus' | 'refund' | 'adjust';
  reference?: string;
  note?: string;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  if (!body.email || !body.amount_clp || !body.type) {
    return NextResponse.json(
      { error: 'email, amount_clp, type required' },
      { status: 400 },
    );
  }
  const amount = Math.trunc(body.amount_clp);
  if (!Number.isFinite(amount) || amount === 0) {
    return NextResponse.json({ error: 'amount_clp must be non-zero integer' }, { status: 400 });
  }

  try {
    const result = await applyCreditsTransaction({
      email: body.email,
      amountClp: amount,
      type: body.type,
      reference: body.reference,
      note: body.note,
      createdBy: 'admin',
    });

    // Update name si vino
    if (body.name) {
      await supabaseAdmin()
        .from('boykot_credits_accounts')
        .update({ customer_name: body.name })
        .eq('id', result.accountId);
    }

    return NextResponse.json({
      ok: true,
      account_id: result.accountId,
      new_balance: result.newBalance,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
