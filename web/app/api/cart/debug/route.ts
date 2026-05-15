// Debug endpoint: shows exactly what the server sees from the browser.
// GET /api/cart/debug → echoes back all relevant request bits.

import { NextRequest, NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

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

  const sid = jar.get('boykot_sid')?.value ?? hdrs.get('x-boykot-sid');
  let dbCart: unknown = 'no session';
  if (sid) {
    const { data, error } = await supabaseAdmin()
      .from('carts')
      .select('id, status, items, last_activity_at, created_at')
      .eq('session_id', sid)
      .order('created_at', { ascending: false });
    dbCart = error ? { error: error.message } : data;
  }

  return NextResponse.json({
    cookies: allCookies,
    boykot_sid_cookie: jar.get('boykot_sid')?.value ?? null,
    headers: interestingHeaders,
    nextUrl: req.nextUrl.toString(),
    dbCart,
  });
}
