// Persistencia de conversaciones bot.

import 'server-only';
import { supabaseAdmin } from '../supabase';

export type Channel = 'whatsapp' | 'instagram' | 'webchat';
export type Author = 'customer' | 'bot' | 'human';
export type ConversationStatus = 'active' | 'needs_human' | 'resolved';

export interface Conversation {
  id: number;
  channel: Channel;
  external_id: string;
  customer_name: string | null;
  customer_handle: string | null;
  customer_avatar: string | null;
  status: ConversationStatus;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

export interface BotMessage {
  id: number;
  conversation_id: number;
  direction: 'in' | 'out';
  author: Author;
  text: string;
  attachments: unknown[] | null;
  external_id: string | null;
  tokens_input: number | null;
  tokens_output: number | null;
  tools_used: string[] | null;
  created_at: string;
}

export async function upsertConversation(args: {
  channel: Channel;
  external_id: string;
  customer_name?: string;
  customer_handle?: string;
  customer_avatar?: string;
}): Promise<Conversation> {
  const { data, error } = await supabaseAdmin()
    .from('bot_conversations')
    .upsert(
      {
        channel: args.channel,
        external_id: args.external_id,
        customer_name: args.customer_name,
        customer_handle: args.customer_handle,
        customer_avatar: args.customer_avatar,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'channel,external_id', ignoreDuplicates: false },
    )
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function getConversation(channel: Channel, externalId: string): Promise<Conversation | null> {
  const { data } = await supabaseAdmin()
    .from('bot_conversations')
    .select('*')
    .eq('channel', channel)
    .eq('external_id', externalId)
    .maybeSingle();
  return data as Conversation | null;
}

export async function listConversations(limit = 50): Promise<Conversation[]> {
  const { data } = await supabaseAdmin()
    .from('bot_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Conversation[];
}

export async function appendMessage(args: {
  conversation_id: number;
  direction: 'in' | 'out';
  author: Author;
  text: string;
  external_id?: string;
  attachments?: unknown[];
  tokens_input?: number;
  tokens_output?: number;
  tools_used?: string[];
}): Promise<BotMessage | null> {
  const { data, error } = await supabaseAdmin()
    .from('bot_messages')
    .insert({
      conversation_id: args.conversation_id,
      direction: args.direction,
      author: args.author,
      text: args.text,
      external_id: args.external_id,
      attachments: args.attachments,
      tokens_input: args.tokens_input,
      tokens_output: args.tokens_output,
      tools_used: args.tools_used,
    })
    .select()
    .single();

  if (error) {
    // duplicate external_id = already processed, idempotent
    if (/duplicate/i.test(error.message)) return null;
    throw error;
  }

  // Bump unread + last_message_at on conversation
  if (args.direction === 'in') {
    await supabaseAdmin().rpc('exec_sql', {}).then(() => {}); // noop, we use raw below
    await supabaseAdmin()
      .from('bot_conversations')
      .update({
        last_message_at: new Date().toISOString(),
      })
      .eq('id', args.conversation_id);
  } else {
    await supabaseAdmin()
      .from('bot_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', args.conversation_id);
  }

  return data as BotMessage;
}

export async function listMessages(conversationId: number, limit = 50): Promise<BotMessage[]> {
  const { data } = await supabaseAdmin()
    .from('bot_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return (data ?? []) as BotMessage[];
}

export async function setConversationStatus(id: number, status: ConversationStatus): Promise<void> {
  await supabaseAdmin()
    .from('bot_conversations')
    .update({ status })
    .eq('id', id);
}
