// GET /api/bsale/selftest — confirma que BSALE_ACCESS_TOKEN funciona y
// te devuelve los datos que necesitás para configurar el resto de env vars:
//   - tu cpn_id (BSALE_CPN_ID)
//   - lista de oficinas (BSALE_OFFICE_ID — elegí la de Providencia)
//   - prueba de stock en Copic Sketch (productId 2167) para sanity check
//
// Protegido por el mismo BSALE_WEBHOOK_TOKEN cuando esté set; si no, deja
// pasar (pero el endpoint no expone info sensible, solo IDs de admin).

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = 'https://api.bsale.io/v1';

async function call(path: string, token: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { access_token: token, accept: 'application/json' },
    cache: 'no-store',
  });
  const body = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(body); } catch { /* keep raw */ }
  return { status: res.status, ok: res.ok, body: json ?? body };
}

export async function GET(req: NextRequest) {
  const token = process.env.BSALE_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({
      ok: false,
      error: 'BSALE_ACCESS_TOKEN no está set en Vercel',
    }, { status: 500 });
  }

  // Optional gate: if BSALE_WEBHOOK_TOKEN is set, require ?token= to match.
  const gate = process.env.BSALE_WEBHOOK_TOKEN;
  if (gate && req.nextUrl.searchParams.get('token') !== gate) {
    return NextResponse.json({
      ok: false,
      error: 'unauthorized — pasa ?token=<BSALE_WEBHOOK_TOKEN> en la query',
    }, { status: 401 });
  }

  const out: Record<string, unknown> = {
    access_token_set: true,
    access_token_preview: `${token.slice(0, 8)}…${token.slice(-4)}`,
    bsale_webhook_token_set: !!process.env.BSALE_WEBHOOK_TOKEN,
    bsale_cpn_id_set: !!process.env.BSALE_CPN_ID,
    bsale_office_id_set: !!process.env.BSALE_OFFICE_ID,
  };

  // 1. Account / company info — tiene el cpn_id ahí
  const account = await call('/users.json?limit=1', token);
  out.account_check = {
    status: account.status,
    sample: account.ok && account.body && typeof account.body === 'object'
      ? account.body
      : 'error',
  };

  // 2. Oficinas
  const offices = await call('/offices.json?limit=25', token);
  out.offices = {
    status: offices.status,
    items: offices.ok && offices.body && typeof offices.body === 'object' && 'items' in offices.body
      ? (offices.body as { items: Array<Record<string, unknown>> }).items.map(o => ({
          id: o.id,
          name: o.name,
          isDefault: o.isDefault,
        }))
      : offices.body,
  };

  // 3. Sucursales (some BSale accounts call them differently)
  const docTypes = await call('/document_types.json?limit=5', token);
  out.document_types_check = {
    status: docTypes.status,
    count: docTypes.ok && docTypes.body && typeof docTypes.body === 'object' && 'count' in docTypes.body
      ? (docTypes.body as { count: number }).count
      : null,
  };

  // 4. Stock sanity check — Copic Sketch product (bsaleProductId 2167)
  const stock = await call('/stocks.json?productid=2167&limit=3', token);
  out.stock_sample_copic_sketch = {
    status: stock.status,
    sample: stock.ok && stock.body && typeof stock.body === 'object' && 'items' in stock.body
      ? (stock.body as { items: unknown[] }).items.slice(0, 3)
      : stock.body,
  };

  out.next_steps = [
    'Si offices.items tiene tu sucursal Providencia, agregá BSALE_OFFICE_ID en Vercel con ese id.',
    'Generá BSALE_WEBHOOK_TOKEN con `openssl rand -hex 32` y agregalo en Vercel.',
    'Buscá tu cpn_id en BSale admin (Configuración → Cuenta → "Cuenta") o pedíselo al soporte BSale, y agregá BSALE_CPN_ID.',
    'Una vez configurados los tres, andá a BSale admin → Configuración → Notificaciones de Sistema → Crear y apuntá a https://boykot.cl/api/webhooks/bsale?token=<BSALE_WEBHOOK_TOKEN>',
    'Suscribí topics: documents, products, variants, stock, prices.',
  ];

  return NextResponse.json(out, {
    headers: { 'cache-control': 'no-store' },
  });
}
