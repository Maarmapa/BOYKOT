// GET /api/hermes/status
//
// Devuelve si Hermes esta operativo y en que canales.
// Util para mostrar en admin un badge "Hermes ON/OFF".
//
// NO consume Anthropic API ni hace llamadas externas — solo lee envs +
// conteos de la DB.

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const meta_app_secret = !!process.env.META_APP_SECRET;
  const meta_verify_token = !!process.env.META_WEBHOOK_VERIFY_TOKEN;
  const whatsapp = !!process.env.WHATSAPP_PHONE_ID && !!process.env.WHATSAPP_TOKEN;
  const instagram = !!process.env.INSTAGRAM_PAGE_ID && !!process.env.INSTAGRAM_TOKEN;

  // Stats de uso (read-only de bot_conversations)
  let totalConversations = 0;
  let messagesLast24h = 0;
  let needsHumanCount = 0;
  try {
    const { count: convCount } = await supabaseAdmin()
      .from('bot_conversations')
      .select('id', { count: 'exact', head: true });
    totalConversations = convCount ?? 0;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: msgCount } = await supabaseAdmin()
      .from('bot_messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);
    messagesLast24h = msgCount ?? 0;

    const { count: needCount } = await supabaseAdmin()
      .from('bot_conversations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'needs_human');
    needsHumanCount = needCount ?? 0;
  } catch {
    // DB might fail — return basic info
  }

  const channels: Array<{ channel: string; active: boolean; reason?: string }> = [
    {
      channel: 'web_chat',
      active: anthropic,
      reason: !anthropic ? 'ANTHROPIC_API_KEY missing' : undefined,
    },
    {
      channel: 'instagram',
      active: anthropic && meta_app_secret && instagram,
      reason: !anthropic ? 'ANTHROPIC_API_KEY missing' :
              !meta_app_secret ? 'META_APP_SECRET missing' :
              !instagram ? 'INSTAGRAM_PAGE_ID + INSTAGRAM_TOKEN missing' : undefined,
    },
    {
      channel: 'whatsapp',
      active: anthropic && meta_app_secret && whatsapp,
      reason: !anthropic ? 'ANTHROPIC_API_KEY missing' :
              !meta_app_secret ? 'META_APP_SECRET missing' :
              !whatsapp ? 'WHATSAPP_PHONE_ID + WHATSAPP_TOKEN missing' : undefined,
    },
  ];

  return NextResponse.json({
    operational: anthropic, // si hay anthropic key, al menos web_chat funciona
    channels,
    envs: {
      anthropic_api_key: anthropic,
      meta_verify_token,
      meta_app_secret,
      whatsapp: { phone_id: !!process.env.WHATSAPP_PHONE_ID, token: !!process.env.WHATSAPP_TOKEN },
      instagram: { page_id: !!process.env.INSTAGRAM_PAGE_ID, token: !!process.env.INSTAGRAM_TOKEN },
    },
    stats: {
      total_conversations: totalConversations,
      messages_last_24h: messagesLast24h,
      needs_human: needsHumanCount,
    },
  });
}
