// Admin auth simple basado en cookie + env var token.
//
// v1: una sola contraseña en env var ADMIN_PASSWORD. Cookie firmada con
// HMAC del token. Suficiente para 1 usuario (vos). Si se vuelve multi-user
// migramos a Supabase Auth en v2.

import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';

const COOKIE = 'boykot_admin';
const TTL_SECONDS = 60 * 60 * 24 * 14; // 2 semanas

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function makeToken(password: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const payload = `v1.${ts}`;
  const sig = sign(payload, password);
  return `${payload}.${sig}`;
}

export function verifyToken(token: string, password: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [v, ts, sig] = parts;
  if (v !== 'v1') return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  if (Date.now() / 1000 - tsNum > TTL_SECONDS) return false;
  const expected = sign(`${v}.${ts}`, password);
  return sig === expected;
}

export async function isAdmin(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;
  return verifyToken(token, password);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_TTL = TTL_SECONDS;
