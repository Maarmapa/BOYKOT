// Abandoned-cart sweeper. Run hourly via Vercel Cron (see vercel.json).
//
// Logic:
//   1. Mark active carts with no activity for >24h as 'abandoned'.
//   2. Expire reservations past their TTL (already done by query filter, but we hard-delete).
//   3. Send 1h / 24h / 72h emails to carts in 'abandoned' state that have an email
//      and haven't received that variant yet.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendAbandonedCartEmail } from '@/lib/email';
import type { Cart } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Vercel Cron sets Authorization: Bearer <CRON_SECRET>.
  if (process.env.CRON_SECRET) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
  }

  const sb = supabaseAdmin();
  const now = new Date();

  // 1. Mark stale active carts as abandoned.
  const staleCutoff = new Date(now.getTime() - 24 * 60 * 60_000).toISOString();
  const { data: justAbandoned } = await sb
    .from('carts')
    .update({ status: 'abandoned', abandoned_at: now.toISOString() })
    .eq('status', 'active')
    .lt('last_activity_at', staleCutoff)
    .gt('subtotal_clp', 0)
    .select('id');

  // 2. Hard-delete expired reservations (active filter would skip them, but cleanup keeps the table tight).
  await sb.from('stock_reservations').delete().lt('expires_at', now.toISOString());

  // 3. Send emails. Cart must be abandoned + have email + not yet emailed for that variant.
  const { data: targets } = await sb
    .from('carts')
    .select('*')
    .eq('status', 'abandoned')
    .not('email', 'is', null);

  const sent: Array<{ cart_id: string; variant: string; resend_id: string | null }> = [];

  for (const c of (targets ?? []) as Cart[]) {
    const ageMin = (now.getTime() - new Date(c.abandoned_at || c.last_activity_at).getTime()) / 60_000;
    const variant = pickVariant(ageMin);
    if (!variant) continue;

    const { data: already } = await sb
      .from('abandoned_cart_emails')
      .select('id')
      .eq('cart_id', c.id)
      .eq('email_type', variant)
      .maybeSingle();
    if (already) continue;

    try {
      const resendId = await sendAbandonedCartEmail(c, variant);
      await sb.from('abandoned_cart_emails').insert({
        cart_id: c.id,
        email_type: variant,
        resend_id: resendId,
      });
      sent.push({ cart_id: c.id, variant, resend_id: resendId });
    } catch (err) {
      console.error(`[abandoned-carts] cart=${c.id} variant=${variant} failed:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    just_abandoned: justAbandoned?.length ?? 0,
    emails_sent: sent.length,
    details: sent,
  });
}

// 1h email between 1h-23h after abandonment, 24h between 24h-71h, 72h after that.
function pickVariant(ageMin: number): '1h' | '24h' | '72h' | null {
  if (ageMin < 60) return null;
  if (ageMin < 24 * 60) return '1h';
  if (ageMin < 72 * 60) return '24h';
  if (ageMin < 7 * 24 * 60) return '72h';
  return null;
}
