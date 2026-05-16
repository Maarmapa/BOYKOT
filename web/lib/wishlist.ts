// Server-side wishlist helpers. Lectura/escritura contra Supabase
// tabla public.wishlists. Por ahora trabajamos solo con session_id
// (anonymous) ya que no tenemos Supabase Auth wired.

import 'server-only';
import { supabaseAdmin } from './supabase';

export interface WishlistRow {
  id: number;
  session_id: string | null;
  user_id: string | null;
  product_slug: string;
  product_name: string | null;
  product_image: string | null;
  product_price_clp: number | null;
  product_brand: string | null;
  created_at: string;
}

export interface WishlistItem {
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  brand: string | null;
  addedAt: string;
}

export async function listWishlist(sessionId: string): Promise<WishlistItem[]> {
  const { data } = await supabaseAdmin()
    .from('wishlists')
    .select('product_slug, product_name, product_image, product_price_clp, product_brand, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
  return (data ?? []).map(r => ({
    slug: r.product_slug,
    name: r.product_name ?? r.product_slug,
    image: r.product_image,
    price: r.product_price_clp,
    brand: r.product_brand,
    addedAt: r.created_at,
  }));
}

export async function addToWishlist(
  sessionId: string,
  product: { slug: string; name: string; image?: string | null; price?: number | null; brand?: string | null },
): Promise<{ added: boolean }> {
  const { error } = await supabaseAdmin()
    .from('wishlists')
    .insert({
      session_id: sessionId,
      product_slug: product.slug,
      product_name: product.name,
      product_image: product.image ?? null,
      product_price_clp: product.price ?? null,
      product_brand: product.brand ?? null,
    });
  // unique violation = ya estaba en la wishlist → tratar como idempotente
  if (error && /duplicate/i.test(error.message)) return { added: false };
  if (error) throw error;
  return { added: true };
}

export async function removeFromWishlist(sessionId: string, productSlug: string): Promise<void> {
  await supabaseAdmin()
    .from('wishlists')
    .delete()
    .eq('session_id', sessionId)
    .eq('product_slug', productSlug);
}

export async function isInWishlist(sessionId: string, productSlug: string): Promise<boolean> {
  const { data } = await supabaseAdmin()
    .from('wishlists')
    .select('id')
    .eq('session_id', sessionId)
    .eq('product_slug', productSlug)
    .limit(1);
  return Boolean(data && data.length > 0);
}

export async function wishlistCount(sessionId: string): Promise<number> {
  const { count } = await supabaseAdmin()
    .from('wishlists')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId);
  return count ?? 0;
}
