// POST /api/cotizacion/parse
// Body: { text: string }
// Returns: { items: ParsedQuoteItem[], tokens_used }
//
// Public endpoint, sin auth. Para evitar abuso lo gateamos con rate-limit
// simple en memoria por IP. Para serio Vercel Edge Middleware o Upstash.

import { NextRequest, NextResponse } from 'next/server';
import { parseQuoteInput } from '@/lib/quote-parser';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Naive per-IP rate limit: 5 parse calls per 5 min
const RATE_LIMIT_PER_5MIN = 5;
const rateLimitMap = new Map<string, number[]>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const window = 5 * 60 * 1000;
  const past = (rateLimitMap.get(ip) || []).filter(t => now - t < window);
  if (past.length >= RATE_LIMIT_PER_5MIN) return false;
  past.push(now);
  rateLimitMap.set(ip, past);
  return true;
}

interface Body {
  text?: string;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', retry_after_seconds: 300 },
      { status: 429 },
    );
  }

  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const text = (body.text || '').trim();
  if (!text || text.length < 5) {
    return NextResponse.json({ error: 'text_too_short' }, { status: 400 });
  }
  if (text.length > 5000) {
    return NextResponse.json({ error: 'text_too_long', max: 5000 }, { status: 400 });
  }

  try {
    const result = await parseQuoteInput(text);
    return NextResponse.json({
      ok: true,
      items: result.items,
      tokens_used: result.tokensUsed,
    });
  } catch (e) {
    console.error('[cotizacion/parse]', e);
    return NextResponse.json(
      { error: 'parse_failed', message: (e as Error).message },
      { status: 500 },
    );
  }
}
