'use client';

import { useCallback, useEffect, useState } from 'react';

export interface WishlistItem {
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  brand: string | null;
  addedAt: string;
}

const SID_KEY = 'boykot_sid';

function sidHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const sid = window.localStorage.getItem(SID_KEY);
  return sid ? { 'x-boykot-sid': sid } : {};
}

function persistSidFrom(res: Response, json?: { session_id?: string | null }) {
  if (typeof window === 'undefined') return;
  const sid = res.headers.get('x-boykot-sid') || json?.session_id || null;
  if (sid) window.localStorage.setItem(SID_KEY, sid);
}

export interface AddArgs {
  slug: string;
  name: string;
  image?: string | null;
  price?: number | null;
  brand?: string | null;
}

export interface WishlistState {
  items: WishlistItem[];
  slugs: Set<string>;
  loading: boolean;
  add: (args: AddArgs) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  toggle: (args: AddArgs) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWishlist(): WishlistState {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/wishlist', {
        credentials: 'include',
        headers: sidHeader(),
      });
      const data = (await res.json()) as { items: WishlistItem[]; session_id?: string };
      persistSidFrom(res, data);
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const add = useCallback(async (args: AddArgs) => {
    // Optimistic
    setItems(prev =>
      prev.some(i => i.slug === args.slug)
        ? prev
        : [
            { slug: args.slug, name: args.name, image: args.image ?? null, price: args.price ?? null, brand: args.brand ?? null, addedAt: new Date().toISOString() },
            ...prev,
          ],
    );
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', ...sidHeader() },
      body: JSON.stringify(args),
    });
    const data = (await res.json()) as { items: WishlistItem[]; session_id?: string };
    persistSidFrom(res, data);
    setItems(data.items ?? []);
  }, []);

  const remove = useCallback(async (slug: string) => {
    setItems(prev => prev.filter(i => i.slug !== slug));
    const res = await fetch(`/api/wishlist?slug=${encodeURIComponent(slug)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: sidHeader(),
    });
    const data = (await res.json()) as { items: WishlistItem[]; session_id?: string };
    persistSidFrom(res, data);
    setItems(data.items ?? []);
  }, []);

  const toggle = useCallback(async (args: AddArgs) => {
    const present = items.some(i => i.slug === args.slug);
    if (present) await remove(args.slug);
    else await add(args);
  }, [items, add, remove]);

  const slugs = new Set(items.map(i => i.slug));
  return { items, slugs, loading, add, remove, toggle, refresh };
}
