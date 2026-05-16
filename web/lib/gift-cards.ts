// Gift cards: regalo de saldo Boykot.

import 'server-only';
import { supabaseAdmin } from './supabase';
import { applyCreditsTransaction } from './credits';
import crypto from 'node:crypto';

export interface GiftCard {
  id: number;
  code: string;
  amount_clp: number;
  buyer_email: string;
  buyer_name: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  message: string | null;
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  redeemed_by_email: string | null;
  redeemed_at: string | null;
  expires_at: string;
  created_at: string;
}

function generateCode(): string {
  // GC-XXXX-XXXX-XXXX
  const hex = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `GC-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

export async function createGiftCard(input: {
  amount_clp: number;
  buyer_email: string;
  buyer_name?: string;
  buyer_order_short_id?: string;
  recipient_email?: string;
  recipient_name?: string;
  message?: string;
}): Promise<GiftCard> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    const { data, error } = await supabaseAdmin()
      .from('gift_cards')
      .insert({
        code,
        amount_clp: input.amount_clp,
        buyer_email: input.buyer_email.toLowerCase(),
        buyer_name: input.buyer_name || null,
        buyer_order_short_id: input.buyer_order_short_id || null,
        recipient_email: input.recipient_email?.toLowerCase() || null,
        recipient_name: input.recipient_name || null,
        message: input.message || null,
      })
      .select()
      .single();
    if (!error) return data as GiftCard;
    if (!/duplicate/i.test(error.message)) throw error;
  }
  throw new Error('Failed to generate unique gift card code');
}

export async function getGiftCard(code: string): Promise<GiftCard | null> {
  const clean = code.trim().toUpperCase();
  const { data } = await supabaseAdmin()
    .from('gift_cards')
    .select('*')
    .eq('code', clean)
    .maybeSingle();
  return data as GiftCard | null;
}

export async function redeemGiftCard(code: string, redeemedByEmail: string): Promise<{
  ok: boolean;
  amount_clp?: number;
  reason?: string;
}> {
  const gc = await getGiftCard(code);
  if (!gc) return { ok: false, reason: 'not_found' };
  if (gc.status !== 'active') return { ok: false, reason: `already_${gc.status}` };
  if (new Date(gc.expires_at) < new Date()) {
    await supabaseAdmin().from('gift_cards').update({ status: 'expired' }).eq('id', gc.id);
    return { ok: false, reason: 'expired' };
  }

  // Aplicar como bonus a Boykot Credits del redeemer
  await applyCreditsTransaction({
    email: redeemedByEmail,
    amountClp: gc.amount_clp,
    type: 'bonus',
    reference: gc.code,
    note: `Gift card de ${gc.buyer_name || gc.buyer_email}${gc.message ? ` — ${gc.message}` : ''}`,
    createdBy: 'gift-card-redeem',
  });

  // Marcar gift card como redeemed
  await supabaseAdmin()
    .from('gift_cards')
    .update({
      status: 'redeemed',
      redeemed_by_email: redeemedByEmail.toLowerCase(),
      redeemed_at: new Date().toISOString(),
    })
    .eq('id', gc.id);

  return { ok: true, amount_clp: gc.amount_clp };
}

export async function listGiftCardsForUser(email: string): Promise<{
  bought: GiftCard[];
  received: GiftCard[];
}> {
  const cleanEmail = email.toLowerCase();
  const [bought, received] = await Promise.all([
    supabaseAdmin()
      .from('gift_cards')
      .select('*')
      .eq('buyer_email', cleanEmail)
      .order('created_at', { ascending: false }),
    supabaseAdmin()
      .from('gift_cards')
      .select('*')
      .or(`recipient_email.eq.${cleanEmail},redeemed_by_email.eq.${cleanEmail}`)
      .order('created_at', { ascending: false }),
  ]);
  return {
    bought: (bought.data ?? []) as GiftCard[],
    received: (received.data ?? []) as GiftCard[],
  };
}
