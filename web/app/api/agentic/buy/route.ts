// x402-compliant agentic payment endpoint.
//
// HTTP 402 Payment Required protocol (https://www.x402.org/) — designed
// for AI agents to autonomously discover + pay for resources.
//
// Flow:
//   1. Agent GETs /api/agentic/buy?slug=copic-sketch-b01&qty=2
//   2. We respond 402 with payment requirements (USDC-Base address + amount)
//   3. Agent signs USDC transfer
//   4. Agent retries with X-PAYMENT header (the signed transaction)
//   5. We verify on Base chain, mark order paid, return product + receipt
//
// Status: lab endpoint. Posicionamiento PR: "Boykot = primer retail
// chileno con x402". Production-grade verification requires:
//   - Coinbase x402 facilitator integration
//   - BASE_RPC_URL env + viem client
//   - Real USDC address on Base mainnet
//
// V1: stub que responde con la SHAPE correcta del protocolo. Para activar
// pagos reales habilitar BOYKOT_X402_ENABLED + BOYKOT_X402_RECEIVER_ADDRESS.

import { NextRequest, NextResponse } from 'next/server';
import productsData from '@/data/products.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SlimProduct {
  slug: string;
  name: string;
  price: number | null;
  availability: string;
  image: string | null;
}

const PRODUCTS = productsData as unknown as Record<string, SlimProduct>;

const X402_ENABLED = process.env.BOYKOT_X402_ENABLED === 'true';
const X402_RECEIVER = process.env.BOYKOT_X402_RECEIVER_ADDRESS;
// USD Coin on Base mainnet
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
// CLP/USD approx rate (TODO: pull from CoinGecko/Banco Central API)
const CLP_PER_USD = 1000;

function clpToUsdc(clp: number): { usdc: string; usdcAtomic: string } {
  const usd = clp / CLP_PER_USD;
  return {
    usdc: usd.toFixed(2),
    // USDC has 6 decimals, atomic units
    usdcAtomic: Math.round(usd * 1_000_000).toString(),
  };
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const qty = Math.max(1, parseInt(req.nextUrl.searchParams.get('qty') || '1', 10));

  if (!slug) {
    return NextResponse.json(
      { error: 'missing slug', hint: 'use ?slug=<product-slug>&qty=<int>' },
      { status: 400 },
    );
  }

  const product = PRODUCTS[slug];
  if (!product) {
    return NextResponse.json({ error: 'product not found', slug }, { status: 404 });
  }

  if (product.availability === 'OutOfStock') {
    return NextResponse.json(
      { error: 'out of stock', slug, name: product.name },
      { status: 409 },
    );
  }

  if (!product.price) {
    return NextResponse.json(
      { error: 'price not available — contact support@boykot.cl' },
      { status: 422 },
    );
  }

  const totalClp = product.price * qty;
  const conv = clpToUsdc(totalClp);

  // Check if X-PAYMENT header is present (agent retrying with payment)
  const xPayment = req.headers.get('x-payment');
  if (xPayment) {
    // V1 stub: in production this would verify the signed transaction on
    // Base mainnet using viem + the x402 facilitator.
    return NextResponse.json(
      {
        ok: false,
        status: 'verification_not_implemented',
        message:
          'x402 verification is not yet active. This endpoint demonstrates protocol compliance but does not yet verify on-chain payments. Reach out to dev@boykot.cl for early access.',
        product: {
          slug: product.slug,
          name: product.name,
          qty,
          total_clp: totalClp,
        },
      },
      { status: 501 },
    );
  }

  // No payment yet — respond 402 with requirements
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
  const requirements = {
    scheme: 'exact',
    network: 'base-mainnet',
    maxAmountRequired: conv.usdcAtomic,
    resource: `${SITE}/api/agentic/buy?slug=${slug}&qty=${qty}`,
    description: `${qty}x ${product.name} — Boykot Chile`,
    mimeType: 'application/json',
    payTo: X402_ENABLED && X402_RECEIVER ? X402_RECEIVER : '0x0000000000000000000000000000000000000000',
    maxTimeoutSeconds: 60,
    asset: USDC_BASE,
    outputSchema: {
      type: 'object',
      properties: {
        ok: { type: 'boolean' },
        order_id: { type: 'string' },
        product: { type: 'object' },
        receipt: { type: 'string' },
      },
    },
    extra: {
      humanCheckoutFallback: `${SITE}/producto/${slug}`,
      product: {
        slug: product.slug,
        name: product.name,
        image: product.image,
        unit_price_clp: product.price,
        qty,
        total_clp: totalClp,
        total_usdc_display: conv.usdc,
        currency_fx_note: `Converted at ${CLP_PER_USD} CLP/USD. Settled in USDC on Base.`,
      },
    },
  };

  return NextResponse.json(
    {
      x402Version: 1,
      error: 'X-PAYMENT header required',
      accepts: [requirements],
    },
    { status: 402 },
  );
}

export async function POST(req: NextRequest) {
  // Mirror GET — some agents POST. Allow either.
  return GET(req);
}
