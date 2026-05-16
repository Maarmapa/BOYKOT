// POST /api/cotizacion/save
// Body: { items, customer info, raw_input, customer_notes }
// Returns: { short_id, url, total_clp }

import { NextRequest, NextResponse } from 'next/server';
import { createQuote, type CreateQuoteInput } from '@/lib/quotes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export async function POST(req: NextRequest) {
  let body: CreateQuoteInput;
  try { body = (await req.json()) as CreateQuoteInput; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'items_required' }, { status: 400 });
  }
  if (body.items.length > 100) {
    return NextResponse.json({ error: 'too_many_items', max: 100 }, { status: 400 });
  }

  // Sanitize qty + price (must be positive integers)
  for (const item of body.items) {
    if (!item.product_name || typeof item.product_name !== 'string') {
      return NextResponse.json({ error: 'invalid_item_name' }, { status: 400 });
    }
    item.qty = Math.max(1, Math.floor(item.qty || 1));
    item.unit_price_clp = Math.max(0, Math.floor(item.unit_price_clp || 0));
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
    const quote = await createQuote({
      ...body,
      client_ip: clientIp || undefined,
      source: body.source || 'webform',
    });

    return NextResponse.json({
      ok: true,
      short_id: quote.short_id,
      url: `${SITE}/cotizacion/${quote.short_id}`,
      subtotal_clp: quote.subtotal_clp,
      iva_clp: quote.iva_clp,
      total_clp: quote.total_clp,
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'save_failed', message: (e as Error).message },
      { status: 500 },
    );
  }
}
