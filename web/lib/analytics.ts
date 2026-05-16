'use client';

// Custom analytics events para Vercel Analytics.
// Uso: track('add_to_cart', { product_slug, qty, price_clp })
//
// Vercel Analytics tracks pageviews + Web Vitals automaticamente.
// Custom events nos dejan trackear conversion funnel.

import { track as vercelTrack } from '@vercel/analytics';

type EventName =
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_product'
  | 'view_brand'
  | 'view_category'
  | 'search'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'begin_checkout'
  | 'complete_checkout'
  | 'view_quote'
  | 'create_quote'
  | 'newsletter_signup'
  | 'back_in_stock_signup'
  | 'whatsapp_click'
  | 'dm_helper_search'  // /admin/buscar
  | 'bot_message';

interface EventProps {
  [key: string]: string | number | boolean | null | undefined;
}

export function track(event: EventName, props?: EventProps): void {
  // Filter out null/undefined values — Vercel Analytics no permite
  const clean: Record<string, string | number | boolean> = {};
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v != null) clean[k] = v;
    }
  }
  try {
    vercelTrack(event, clean);
  } catch {
    // Vercel Analytics blocked by ad-blocker / not loaded — ignore
  }
}

// Helpers comunes para eventos de e-commerce
export const ecommerce = {
  viewProduct: (slug: string, brand?: string | null, price?: number | null) =>
    track('view_product', { slug, brand: brand ?? undefined, price_clp: price ?? undefined }),

  addToCart: (slug: string, qty: number, price?: number | null) =>
    track('add_to_cart', { slug, qty, price_clp: price ?? undefined }),

  removeFromCart: (slug: string) =>
    track('remove_from_cart', { slug }),

  search: (query: string, resultsCount: number) =>
    track('search', { query: query.slice(0, 100), results: resultsCount }),

  whatsappClick: (from: string) =>
    track('whatsapp_click', { from }),

  beginCheckout: (itemCount: number, total: number) =>
    track('begin_checkout', { items: itemCount, total_clp: total }),
};
