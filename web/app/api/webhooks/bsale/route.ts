// BSale webhook receiver.
// Configure URL in BSale admin: https://boykot.cl/api/webhooks/bsale?token=...
//
// BSale POSTs JSON: { cpnID, resource, resourceID, Topic, action, send (unix), [officeId] }
// Topics: documents | products | variants | stock | prices
// Actions: POST | PUT | DELETE
//
// We log every event (idempotent via unique idx), then revalidate the matching
// cache tags so SSR pages re-fetch from BSale on next request.

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase';
import type { BsaleWebhookPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Shared-secret auth via query param (BSale doesn't support custom headers).
  const expected = process.env.BSALE_WEBHOOK_TOKEN;
  if (!expected || req.nextUrl.searchParams.get('token') !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: BsaleWebhookPayload;
  try {
    payload = (await req.json()) as BsaleWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const expectedCpn = process.env.BSALE_CPN_ID ? Number(process.env.BSALE_CPN_ID) : null;
  if (expectedCpn !== null && payload.cpnID !== expectedCpn) {
    return NextResponse.json({ error: 'unknown cpnID' }, { status: 403 });
  }

  // Log (idempotent via the unique idx on topic+action+resource_id+sent_at).
  const sentAt = payload.send ? new Date(payload.send * 1000).toISOString() : null;
  const { error: logErr } = await supabaseAdmin().from('bsale_webhook_events').insert({
    cpn_id: payload.cpnID,
    topic: payload.Topic,
    action: payload.action,
    resource: payload.resource,
    resource_id: payload.resourceID,
    payload,
    sent_at: sentAt,
  });
  // Duplicate (replay) → 200, do not re-invalidate.
  if (logErr && /duplicate/i.test(logErr.message)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  invalidate(payload);

  await supabaseAdmin()
    .from('bsale_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('resource_id', payload.resourceID)
    .eq('topic', payload.Topic)
    .eq('sent_at', sentAt);

  return NextResponse.json({ ok: true });
}

function invalidate(payload: BsaleWebhookPayload) {
  const id = payload.resourceID;
  switch (payload.Topic) {
    case 'stock':
    case 'variants':
      revalidateTag('stock:all', 'max');
      revalidateTag(`stock:variant:${id}`, 'max');
      break;
    case 'products':
      revalidateTag(`product:${id}`, 'max');
      revalidateTag(`stock:product:${id}`, 'max');
      break;
    case 'prices':
      revalidateTag('prices:all', 'max');
      revalidateTag(`price:${id}`, 'max');
      break;
    case 'documents':
      // Document = sale/refund issued. Stock implicitly changes; safest to invalidate all.
      revalidateTag('stock:all', 'max');
      break;
  }
}

// Some webhook providers ping with GET to verify the URL. Respond 200.
export async function GET() {
  return NextResponse.json({ ok: true, service: 'bsale-webhook' });
}
