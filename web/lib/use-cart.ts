'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Cart, CartItem } from './types';

type SetItemArgs = Omit<CartItem, 'qty'> & { qty: number };

interface CartState {
  cart: Cart | null;
  loading: boolean;
  /** Quick lookup: { variantId -> qty } for cheap re-render of the grid. */
  qtys: Record<number, number>;
  setItem: (args: SetItemArgs) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
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

  // Serialize POST /api/cart/items so that two fast clicks don't race the
  // server: each request reads cart, then writes. Without a queue, the
  // second request can read the cart BEFORE the first one wrote, losing
  // the first item.
  const inflight = useRef<Promise<unknown>>(Promise.resolve());

  const SID_KEY = 'boykot_sid';
  const sidHeader = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const sid = window.localStorage.getItem(SID_KEY);
    return sid ? { 'x-boykot-sid': sid } : {};
  };
  const persistSidFromResponse = (res: Response, json?: { session_id?: string | null }) => {
    if (typeof window === 'undefined') return;
    const sid = res.headers.get('x-boykot-sid') || json?.session_id || null;
    if (sid) window.localStorage.setItem(SID_KEY, sid);
  };

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', {
        credentials: 'include',
        headers: { ...sidHeader() },
      });
      const json = (await res.json()) as { cart: Cart | null; session_id?: string };
      persistSidFromResponse(res, json);
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

    // Chain this request after the previous one — preserves order.
    const run = async () => {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...sidHeader() },
          credentials: 'include',
          body: JSON.stringify(args),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          console.error(`[cart] POST /api/cart/items returned ${res.status}`, body);
          return;
        }
        const json = (await res.json()) as { cart: Cart; session_id?: string };
        persistSidFromResponse(res, json);
        setCart(json.cart);
        setQtys(buildQtys(json.cart));
      } catch (err) {
        console.error('[cart] network error', err);
      }
    };

    const next = inflight.current.then(run, run);
    inflight.current = next;
    await next;
  }, []);

  const removeItem = useCallback(async (variantId: number) => {
    setQtys(prev => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
    const run = async () => {
      try {
        const res = await fetch('/api/cart/remove', {
          method: 'POST',
          headers: { 'content-type': 'application/json', ...sidHeader() },
          credentials: 'include',
          body: JSON.stringify({ variant_id: variantId }),
        });
        if (!res.ok) {
          console.error(`[cart] POST /api/cart/remove returned ${res.status}`);
          return;
        }
        const json = (await res.json()) as { cart: Cart; session_id?: string };
        persistSidFromResponse(res, json);
        setCart(json.cart);
        setQtys(buildQtys(json.cart));
      } catch (err) {
        console.error('[cart] remove network error', err);
      }
    };
    const next = inflight.current.then(run, run);
    inflight.current = next;
    await next;
  }, []);

  return { cart, loading, qtys, setItem, removeItem, refresh };
}
