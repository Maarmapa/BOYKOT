// GET /api/cron/back-in-stock?secret=...
// Cron Vercel — corre cada hora.
//
// Para cada suscripcion pendiente:
//   1. Consulta stock actual del variant_id en bsale_stock_snapshot
//   2. Si stock > 0, marca notified=true + manda email (Brevo)
//   3. Si Brevo no esta configurado, log y marca notified igual
//      (no queremos quedarnos con backlog gigante)
//
// Configurar en vercel.json:
//   { "crons": [{ "path": "/api/cron/back-in-stock", "schedule": "0 * * * *" }] }

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'hola@boykot.cl';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Boykot';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

interface BISAlert {
  id: number;
  email: string;
  product_slug: string;
  product_name: string | null;
  product_sku: string | null;
  variant_id: number | null;
}

async function sendBackInStockEmail(alert: BISAlert): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log(`[back-in-stock] no BREVO_API_KEY, skipping mail for ${alert.email}`);
    return true; // marca notified igual
  }

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
    <div style="background:#0066ff;color:#fff;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
      <div style="font-size:32px;margin-bottom:4px">🎨 ¡Volvió!</div>
      <h1 style="font-size:20px;margin:0">El producto que pediste tiene stock</h1>
    </div>
    <p style="font-size:15px;line-height:1.6">
      Hola! Recordá que te suscribiste para que te avisemos cuando vuelva el siguiente producto:
    </p>
    <div style="background:#f8f8f8;padding:20px;border-radius:8px;margin:20px 0">
      <div style="font-weight:600;font-size:16px;color:#222">${alert.product_name || alert.product_slug}</div>
      ${alert.product_sku ? `<div style="font-size:12px;color:#777;font-family:monospace;margin-top:4px">SKU: ${alert.product_sku}</div>` : ''}
    </div>
    <p style="font-size:14px;line-height:1.6">¡Ya hay stock disponible! Andate corriendo antes que se vaya de nuevo.</p>
    <a href="${SITE}/producto/${alert.product_slug}" style="display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600;margin:16px 0">
      Ver producto →
    </a>
    <p style="margin-top:32px;font-size:12px;color:#777">Si ya no te interesa, podés ignorar este mail.</p>
    <p style="font-size:11px;color:#aaa">Boykot · <a href="${SITE}" style="color:#aaa">boykot.cl</a></p>
  </body></html>`;

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        sender: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: alert.email }],
        subject: `🎨 Volvió: ${alert.product_name || alert.product_slug}`,
        htmlContent: html,
        tags: ['back-in-stock'],
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('[back-in-stock] brevo error', e);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.nextUrl.searchParams.get('secret') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (expected && provided !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 1. Cargar suscripciones pendientes (con variant_id)
  const { data: alerts } = await supabaseAdmin()
    .from('back_in_stock_alerts')
    .select('id, email, product_slug, product_name, product_sku, variant_id')
    .eq('notified', false)
    .not('variant_id', 'is', null)
    .limit(200);

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, sent: 0 });
  }

  // 2. Cargar stock actual de los variant_ids relevantes
  const variantIds = Array.from(new Set((alerts as BISAlert[]).map(a => a.variant_id).filter((v): v is number => v != null)));
  const { data: stockRows } = await supabaseAdmin()
    .from('bsale_stock_snapshot')
    .select('variant_id, stock')
    .in('variant_id', variantIds);

  const stockMap = new Map<number, number>();
  for (const row of (stockRows ?? []) as { variant_id: number; stock: number }[]) {
    stockMap.set(row.variant_id, row.stock);
  }

  // 3. Para cada alerta con stock > 0, mandar email + marcar notified
  let sent = 0;
  for (const alert of alerts as BISAlert[]) {
    if (!alert.variant_id) continue;
    const stock = stockMap.get(alert.variant_id);
    if (stock == null || stock <= 0) continue;

    const ok = await sendBackInStockEmail(alert);
    if (ok) {
      await supabaseAdmin()
        .from('back_in_stock_alerts')
        .update({ notified: true, notified_at: new Date().toISOString() })
        .eq('id', alert.id);
      sent++;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: alerts.length,
    sent,
    in_stock_count: alerts.filter(a => a.variant_id != null && (stockMap.get(a.variant_id) ?? 0) > 0).length,
  });
}
