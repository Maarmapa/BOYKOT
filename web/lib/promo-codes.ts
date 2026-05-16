// Promo codes helpers.

import 'server-only';
import { supabaseAdmin } from './supabase';

export type DiscountType = 'percent' | 'fixed' | 'free_shipping';

export interface PromoCode {
  id: number;
  code: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  min_subtotal_clp: number | null;
  max_uses: number | null;
  max_uses_per_customer: number | null;
  valid_from: string | null;
  valid_until: string | null;
  enabled: boolean;
  uses_count: number;
}

export interface PromoApplyResult {
  valid: boolean;
  promo?: PromoCode;
  discount_clp?: number;
  reason?: string;
}

export async function validatePromoCode(
  code: string,
  subtotalClp: number,
  email?: string,
): Promise<PromoApplyResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return { valid: false, reason: 'empty_code' };

  const { data } = await supabaseAdmin()
    .from('promo_codes')
    .select('*')
    .eq('code', cleanCode)
    .eq('enabled', true)
    .maybeSingle();
  if (!data) return { valid: false, reason: 'not_found' };

  const promo = data as PromoCode;
  const now = new Date();

  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return { valid: false, reason: 'not_yet_valid' };
  }
  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return { valid: false, reason: 'expired' };
  }
  if (promo.max_uses && promo.uses_count >= promo.max_uses) {
    return { valid: false, reason: 'max_uses_reached' };
  }
  if (promo.min_subtotal_clp && subtotalClp < promo.min_subtotal_clp) {
    return { valid: false, reason: 'subtotal_below_minimum' };
  }
  if (email && promo.max_uses_per_customer) {
    const { count } = await supabaseAdmin()
      .from('promo_code_applications')
      .select('id', { count: 'exact', head: true })
      .eq('promo_id', promo.id)
      .eq('customer_email', email.toLowerCase());
    if ((count ?? 0) >= promo.max_uses_per_customer) {
      return { valid: false, reason: 'customer_max_uses_reached' };
    }
  }

  let discount = 0;
  switch (promo.discount_type) {
    case 'percent':
      discount = Math.round(subtotalClp * (promo.discount_value / 100));
      break;
    case 'fixed':
      discount = Math.min(promo.discount_value, subtotalClp);
      break;
    case 'free_shipping':
      discount = 0; // se aplica al shipping, no al subtotal
      break;
  }

  return { valid: true, promo, discount_clp: discount };
}

export async function applyPromoCode(args: {
  promoId: number;
  orderShortId: string;
  email: string;
  discountClp: number;
}): Promise<void> {
  await supabaseAdmin().from('promo_code_applications').insert({
    promo_id: args.promoId,
    order_short_id: args.orderShortId,
    customer_email: args.email.toLowerCase(),
    discount_amount_clp: args.discountClp,
  });
  await supabaseAdmin().rpc('exec_sql' as never).then(() => {}); // noop, use raw below
  // Increment uses_count
  const { data: current } = await supabaseAdmin()
    .from('promo_codes')
    .select('uses_count')
    .eq('id', args.promoId)
    .single();
  await supabaseAdmin()
    .from('promo_codes')
    .update({ uses_count: ((current as { uses_count: number })?.uses_count ?? 0) + 1 })
    .eq('id', args.promoId);
}
