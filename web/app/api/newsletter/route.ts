// Newsletter signup endpoint. When BREVO_API_KEY lands in Vercel, this
// will create a contact in the Brevo list and tag them with source.
// For now: validate email + log. Idempotent.

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  email: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  if (!body.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_NEWSLETTER_LIST_ID;

  if (!apiKey || !listId) {
    // No Brevo yet — just log and acknowledge so the UX is intact.
    console.log(`[newsletter] (no Brevo configured) email=${body.email} source=${body.source ?? 'unknown'}`);
    return NextResponse.json({ ok: true, queued: true });
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email: body.email,
        attributes: { SOURCE: body.source || 'footer' },
        listIds: [parseInt(listId, 10)],
        updateEnabled: true,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`[newsletter] Brevo ${res.status}: ${errText}`);
      return NextResponse.json({ ok: false, error: 'provider error' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] network error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
