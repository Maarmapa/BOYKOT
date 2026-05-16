// POST /api/cart/import-shared
// Body: { source_cart_id }
// Importa items del shared cart al carrito propio del session id.

import { NextRequest, NextResponse } from 'next/server';
import { getCart, ensureSessionCart, addToCart } from '@/lib/cart';
import { getOrCreateSessionId, withSessionHeader } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  source_cart_id?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.source_cart_id) {
    return NextResponse.json({ error: 'source_cart_id_required' }, { status: 400 });
  }

  const source = await getCart(body.source_cart_id);
  if (!source) {
    return NextResponse.json({ error: 'source_not_found' }, { status: 404 });
  }

  const { sid } = await getOrCreateSessionId();
  const targetCart = await ensureSessionCart(sid);

  let imported = 0;
  for (const item of source.items) {
    try {
      await addToCart(targetCart.id, item);
      imported++;
    } catch {
      // Skip si algun item falla — no abortamos toda la importacion
    }
  }

  return withSessionHeader(
    NextResponse.json({ ok: true, imported, total: source.items.length }),
    sid,
  );
}
