'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/lib/use-recently-viewed';

interface Props {
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  brand: string | null;
}

/** Mounts on /producto/[slug] page — tracks the visit silently. No UI. */
export default function RecentlyViewedTracker(props: Props) {
  const { track } = useRecentlyViewed();
  useEffect(() => {
    track(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.slug]);
  return null;
}
