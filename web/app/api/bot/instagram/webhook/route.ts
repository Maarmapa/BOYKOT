// Instagram Direct webhook (Meta Graph v23+).
// Setup en Meta Developer → App → Messenger/Instagram → Webhooks:
//   Callback URL: https://boykot.cl/api/bot/instagram/webhook
//   Verify Token: <META_WEBHOOK_VERIFY_TOKEN>
//
// Subscribe to: messages, messaging_postbacks, message_reactions.

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookChallenge, verifyMetaSignature, sendInstagramText } from '@/lib/hermes/meta';
import {
  upsertConversation,
  appendMessage,
  listMessages,
} from '@/lib/hermes/conversations';
import { runHermesTurn, type HermesMessage } from '@/lib/hermes/agent';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const challenge = verifyWebhookChallenge(req.nextUrl.searchParams);
  if (!challenge) return NextResponse.json({ error: 'verify_failed' }, { status: 403 });
  return new NextResponse(challenge, { status: 200 });
}

interface IgMessaging {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    attachments?: Array<{ type: string; payload: { url: string } }>;
    is_echo?: boolean;
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const sig = req.headers.get('x-hub-signature-256');
  const ok = await verifyMetaSignature(rawBody, sig);
  if (!ok && process.env.META_APP_SECRET) {
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }

  let body: { object?: string; entry?: Array<{ id: string; time: number; messaging?: IgMessaging[] }> };
  try { body = JSON.parse(rawBody); }
  catch { return NextResponse.json({ ok: true, ignored: 'invalid_json' }); }

  if (body.object !== 'instagram') {
    return NextResponse.json({ ok: true, ignored: 'not_instagram' });
  }

  for (const entry of body.entry || []) {
    for (const m of entry.messaging || []) {
      if (!m.message?.text || m.message.is_echo) continue; // skip echoes + non-text
      try {
        const psid = m.sender.id;
        const conv = await upsertConversation({
          channel: 'instagram',
          external_id: psid,
          customer_handle: psid,
        });

        const persisted = await appendMessage({
          conversation_id: conv.id,
          direction: 'in',
          author: 'customer',
          text: m.message.text,
          external_id: m.message.mid,
        });
        if (!persisted) continue;

        const history = await listMessages(conv.id, 20);
        const hermesHistory: HermesMessage[] = history.map(h => ({
          role: h.direction === 'in' ? 'user' : 'assistant',
          content: h.text,
        }));

        const reply = await runHermesTurn(hermesHistory);
        const sendResult = await sendInstagramText(psid, reply);

        await appendMessage({
          conversation_id: conv.id,
          direction: 'out',
          author: 'bot',
          text: reply + (sendResult.ok ? '' : `\n\n[send_error: ${sendResult.error}]`),
        });
      } catch (err) {
        console.error('[hermes instagram] error processing message', err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
