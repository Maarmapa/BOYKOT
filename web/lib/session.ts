// Anonymous session id. Stored two ways so we always have one even when
// cookies are stripped (Vercel deployment protection wraps the response,
// some CDNs drop set-cookie, third-party browser policies, etc.):
//
//   1. httpOnly cookie 'boykot_sid' — the canonical store. Browsers send it
//      automatically on every same-origin request.
//   2. Custom header 'x-boykot-sid' — read from request and echoed back in
//      every response. The browser hook stores it in localStorage and
//      sends it on subsequent requests.
//
// Both share the same session id; whichever the request carries wins.

import 'server-only';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE = 'boykot_sid';
const HEADER = 'x-boykot-sid';
const TTL_DAYS = 90;

function newId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Get the session id from cookie OR x-boykot-sid header, creating one if
 * neither is present. Returns { sid, isNew } so the caller can decide
 * whether to echo it back to the client.
 */
export async function getOrCreateSessionId(): Promise<{ sid: string; isNew: boolean }> {
  const jar = await cookies();
  const cookieSid = jar.get(COOKIE)?.value;
  if (cookieSid) return { sid: cookieSid, isNew: false };

  const hdrs = await headers();
  const headerSid = hdrs.get(HEADER);
  if (headerSid && /^[a-f0-9]{16,64}$/i.test(headerSid)) {
    // Restore the cookie alongside so future same-origin requests work too.
    jar.set(COOKIE, headerSid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: TTL_DAYS * 24 * 60 * 60,
    });
    return { sid: headerSid, isNew: false };
  }

  const sid = newId();
  jar.set(COOKIE, sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_DAYS * 24 * 60 * 60,
  });
  return { sid, isNew: true };
}

export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  const c = jar.get(COOKIE)?.value;
  if (c) return c;
  const hdrs = await headers();
  return hdrs.get(HEADER) ?? null;
}

/**
 * Attach the session id back to the response as a header so the client
 * can pin it in localStorage. Idempotent.
 */
export function withSessionHeader(res: NextResponse, sid: string): NextResponse {
  res.headers.set(HEADER, sid);
  return res;
}
