// WhatsApp Cloud API webhook handler (Meta Graph v23+).
// Setup en Meta Developer → App → WhatsApp → Configuration:
//   Callback URL: https://boykot.cl/api/bot/whatsapp/webhook
//   Verify Token: <META_WEBHOOK_VERIFY_TOKEN>
//
// El payload puede traer múltiples mensajes en `entry[].changes[].value.messages[]`.
// Cada uno se persiste + se procesa con Hermes + se responde via sendWhatsAppText.

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookChallenge, verifyMetaSignature, sendWhatsAppText } from '@/lib/hermes/meta';
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

interface WaMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type?: string };
  audio?: { id: string; mime_type?: string };
}
interface WaContact {
  wa_id: string;
  profile?: { name?: string };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify signature
  const sig = req.headers.get('x-hub-signature-256');
  const ok = await verifyMetaSignature(rawBody, sig);
  if (!ok && process.env.META_APP_SECRET) {
    // Solo enforce si tenemos el secret. En dev podemos bypassear.
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }

  let body: { entry?: Array<{ changes?: Array<{ value?: { messages?: WaMessage[]; contacts?: WaContact[] } }> }> };
  try { body = JSON.parse(rawBody); }
  catch { return NextResponse.json({ ok: true, ignored: 'invalid_json' }); }

  // ACK fast: respond 200 immediately, process inline (Vercel <5s budget OK)
  const messages: Array<{ msg: WaMessage; contact: WaContact | undefined }> = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value?.messages) continue;
      const contacts = value.contacts || [];
      for (const msg of value.messages) {
        messages.push({ msg, contact: contacts[0] });
      }
    }
  }

  for (const { msg, contact } of messages) {
    if (msg.type !== 'text' || !msg.text?.body) continue; // skip non-text por ahora

    try {
      // 1. Upsert conversation
      const conv = await upsertConversation({
        channel: 'whatsapp',
        external_id: msg.from,
        customer_name: contact?.profile?.name,
        customer_handle: msg.from,
      });

      // 2. Persist incoming message (idempotent via external_id)
      const persisted = await appendMessage({
        conversation_id: conv.id,
        direction: 'in',
        author: 'customer',
        text: msg.text.body,
        external_id: msg.id,
      });
      if (!persisted) continue; // duplicate, already processed

      // 3. Build conversation history (last 20 msgs)
      const history = await listMessages(conv.id, 20);
      const hermesHistory: HermesMessage[] = history.map(m => ({
        role: m.direction === 'in' ? 'user' : 'assistant',
        content: m.text,
      }));

      // 4. Run Hermes
      const reply = await runHermesTurn(hermesHistory);

      // 5. Send via Meta
      const sendResult = await sendWhatsAppText(msg.from, reply);

      // 6. Persist outgoing
      await appendMessage({
        conversation_id: conv.id,
        direction: 'out',
        author: 'bot',
        text: reply + (sendResult.ok ? '' : `\n\n[send_error: ${sendResult.error}]`),
      });
    } catch (err) {
      console.error('[hermes whatsapp] error processing message', err);
      // Don't fail webhook - Meta will retry which causes loops
    }
  }

  return NextResponse.json({ ok: true });
}
