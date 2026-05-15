// Anonymous session id stored in a long-lived httpOnly cookie. Used to associate
// a cart with a not-yet-logged-in visitor. Once the visitor signs in, we'll
// migrate their cart over to user_id (done at login flow, not here).

import 'server-only';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE = 'boykot_sid';
const TTL_DAYS = 90;

export async function getOrCreateSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) return existing;
  const sid = crypto.randomBytes(16).toString('hex');
  jar.set(COOKIE, sid, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TTL_DAYS * 24 * 60 * 60,
  });
  return sid;
}

export async function readSessionId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? null;
}
