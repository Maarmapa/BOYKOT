// Product reviews helpers server-side.

import 'server-only';
import { supabaseAdmin } from './supabase';

export interface Review {
  id: number;
  product_slug: string;
  customer_email: string;
  customer_name: string | null;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string | null;
  verified_purchase: boolean;
  order_short_id: string | null;
  status: 'pending' | 'published' | 'rejected';
  helpful_count: number;
  created_at: string;
}

export async function getReviewsForProduct(slug: string, limit = 20): Promise<Review[]> {
  const { data } = await supabaseAdmin()
    .from('product_reviews')
    .select('*')
    .eq('product_slug', slug)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Review[];
}

export async function getRatingSummary(slug: string): Promise<{
  count: number;
  average: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
} | null> {
  const { data } = await supabaseAdmin()
    .from('product_reviews')
    .select('rating')
    .eq('product_slug', slug)
    .eq('status', 'published');
  if (!data || data.length === 0) return null;
  const ratings = (data as { rating: number }[]).map(r => r.rating);
  const sum = ratings.reduce((s, r) => s + r, 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
  for (const r of ratings) {
    if (r >= 1 && r <= 5) distribution[r as 1 | 2 | 3 | 4 | 5]++;
  }
  return {
    count: ratings.length,
    average: sum / ratings.length,
    distribution,
  };
}

export async function createReview(input: {
  product_slug: string;
  customer_email: string;
  customer_name?: string;
  rating: number;
  title?: string;
  body?: string;
  client_ip?: string;
}): Promise<{ created: boolean }> {
  const rating = Math.max(1, Math.min(5, Math.floor(input.rating)));

  // Check verified purchase
  const { data: order } = await supabaseAdmin()
    .from('pending_orders')
    .select('short_id, items, status, payment_status')
    .eq('customer_email', input.customer_email.toLowerCase())
    .or('status.eq.completed,payment_status.eq.paid')
    .limit(1)
    .maybeSingle();

  const verified = !!order;
  const orderRef = order ? (order as { short_id: string }).short_id : null;

  const { error } = await supabaseAdmin()
    .from('product_reviews')
    .insert({
      product_slug: input.product_slug,
      customer_email: input.customer_email.toLowerCase(),
      customer_name: input.customer_name || null,
      rating,
      title: input.title || null,
      body: input.body || null,
      verified_purchase: verified,
      order_short_id: orderRef,
      client_ip: input.client_ip || null,
    });

  if (error && /duplicate/i.test(error.message)) {
    return { created: false }; // ya habia reviewed este producto
  }
  if (error) throw error;
  return { created: true };
}
