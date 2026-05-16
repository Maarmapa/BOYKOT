// POST /api/wishlist/move-to-cart
// Body: { slugs?: string[] } — opcional. Si no se pasa, importa todos.
//
// Mueve productos del wishlist al carrito. Por cada slug:
//   1. Busca producto + variantId via lib/lookup
//   2. Agrega 1 unidad al cart
//   3. Remueve del wishlist (opcional via remove_after param)

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSessionId, withSessionHeader } from '@/lib/session';
import { ensureSessionCart, addToCart } from '@/lib/cart';
import { listWishlist, removeFromWishlist } from '@/lib/wishlist';
import { getProductBySlug } from '@/lib/lookup';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  slugs?: string[];
  remove_after?: boolean;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { body = {}; }

  const { sid } = await getOrCreateSessionId();
  const wishlist = await listWishlist(sid);
  const targetCart = await ensureSessionCart(sid);

  const filterSlugs = body.slugs && body.slugs.length > 0 ? new Set(body.slugs) : null;
  const itemsToMove = filterSlugs
    ? wishlist.filter(w => filterSlugs.has(w.slug))
    : wishlist;

  const moved: string[] = [];
  const failed: string[] = [];

  for (const item of itemsToMove) {
    const product = getProductBySlug(item.slug);
    if (!product || !product.variantId) {
      failed.push(item.slug);
      continue;
    }
    try {
      await addToCart(targetCart.id, {
        variant_id: product.variantId,
        product_id: 0, // unknown desde lookup; cart lib lo manejara
        qty: 1,
        unit_price_clp: product.price || 0,
        name: product.name,
        image_url: product.image || undefined,
      });
      moved.push(item.slug);
      if (body.remove_after !== false) {
        await removeFromWishlist(sid, item.slug);
      }
    } catch {
      failed.push(item.slug);
    }
  }

  return withSessionHeader(
    NextResponse.json({
      ok: true,
      moved: moved.length,
      failed: failed.length,
      failed_slugs: failed,
    }),
    sid,
  );
}
