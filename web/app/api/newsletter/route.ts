// Newsletter signup endpoint con fallback Supabase.
// Flow:
//   1. SIEMPRE persiste el email en Supabase newsletter_signups (idempotent)
//   2. SI hay BREVO_API_KEY + listId, sincroniza al list de Brevo
//   3. Si Brevo falla, queda en Supabase para sync posterior
//
// Cuando Derio pase la key, podés correr un script que itere los unsynced.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  email: string;
  source?: string;
}

async function persistToSupabase(email: string, source: string): Promise<{ id: number; isNew: boolean }> {
  const { data, error } = await supabaseAdmin()
    .from('newsletter_signups')
    .upsert(
      { email, source },
      { onConflict: 'email', ignoreDuplicates: false },
    )
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id, isNew: true };
}

async function syncToBrevo(email: string, source: string): Promise<{ ok: boolean; contactId?: number; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_NEWSLETTER_LIST_ID;
  if (!apiKey || !listId) return { ok: false, error: 'brevo_not_configured' };

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      attributes: { SOURCE: source },
      listIds: [parseInt(listId, 10)],
      updateEnabled: true,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    return { ok: false, error: `brevo_${res.status}: ${errText.slice(0, 200)}` };
  }
  const json = (await res.json()) as { id?: number };
  return { ok: true, contactId: json.id };
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }
  const source = (body.source || 'footer').slice(0, 50);

  // 1) ALWAYS persist to Supabase
  let signupId: number;
  try {
    const { id } = await persistToSupabase(email, source);
    signupId = id;
  } catch (err) {
    console.error('[newsletter] supabase persist failed', err);
    return NextResponse.json({ error: 'storage_failed' }, { status: 500 });
  }

  // 2) Try Brevo (best-effort)
  const brevoResult = await syncToBrevo(email, source);

  if (brevoResult.ok && brevoResult.contactId) {
    await supabaseAdmin()
      .from('newsletter_signups')
      .update({
        brevo_synced: true,
        brevo_synced_at: new Date().toISOString(),
        brevo_contact_id: brevoResult.contactId,
      })
      .eq('id', signupId);
  } else if (brevoResult.error && brevoResult.error !== 'brevo_not_configured') {
    console.warn(`[newsletter] brevo sync failed (saved locally): ${brevoResult.error}`);
  }

  return NextResponse.json({
    ok: true,
    saved: true,
    brevo_synced: brevoResult.ok,
  });
}
