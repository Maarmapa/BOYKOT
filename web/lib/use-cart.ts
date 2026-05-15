'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Cart, CartItem } from './types';

type SetItemArgs = Omit<CartItem, 'qty'> & { qty: number };

interface CartState {
  cart: Cart | null;
  loading: boolean;
  /** Quick lookup: { variantId -> qty } for cheap re-render of the grid. */
  qtys: Record<number, number>;
  setItem: (args: SetItemArgs) => Promise<void>;
  refresh: () => Promise<void>;
}

const buildQtys = (cart: Cart | null): Record<number, number> => {
  const out: Record<number, number> = {};
  for (const item of cart?.items ?? []) out[item.variant_id] = item.qty;
  return out;
};

export function useCart(): CartState {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [qtys, setQtys] = useState<Record<number, number>>({});

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      const json = (await res.json()) as { cart: Cart | null };
      setCart(json.cart);
      setQtys(buildQtys(json.cart));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const setItem = useCallback(async (args: SetItemArgs) => {
    // Optimistic update before the round-trip.
    setQtys(prev => {
      const next = { ...prev };
      if (args.qty <= 0) delete next[args.variant_id];
      else next[args.variant_id] = args.qty;
      return next;
    });

    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      // Roll back on failure — re-fetch authoritative state.
      await refresh();
      return;
    }
    const json = (await res.json()) as { cart: Cart };
    setCart(json.cart);
    setQtys(buildQtys(json.cart));
  }, [refresh]);

  return { cart, loading, qtys, setItem, refresh };
}
