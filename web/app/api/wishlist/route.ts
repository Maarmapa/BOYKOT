// GET    /api/wishlist          → returns the current session wishlist
// POST   /api/wishlist          → add { slug, name, image, price, brand }
// DELETE /api/wishlist?slug=... → remove
//
// Anonymous: keyed by session_id (same as cart).

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateSessionId, withSessionHeader } from '@/lib/session';
import {
  listWishlist,
  addToWishlist,
  removeFromWishlist,
} from '@/lib/wishlist';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { sid } = await getOrCreateSessionId();
  const items = await listWishlist(sid);
  return withSessionHeader(NextResponse.json({ items, session_id: sid }), sid);
}

interface AddBody {
  slug?: string;
  name?: string;
  image?: string | null;
  price?: number | null;
  brand?: string | null;
}

export async function POST(req: NextRequest) {
  let body: AddBody;
  try { body = (await req.json()) as AddBody; }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  if (!body.slug || !body.name) {
    return NextResponse.json({ error: 'slug and name required' }, { status: 400 });
  }

  const { sid } = await getOrCreateSessionId();
  const result = await addToWishlist(sid, {
    slug: body.slug,
    name: body.name,
    image: body.image ?? null,
    price: body.price ?? null,
    brand: body.brand ?? null,
  });

  const items = await listWishlist(sid);
  return withSessionHeader(
    NextResponse.json({ ok: true, added: result.added, items }),
    sid,
  );
}

export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug query param required' }, { status: 400 });
  }
  const { sid } = await getOrCreateSessionId();
  await removeFromWishlist(sid, slug);
  const items = await listWishlist(sid);
  return withSessionHeader(NextResponse.json({ ok: true, items }), sid);
}
