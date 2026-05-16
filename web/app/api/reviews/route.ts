// POST /api/reviews
// Body: { product_slug, email, name?, rating, title?, body? }
//
// Crea review. Verifica purchase contra pending_orders.
// UNIQUE (slug, email) — 1 review por cliente por producto.

import { NextRequest, NextResponse } from 'next/server';
import { createReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  product_slug?: string;
  email?: string;
  name?: string;
  rating?: number;
  title?: string;
  body?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!body.product_slug || !body.email || !body.rating) {
    return NextResponse.json(
      { error: 'product_slug + email + rating required' },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
    const result = await createReview({
      product_slug: body.product_slug,
      customer_email: body.email,
      customer_name: body.name,
      rating: body.rating,
      title: body.title?.slice(0, 100),
      body: body.body?.slice(0, 2000),
      client_ip: clientIp,
    });
    return NextResponse.json({
      ok: true,
      created: result.created,
      message: result.created
        ? 'Reseña publicada. Gracias!'
        : 'Ya tenías una reseña para este producto.',
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'create_failed', message: (e as Error).message },
      { status: 500 },
    );
  }
}
