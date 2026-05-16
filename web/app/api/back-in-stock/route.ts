// POST /api/back-in-stock
// Body: { email, product_slug, product_name?, product_sku?, variant_id? }
//
// Cliente pide ser notificado cuando un producto agotado vuelva al stock.
// Idempotent: si ya esta suscrito al mismo producto, no duplica.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Body {
  email?: string;
  product_slug?: string;
  product_name?: string;
  product_sku?: string;
  variant_id?: number;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try { body = (await req.json()) as Body; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const email = (body.email || '').trim().toLowerCase();
  const slug = (body.product_slug || '').trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (!slug) {
    return NextResponse.json({ error: 'product_slug_required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin()
      .from('back_in_stock_alerts')
      .insert({
        email,
        product_slug: slug,
        product_name: body.product_name || null,
        product_sku: body.product_sku || null,
        variant_id: body.variant_id || null,
      });

    // unique violation = ya estaba suscrito → idempotent OK
    if (error && !/duplicate/i.test(error.message)) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'storage_failed', message: (e as Error).message }, { status: 500 });
  }
}
