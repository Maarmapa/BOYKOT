// Quotes / cotizaciones helpers server-side.

import 'server-only';
import { supabaseAdmin } from './supabase';
import crypto from 'crypto';

export type QuoteStatus = 'draft' | 'sent' | 'converted' | 'expired' | 'cancelled';
export type ItemMatchStatus = 'matched' | 'not_found' | 'manual_alternative';

export interface Quote {
  id: number;
  short_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_company: string | null;
  customer_rut: string | null;
  customer_phone: string | null;
  customer_project: string | null;
  raw_input: string | null;
  customer_notes: string | null;
  internal_notes: string | null;
  subtotal_clp: number;
  iva_clp: number;
  total_clp: number;
  status: QuoteStatus;
  valid_until: string;
  is_b2b: boolean;
  source: string;
  created_at: string;
  updated_at: string;
  converted_order_id: string | null;
}

export interface QuoteItem {
  id: number;
  quote_id: number;
  position: number;
  product_slug: string | null;
  product_name: string;
  product_sku: string | null;
  product_brand: string | null;
  product_image: string | null;
  product_url: string | null;
  qty: number;
  unit_price_clp: number;
  line_total_clp: number;
  stock_available: number | null;
  match_confidence: number;
  raw_match: string | null;
  match_status: ItemMatchStatus;
  created_at: string;
}

export interface CreateQuoteInput {
  customer_email?: string;
  customer_name?: string;
  customer_company?: string;
  customer_rut?: string;
  customer_phone?: string;
  customer_project?: string;
  raw_input?: string;
  customer_notes?: string;
  is_b2b?: boolean;
  source?: 'webform' | 'dm-bot' | 'admin' | 'api';
  client_ip?: string;
  items: Array<{
    product_slug?: string;
    product_name: string;
    product_sku?: string;
    product_brand?: string;
    product_image?: string;
    product_url?: string;
    qty: number;
    unit_price_clp: number;
    stock_available?: number;
    match_confidence?: number;
    raw_match?: string;
    match_status?: ItemMatchStatus;
  }>;
}

const IVA_RATE = 0.19;

function generateShortId(): string {
  // 8 chars: BK-XXXXX
  return 'BK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function createQuote(input: CreateQuoteInput): Promise<Quote> {
  const subtotal = input.items.reduce((s, i) => s + i.qty * i.unit_price_clp, 0);
  const iva = Math.round(subtotal * IVA_RATE);
  const total = subtotal + iva;

  // Try a few times in case of short_id collision (extremely unlikely)
  for (let attempt = 0; attempt < 3; attempt++) {
    const shortId = generateShortId();
    const { data: quoteData, error: quoteError } = await supabaseAdmin()
      .from('quotes')
      .insert({
        short_id: shortId,
        customer_email: input.customer_email?.toLowerCase() || null,
        customer_name: input.customer_name || null,
        customer_company: input.customer_company || null,
        customer_rut: input.customer_rut || null,
        customer_phone: input.customer_phone || null,
        customer_project: input.customer_project || null,
        raw_input: input.raw_input || null,
        customer_notes: input.customer_notes || null,
        is_b2b: input.is_b2b ?? false,
        source: input.source || 'webform',
        client_ip: input.client_ip || null,
        subtotal_clp: subtotal,
        iva_clp: iva,
        total_clp: total,
      })
      .select()
      .single();

    if (quoteError) {
      if (/duplicate/i.test(quoteError.message) && attempt < 2) continue;
      throw quoteError;
    }

    const quote = quoteData as Quote;

    if (input.items.length > 0) {
      const itemRows = input.items.map((item, idx) => ({
        quote_id: quote.id,
        position: idx,
        product_slug: item.product_slug || null,
        product_name: item.product_name,
        product_sku: item.product_sku || null,
        product_brand: item.product_brand || null,
        product_image: item.product_image || null,
        product_url: item.product_url || null,
        qty: item.qty,
        unit_price_clp: item.unit_price_clp,
        line_total_clp: item.qty * item.unit_price_clp,
        stock_available: item.stock_available ?? null,
        match_confidence: item.match_confidence ?? 1.0,
        raw_match: item.raw_match || null,
        match_status: item.match_status || 'matched',
      }));
      const { error: itemsError } = await supabaseAdmin().from('quote_items').insert(itemRows);
      if (itemsError) throw itemsError;
    }

    return quote;
  }

  throw new Error('failed to generate unique short_id after 3 attempts');
}

export async function getQuoteByShortId(shortId: string): Promise<(Quote & { items: QuoteItem[] }) | null> {
  const { data: quote } = await supabaseAdmin()
    .from('quotes')
    .select('*')
    .eq('short_id', shortId)
    .maybeSingle();
  if (!quote) return null;

  const { data: items } = await supabaseAdmin()
    .from('quote_items')
    .select('*')
    .eq('quote_id', (quote as Quote).id)
    .order('position', { ascending: true });

  return { ...(quote as Quote), items: (items ?? []) as QuoteItem[] };
}

export async function listQuotes(limit = 100): Promise<Quote[]> {
  const { data } = await supabaseAdmin()
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as Quote[];
}

export async function updateQuoteStatus(shortId: string, status: QuoteStatus): Promise<void> {
  await supabaseAdmin()
    .from('quotes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('short_id', shortId);
}
