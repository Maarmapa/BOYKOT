// Debug endpoint: shows exactly what the server sees from the browser.
// GET /api/cart/debug → echoes back all relevant request bits.

import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const jar = await cookies();
  const hdrs = await headers();

  // Filter to only the bits that matter for the cart flow.
  const interestingHeaders: Record<string, string | null> = {
    'cookie': hdrs.get('cookie'),
    'x-boykot-sid': hdrs.get('x-boykot-sid'),
    'user-agent': hdrs.get('user-agent'),
    'referer': hdrs.get('referer'),
    'origin': hdrs.get('origin'),
    'host': hdrs.get('host'),
    'x-forwarded-host': hdrs.get('x-forwarded-host'),
    'x-vercel-ip-country': hdrs.get('x-vercel-ip-country'),
    'x-vercel-deployment-url': hdrs.get('x-vercel-deployment-url'),
  };

  const allCookies: Record<string, string> = {};
  for (const c of jar.getAll()) {
    allCookies[c.name] = c.value.length > 40 ? c.value.slice(0, 40) + '...' : c.value;
  }

  return NextResponse.json({
    cookies: allCookies,
    boykot_sid_cookie: jar.get('boykot_sid')?.value ?? null,
    headers: interestingHeaders,
    nextUrl: req.nextUrl.toString(),
  });
}
