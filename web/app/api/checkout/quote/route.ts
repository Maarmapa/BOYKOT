// POST /api/checkout/quote — agentic-commerce quote endpoint.
//
// Cualquier agente AI puede armar un carro vía MCP / search / catalog, y
// pedir un quote acá. Devolvemos el costo total + un payment_link que el
// usuario humano abre para pagar (Transbank cuando esté listo).
//
// Sin payment provider configurado todavía: devolvemos el quote más un
// fallback link a /carrito con los items pre-cargados via query string.
//
// Body:
//   { items: [{ slug?: string, variant_id?: number, qty: number }],
//     ref?: string }   // opcional: referral key del agente
//
// Response:
//   {
//     items: [{ slug, name, variant_id, qty, price_clp, line_total }],
//     subtotal, shipping, total,
//     currency, expires_at,
//     payment_link,    // url para entregar al humano
//     quote_id,
//   }

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getProduct } from '@/lib/products';
import { BRANDS } from '@/lib/colors/brands';
import { fetchVariantPrice } from '@/lib/bsale-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface IncomingItem {
  slug?: string;
  variant_id?: number;
  qty?: number;
}

interface QuotedItem {
  slug: string | null;
  name: string;
  variant_id: number | null;
  brand: string | null;
  qty: number;
  unit_price_clp: number;
  line_total_clp: number;
}

const FREE_SHIPPING_THRESHOLD = 50_000;
const FLAT_SHIPPING = 4_990;
const SITE = 'https://boykot.cl';

function brandLookup(variantId: number): { slug: string; brandName: string; productName: string; basePrice: number } | null {
  for (const slug of Object.keys(BRANDS)) {
    const b = BRANDS[slug];
    if (!b.bsaleProductId) continue;
    const c = b.colors.find(c => c.variantId === variantId);
    if (c) {
      return {
        slug,
        brandName: b.brandName ?? '',
        productName: b.productName,
        basePrice: b.basePriceClp,
      };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: { items?: IncomingItem[]; ref?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'no items' }, { status: 400 });
  }

  const quoted: QuotedItem[] = [];
  const errors: string[] = [];

  for (const it of items) {
    const qty = Math.max(1, Math.min(Number(it.qty || 1), 50));

    // Path 1: slug → product page (uses scraped catalog)
    if (it.slug) {
      const p = getProduct(it.slug);
      if (!p) { errors.push(`producto no encontrado: ${it.slug}`); continue; }
      const unit = p.price ?? 0;
      quoted.push({
        slug: p.slug,
        name: p.name,
        variant_id: null,
        brand: p.brand,
        qty,
        unit_price_clp: unit,
        line_total_clp: unit * qty,
      });
      continue;
    }

    // Path 2: variant_id → matches a color in a brand color card
    if (it.variant_id) {
      const meta = brandLookup(it.variant_id);
      if (!meta) {
        errors.push(`variant_id no en catálogo: ${it.variant_id}`);
        continue;
      }
      // Try live BSale price if token configured, else fallback to brand base price.
      let unit = meta.basePrice;
      if (process.env.BSALE_ACCESS_TOKEN) {
        const live = await fetchVariantPrice(it.variant_id);
        if (live) unit = live;
      }
      quoted.push({
        slug: meta.slug,
        name: `${meta.brandName} ${meta.productName}`,
        variant_id: it.variant_id,
        brand: meta.brandName,
        qty,
        unit_price_clp: unit,
        line_total_clp: unit * qty,
      });
      continue;
    }

    errors.push('cada item necesita slug o variant_id');
  }

  if (quoted.length === 0) {
    return NextResponse.json({ error: 'no valid items', details: errors }, { status: 400 });
  }

  const subtotal = quoted.reduce((s, x) => s + x.line_total_clp, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;
  const quote_id = crypto.randomBytes(8).toString('hex');
  const expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  // Build the human-facing payment URL. When Transbank lands, point at
  // /checkout?quote={id} server-side resolving. For now, push items into
  // /carrito via query (items as base64 JSON) so the user can finalize.
  const cartPayload = quoted.map(q => ({ slug: q.slug, variant_id: q.variant_id, qty: q.qty }));
  const cartParam = Buffer.from(JSON.stringify(cartPayload)).toString('base64url');
  const ref = body.ref ? `&ref=${encodeURIComponent(body.ref)}` : '';
  const payment_link = `${SITE}/carrito?prefill=${cartParam}${ref}`;

  return NextResponse.json({
    quote_id,
    currency: 'CLP',
    items: quoted,
    subtotal_clp: subtotal,
    shipping_clp: shipping,
    total_clp: total,
    free_shipping_threshold_clp: FREE_SHIPPING_THRESHOLD,
    payment_link,
    expires_at,
    notes: errors.length ? errors : undefined,
    payment_methods_planned: ['transbank_webpay', 'stripe', 'transferencia', 'x402_usdc (futuro)'],
  }, {
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'no-store',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

// Allow agents to discover the schema via GET
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/checkout/quote',
    method: 'POST',
    description: 'Devuelve un quote con precio total + payment_link para entregar al humano.',
    body_schema: {
      items: 'array of { slug?: string, variant_id?: number, qty: number }',
      ref: 'optional referral key del agente',
    },
    response_schema: {
      quote_id: 'string',
      items: 'array with name, qty, unit_price_clp, line_total_clp',
      subtotal_clp: 'number',
      shipping_clp: 'number',
      total_clp: 'number',
      payment_link: 'URL para entregar al humano',
      expires_at: 'ISO date',
    },
    docs: 'https://boykot.cl/llms.txt',
  });
}
