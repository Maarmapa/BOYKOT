// Meta Graph API helpers para enviar mensajes a IG + WhatsApp.

import 'server-only';

const META_GRAPH = 'https://graph.facebook.com/v23.0';

/**
 * Verify Meta webhook subscription (GET handler shared by IG + WhatsApp).
 * Meta sends GET ?hub.mode=subscribe&hub.verify_token=X&hub.challenge=Y on first setup.
 */
export function verifyWebhookChallenge(searchParams: URLSearchParams): string | null {
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const expected = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!expected) return null;
  if (mode === 'subscribe' && token === expected && challenge) return challenge;
  return null;
}

/**
 * Send a WhatsApp text message via Meta Cloud API.
 * Requires WHATSAPP_PHONE_ID + WHATSAPP_TOKEN envs.
 */
export async function sendWhatsAppText(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneId || !token) return { ok: false, error: 'whatsapp_envs_missing' };

  try {
    const res = await fetch(`${META_GRAPH}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: true, body: text },
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, error: `whatsapp_${res.status}: ${errText.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Send Instagram DM via Meta Send API.
 * Requires INSTAGRAM_PAGE_ID + INSTAGRAM_TOKEN (page access token).
 */
export async function sendInstagramText(psid: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const pageId = process.env.INSTAGRAM_PAGE_ID;
  const token = process.env.INSTAGRAM_TOKEN;
  if (!pageId || !token) return { ok: false, error: 'instagram_envs_missing' };

  try {
    const res = await fetch(`${META_GRAPH}/${pageId}/messages?access_token=${token}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text },
        messaging_type: 'RESPONSE',
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return { ok: false, error: `instagram_${res.status}: ${errText.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Verify Meta webhook signature header (x-hub-signature-256).
 * HMAC SHA256 with META_APP_SECRET over the raw request body.
 */
export async function verifyMetaSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false;
  const secret = process.env.META_APP_SECRET;
  if (!secret) return false; // dev mode: caller decides whether to allow

  const expectedPrefix = 'sha256=';
  if (!signatureHeader.startsWith(expectedPrefix)) return false;
  const sigHex = signatureHeader.slice(expectedPrefix.length);

  // Web Crypto for edge compat (works on Node 18+ too)
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Timing-safe compare
  if (hex.length !== sigHex.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ sigHex.charCodeAt(i);
  return diff === 0;
}
