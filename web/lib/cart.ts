// Server-only cart + soft reservation operations.
// "Soft" = we only insert rows into supabase.stock_reservations with TTL 15min,
// we never call BSale until checkout confirmation.

import 'server-only';
import { supabaseAdmin } from './supabase';
import type { Cart, CartItem } from './types';

const RESERVATION_TTL_MIN = 15;

export async function getCart(cartId: string): Promise<Cart | null> {
  const { data } = await supabaseAdmin()
    .from('carts')
    .select('*')
    .eq('id', cartId)
    .single();
  return (data as Cart) || null;
}

export async function getActiveCartForUser(userId: string): Promise<Cart | null> {
  const { data } = await supabaseAdmin()
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  return (data as Cart) || null;
}

export async function getActiveCartForSession(sessionId: string): Promise<Cart | null> {
  const { data } = await supabaseAdmin()
    .from('carts')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'active')
    .maybeSingle();
  return (data as Cart) || null;
}

export async function createCart(opts: { userId?: string; sessionId?: string }): Promise<Cart> {
  const { data, error } = await supabaseAdmin()
    .from('carts')
    .insert({
      user_id: opts.userId ?? null,
      session_id: opts.sessionId ?? null,
      items: [],
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Cart;
}

// Available stock for a variant = BSale stock - active reservations.
// `bsaleStock` is fetched from the BSale API by the caller (see lib/stock.ts);
// we just subtract the live reservation count.
export async function reservedFor(variantId: number): Promise<number> {
  const { data } = await supabaseAdmin()
    .from('reserved_stock')
    .select('reserved')
    .eq('variant_id', variantId)
    .maybeSingle();
  return (data?.reserved as number) || 0;
}

export async function addToCart(cartId: string, item: CartItem): Promise<Cart> {
  const cart = await getCart(cartId);
  if (!cart) throw new Error(`cart ${cartId} not found`);

  const items = [...cart.items];
  const existing = items.findIndex(i => i.variant_id === item.variant_id);
  if (existing >= 0) {
    items[existing] = { ...items[existing], qty: items[existing].qty + item.qty };
  } else {
    items.push(item);
  }

  const subtotal = items.reduce((s, i) => s + i.unit_price_clp * i.qty, 0);

  const { data, error } = await supabaseAdmin()
    .from('carts')
    .update({
      items,
      subtotal_clp: subtotal,
      total_clp: subtotal + cart.shipping_clp,
    })
    .eq('id', cartId)
    .select('*')
    .single();
  if (error) throw error;

  await reserve(cartId, item.variant_id, item.qty);
  return data as Cart;
}

// Set the absolute quantity for one item (used by the +/- buttons).
// qty=0 removes the item from the cart and releases its reservation.
export async function setItemQty(
  cartId: string,
  variantId: number,
  qty: number,
  itemTemplate: Omit<CartItem, 'qty'>,
): Promise<Cart> {
  const cart = await getCart(cartId);
  if (!cart) throw new Error(`cart ${cartId} not found`);

  // Defensive: cart.items may be undefined / null / string-encoded depending on
  // how the supabase-js driver returned the jsonb column. Coerce to a real array.
  let items: CartItem[];
  if (Array.isArray(cart.items)) {
    items = [...cart.items];
  } else if (typeof cart.items === 'string') {
    try { items = JSON.parse(cart.items as unknown as string) as CartItem[]; }
    catch { items = []; }
  } else {
    items = [];
  }

  const idx = items.findIndex(i => i.variant_id === variantId);

  if (qty <= 0) {
    if (idx >= 0) items.splice(idx, 1);
  } else if (idx >= 0) {
    items[idx] = { ...items[idx], qty };
  } else {
    items.push({ ...itemTemplate, qty });
  }

  console.log(
    `[cart.setItemQty] cart=${cartId} variant=${variantId} qty=${qty} ` +
    `prev_items=${(cart.items?.length ?? 0)} new_items=${items.length}`
  );

  const subtotal = items.reduce((s, i) => s + i.unit_price_clp * i.qty, 0);

  const { data, error } = await supabaseAdmin()
    .from('carts')
    .update({
      items,
      subtotal_clp: subtotal,
      total_clp: subtotal + cart.shipping_clp,
    })
    .eq('id', cartId)
    .select('*')
    .single();
  if (error) throw error;

  // Replace reservation for this variant rather than stacking.
  await supabaseAdmin()
    .from('stock_reservations')
    .delete()
    .eq('cart_id', cartId)
    .eq('variant_id', variantId);
  if (qty > 0) await reserve(cartId, variantId, qty);

  return data as Cart;
}

// Convenience: load active cart for the current session, creating it on demand.
export async function ensureSessionCart(sessionId: string): Promise<Cart> {
  const existing = await getActiveCartForSession(sessionId);
  if (existing) return existing;
  return createCart({ sessionId });
}

export async function reserve(cartId: string, variantId: number, quantity: number): Promise<void> {
  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MIN * 60_000).toISOString();
  await supabaseAdmin().from('stock_reservations').insert({
    cart_id: cartId,
    variant_id: variantId,
    quantity,
    expires_at: expiresAt,
  });
}

export async function releaseReservations(cartId: string): Promise<void> {
  await supabaseAdmin().from('stock_reservations').delete().eq('cart_id', cartId);
}

// Called when checkout succeeds: BSale will descend stock via the document POST,
// so we drop our soft holds and mark the cart converted.
export async function markConverted(cartId: string, bsaleDocumentId: number): Promise<void> {
  await releaseReservations(cartId);
  await supabaseAdmin()
    .from('carts')
    .update({
      status: 'converted',
      converted_at: new Date().toISOString(),
      bsale_document_id: bsaleDocumentId,
    })
    .eq('id', cartId);
}
