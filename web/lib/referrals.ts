// Referral codes — give X get X.

import 'server-only';
import { supabaseAdmin } from './supabase';

export interface Referral {
  id: number;
  referrer_email: string;
  referrer_name: string | null;
  code: string;
  total_uses: number;
  total_earned_clp: number;
}

function generateCode(email: string): string {
  // Toma primeros 4 chars del email + 4 random
  const prefix = email.replace(/[^a-z]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

export async function getOrCreateReferral(email: string, name?: string): Promise<Referral> {
  const cleanEmail = email.toLowerCase().trim();

  // Try existing
  const { data: existing } = await supabaseAdmin()
    .from('referrals')
    .select('*')
    .eq('referrer_email', cleanEmail)
    .maybeSingle();
  if (existing) return existing as Referral;

  // Create new with retry on collision
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode(cleanEmail);
    const { data, error } = await supabaseAdmin()
      .from('referrals')
      .insert({
        referrer_email: cleanEmail,
        referrer_name: name || null,
        code,
      })
      .select()
      .single();
    if (!error) return data as Referral;
    if (!/duplicate/i.test(error.message)) throw error;
  }
  throw new Error('Failed to generate unique referral code');
}

export async function validateReferralCode(code: string, usedByEmail: string): Promise<{
  valid: boolean;
  referral?: Referral;
  reason?: string;
}> {
  const clean = code.trim().toUpperCase();
  if (!clean) return { valid: false, reason: 'empty' };

  const { data } = await supabaseAdmin()
    .from('referrals')
    .select('*')
    .eq('code', clean)
    .maybeSingle();
  if (!data) return { valid: false, reason: 'not_found' };

  const ref = data as Referral;

  // No te podés referir a vos mismo
  if (ref.referrer_email === usedByEmail.toLowerCase()) {
    return { valid: false, reason: 'self_referral' };
  }

  // No se puede usar el mismo codigo dos veces por el mismo cliente
  const { count } = await supabaseAdmin()
    .from('referral_uses')
    .select('id', { count: 'exact', head: true })
    .eq('referral_id', ref.id)
    .eq('referred_email', usedByEmail.toLowerCase());
  if ((count ?? 0) > 0) {
    return { valid: false, reason: 'already_used' };
  }

  return { valid: true, referral: ref };
}

export async function applyReferralUse(args: {
  referralId: number;
  referredEmail: string;
  orderShortId: string;
  referredBonusClp: number;
  referrerBonusClp: number;
}): Promise<void> {
  await supabaseAdmin().from('referral_uses').insert({
    referral_id: args.referralId,
    referred_email: args.referredEmail.toLowerCase(),
    order_short_id: args.orderShortId,
    referred_bonus_clp: args.referredBonusClp,
    referrer_bonus_clp: args.referrerBonusClp,
  });

  // Bump stats en referrals
  const { data: current } = await supabaseAdmin()
    .from('referrals')
    .select('total_uses, total_earned_clp')
    .eq('id', args.referralId)
    .single();
  await supabaseAdmin()
    .from('referrals')
    .update({
      total_uses: ((current as { total_uses: number } | null)?.total_uses ?? 0) + 1,
      total_earned_clp: ((current as { total_earned_clp: number } | null)?.total_earned_clp ?? 0) + args.referrerBonusClp,
    })
    .eq('id', args.referralId);
}
