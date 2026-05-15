import { NextRequest, NextResponse } from 'next/server';
import { makeToken, ADMIN_COOKIE, ADMIN_TTL } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD no configurado en Vercel' }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (body.password !== password) {
    return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const token = makeToken(password);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_TTL,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
