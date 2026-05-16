'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'boykot_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentItem {
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  brand: string | null;
  viewedAt: number;
}

function loadFromStorage(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveToStorage(items: RecentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // quota exceeded — ignore
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadFromStorage());
    setLoaded(true);
  }, []);

  const track = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setItems(prev => {
      const filtered = prev.filter(i => i.slug !== item.slug);
      const next = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { items, loaded, track, clear };
}
