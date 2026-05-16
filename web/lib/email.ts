import 'server-only';
import type { Cart } from './types';

// Brevo (formerly Sendinblue) transactional email API.
// Direct HTTPS — no SDK dependency.
// Docs: https://developers.brevo.com/reference/sendtransacemail

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = process.env.EMAIL_FROM_ADDRESS || 'hola@boykot.cl';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Boykot';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

type Variant = '1h' | '24h' | '72h';

const SUBJECTS: Record<Variant, string> = {
  '1h': '¿Olvidaste algo en tu carro?',
  '24h': 'Tus colores te están esperando',
  '72h': 'Última oportunidad — recupera tu selección',
};

interface BrevoResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

export async function sendAbandonedCartEmail(cart: Cart, variant: Variant): Promise<string | null> {
  if (!cart.email) return null;
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error('BREVO_API_KEY missing');

  const html = renderHtml(cart, variant);
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: cart.email, name: cart.customer_name || undefined }],
      subject: SUBJECTS[variant],
      htmlContent: html,
      tags: ['abandoned-cart', `abandoned-${variant}`],
    }),
  });

  const data = (await res.json()) as BrevoResponse;
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${data.message || data.code || 'unknown'}`);
  return data.messageId ?? null;
}

function renderHtml(cart: Cart, variant: Variant): string {
  const lines = cart.items
    .map(i =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escape(i.name)}${
        i.color_code ? ` · <strong>${escape(i.color_code)}</strong>` : ''
      }</td><td style="text-align:right;padding:8px 0;border-bottom:1px solid #eee">× ${i.qty}</td></tr>`
    )
    .join('');
  const total = new Intl.NumberFormat('es-CL').format(cart.total_clp);
  const recoverUrl = `${SITE}/carrito?cart=${cart.id}`;

  const hooks: Record<Variant, string> = {
    '1h': 'Vimos que dejaste algunos colores en tu carro. Están reservados por 15 minutos — completá tu compra antes de que se vayan a otra obra.',
    '24h': 'Tus colores siguen esperándote. El stock se mueve rápido: cuando un artista los necesita, vuelan.',
    '72h': 'Última oportunidad antes de que liberemos tu reserva. Si los querés, este es el momento.',
  };

  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222">
    <h1 style="font-size:20px;margin:0 0 16px">${escape(SUBJECTS[variant])}</h1>
    <p style="font-size:15px;line-height:1.5">${escape(hooks[variant])}</p>
    <table style="width:100%;margin:24px 0;border-collapse:collapse;font-size:14px">${lines}
      <tr><td style="padding:12px 0;font-weight:600">Total</td><td style="text-align:right;padding:12px 0;font-weight:600">$${total} CLP</td></tr>
    </table>
    <a href="${recoverUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:600">Recuperar mi carro →</a>
    <p style="margin-top:32px;font-size:12px;color:#777">Boykot · Av. Providencia 2251, Santiago · <a href="${SITE}" style="color:#777">boykot.cl</a></p>
  </body></html>`;
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// ───────────────────────── Order emails ─────────────────────────

interface OrderEmailInput {
  short_id: string;
  customer: { name: string; email: string; phone: string; rut?: string };
  shipping: { address?: string; city?: string; store_pickup: boolean };
  items: Array<{
    name: string;
    color_code?: string;
    qty: number;
    unit_price_clp: number;
    image_url?: string;
    brand?: string;
  }>;
  subtotal_clp: number;
  shipping_clp: number;
  total_clp: number;
  notes?: string;
  whatsapp_url?: string;
}

/**
 * Email al cliente con copia de su pedido. Sirve como respaldo del
 * WhatsApp (en caso que el mensaje no se mande o se pierda).
 */
export async function sendOrderConfirmationToCustomer(order: OrderEmailInput): Promise<string | null> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY missing, skipping customer confirmation');
    return null;
  }

  const html = renderCustomerHtml(order);
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: order.customer.email, name: order.customer.name }],
      subject: `Recibimos tu pedido · ${order.short_id}`,
      htmlContent: html,
      tags: ['order-confirmation', 'whatsapp-checkout'],
    }),
  });
  const data = (await res.json()) as BrevoResponse;
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${data.message || data.code || 'unknown'}`);
  return data.messageId ?? null;
}

/**
 * Email al admin con el pedido nuevo. Permite responder rápido aún si no
 * está mirando el dashboard ni el WhatsApp.
 */
export async function sendOrderNotificationToAdmin(order: OrderEmailInput): Promise<string | null> {
  const apiKey = process.env.BREVO_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || 'providencia@boykot.cl';
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY missing, skipping admin notification');
    return null;
  }

  const html = renderAdminHtml(order);
  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: adminEmail, name: 'Boykot Admin' }],
      replyTo: { email: order.customer.email, name: order.customer.name },
      subject: `🛒 Nuevo pedido ${order.short_id} · $${order.total_clp.toLocaleString('es-CL')} · ${order.customer.name}`,
      htmlContent: html,
      tags: ['admin-notification', 'whatsapp-checkout'],
    }),
  });
  const data = (await res.json()) as BrevoResponse;
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${data.message || data.code || 'unknown'}`);
  return data.messageId ?? null;
}

function renderCustomerHtml(order: OrderEmailInput): string {
  // Rich item rows with image thumbnail + brand badge
  const rows = order.items.map(i => {
    const label = i.color_code ? `${escape(i.color_code)} · ${escape(i.name)}` : escape(i.name);
    const lineTotal = (i.unit_price_clp * i.qty).toLocaleString('es-CL');
    const imgTd = i.image_url
      ? `<td style="padding:12px 12px 12px 0;border-bottom:1px solid #eee;width:60px"><img src="${escape(i.image_url)}" alt="" width="60" height="60" style="border-radius:8px;display:block;object-fit:cover" /></td>`
      : `<td style="padding:12px 12px 12px 0;border-bottom:1px solid #eee;width:60px"></td>`;
    const brandLine = i.brand ? `<div style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px;font-weight:600">${escape(i.brand)}</div>` : '';
    return `<tr>
      ${imgTd}
      <td style="padding:12px 0;border-bottom:1px solid #eee">
        ${brandLine}
        <div style="font-weight:500">${label}</div>
        <div style="font-size:12px;color:#777;margin-top:2px">× ${i.qty} · $${i.unit_price_clp.toLocaleString('es-CL')} c/u</div>
      </td>
      <td style="text-align:right;padding:12px 0;border-bottom:1px solid #eee;font-weight:600;white-space:nowrap">$${lineTotal}</td>
    </tr>`;
  }).join('');

  const shippingLine = order.shipping.store_pickup
    ? 'Retiro en tienda · Av. Providencia 2251, local 69 · Metro Los Leones'
    : `${escape(order.shipping.address ?? '')}${order.shipping.city ? ', ' + escape(order.shipping.city) : ''}`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#222">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f5f5f5;padding:24px 12px">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">

          <!-- Header dark con logo -->
          <tr><td style="background:#111827;padding:32px 32px 24px">
            <div style="color:#0066ff;font-weight:700;letter-spacing:4px;text-transform:uppercase;font-size:14px;margin-bottom:8px">BOYKOT</div>
            <h1 style="color:#fff;font-size:28px;margin:0;font-weight:700;line-height:1.2">Recibimos tu pedido 🎨</h1>
            <div style="color:#9ca3af;font-size:13px;margin-top:8px">
              Número: <strong style="font-family:'SF Mono','Courier New',monospace;color:#fff">${escape(order.short_id)}</strong>
            </div>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:32px">
            <p style="font-size:15px;line-height:1.6;margin:0 0 24px">
              Hola <strong>${escape(order.customer.name)}</strong>,<br>
              recibimos tu pedido. <strong>Te confirmamos stock + link de pago por WhatsApp en máx 2 hrs hábiles.</strong>
            </p>

            <!-- Items table -->
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;border-collapse:collapse;font-size:14px">
              ${rows}
              <tr><td colspan="3" style="padding:14px 0 6px 0;color:#777;font-size:13px">Subtotal</td>
                <td style="text-align:right;padding:14px 0 6px 0;font-weight:500"></td></tr>
              <tr><td colspan="2" style="padding:0 0 6px 0;color:#777;font-size:13px">Subtotal</td>
                <td style="text-align:right;padding:0 0 6px 0;font-weight:500">$${order.subtotal_clp.toLocaleString('es-CL')}</td></tr>
              <tr><td colspan="2" style="padding:0 0 6px 0;color:#777;font-size:13px">Despacho</td>
                <td style="text-align:right;padding:0 0 6px 0;font-weight:500">${order.shipping.store_pickup ? 'Retiro en tienda' : (order.shipping_clp === 0 ? 'Gratis' : '$' + order.shipping_clp.toLocaleString('es-CL'))}</td></tr>
              <tr><td colspan="2" style="padding:12px 0;font-weight:700;font-size:17px;border-top:2px solid #111827">Total CLP</td>
                <td style="text-align:right;padding:12px 0;font-weight:700;font-size:17px;border-top:2px solid #111827">$${order.total_clp.toLocaleString('es-CL')}</td></tr>
            </table>

            <!-- Despacho card -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 18px;border-radius:8px;margin:24px 0;font-size:13px;line-height:1.7">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;color:#6b7280;margin-bottom:8px">Despacho</div>
              ${shippingLine}
            </div>
            <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 18px;border-radius:8px;margin:0 0 24px;font-size:13px;line-height:1.7">
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;color:#6b7280;margin-bottom:8px">Contacto</div>
              ${escape(order.customer.name)}<br>
              ${escape(order.customer.email)}<br>
              ${escape(order.customer.phone)}
              ${order.customer.rut ? `<br><span style="color:#6b7280">RUT:</span> ${escape(order.customer.rut)}` : ''}
            </div>

            ${order.whatsapp_url ? `
              <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">
                <tr><td align="center" style="padding:8px 0 16px">
                  <a href="${order.whatsapp_url}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:16px 32px;border-radius:8px;font-weight:600;font-size:15px">
                    Confirmar por WhatsApp →
                  </a>
                </td></tr>
              </table>
            ` : ''}
          </td></tr>

          <!-- Footer -->
          <tr><td style="background:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.6">
              ¿Dudas? Respondé este mail o escribinos a
              <a href="mailto:providencia@boykot.cl" style="color:#0066ff;text-decoration:none">providencia@boykot.cl</a>
            </p>
            <p style="margin:0;font-size:11px;color:#9ca3af">
              Boykot · Av. Providencia 2251, Santiago · <a href="${SITE}" style="color:#9ca3af;text-decoration:none">boykot.cl</a>
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function renderAdminHtml(order: OrderEmailInput): string {
  const rows = order.items.map(i => {
    const label = i.color_code ? `${escape(i.color_code)} · ${escape(i.name)}` : escape(i.name);
    return `<tr><td style="padding:6px 0">${label}</td><td style="text-align:right;padding:6px 0">× ${i.qty}</td><td style="text-align:right;padding:6px 0">$${(i.unit_price_clp * i.qty).toLocaleString('es-CL')}</td></tr>`;
  }).join('');

  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
    <h2 style="margin:0 0 8px">🛒 Nuevo pedido WhatsApp</h2>
    <p style="font-size:13px;color:#777;margin:0 0 16px"><strong style="font-family:monospace">${escape(order.short_id)}</strong> · ${new Date().toLocaleString('es-CL')}</p>

    <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0">
      <tr style="background:#f8f8f8"><th style="text-align:left;padding:6px">Cliente</th><td colspan="2" style="padding:6px">${escape(order.customer.name)}</td></tr>
      <tr><th style="text-align:left;padding:6px">Email</th><td colspan="2" style="padding:6px"><a href="mailto:${escape(order.customer.email)}">${escape(order.customer.email)}</a></td></tr>
      <tr style="background:#f8f8f8"><th style="text-align:left;padding:6px">Teléfono</th><td colspan="2" style="padding:6px"><a href="tel:${escape(order.customer.phone)}">${escape(order.customer.phone)}</a></td></tr>
      ${order.customer.rut ? `<tr><th style="text-align:left;padding:6px">RUT</th><td colspan="2" style="padding:6px">${escape(order.customer.rut)}</td></tr>` : ''}
      <tr style="background:#f8f8f8"><th style="text-align:left;padding:6px">Despacho</th><td colspan="2" style="padding:6px">${order.shipping.store_pickup ? '📍 Retiro tienda' : escape(order.shipping.address ?? '') + (order.shipping.city ? ', ' + escape(order.shipping.city) : '')}</td></tr>
      ${order.notes ? `<tr><th style="text-align:left;padding:6px;vertical-align:top">Notas</th><td colspan="2" style="padding:6px">${escape(order.notes)}</td></tr>` : ''}
    </table>

    <h3 style="font-size:14px;margin:24px 0 8px">Items</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      ${rows}
      <tr style="border-top:2px solid #222"><td colspan="2" style="padding:8px 0;font-weight:700">Total</td><td style="text-align:right;padding:8px 0;font-weight:700">$${order.total_clp.toLocaleString('es-CL')}</td></tr>
    </table>

    <p style="margin:24px 0 8px"><a href="${SITE}/admin/orders" style="display:inline-block;background:#0066ff;color:#fff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600">Ver en admin →</a></p>

    <p style="margin-top:16px;font-size:12px;color:#777">Respondé este mail para escribirle directo al cliente.</p>
  </body></html>`;
}

// ───────────────────────── Payment confirmation ─────────────────────────

interface PaymentEmailInput {
  short_id: string;
  customer_email: string;
  customer_name?: string;
  total_clp: number;
  payment_reference: string;
  payment_method?: string;
}

/**
 * Cuando MP confirma el pago (webhook approved), mandamos email al cliente
 * cerrando el loop. Best-effort: si falla, NO bloqueamos el webhook.
 */
export async function sendPaymentConfirmation(input: PaymentEmailInput): Promise<string | null> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY missing, skipping payment confirmation');
    return null;
  }

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222">
    <div style="background:#10b981;color:#fff;padding:18px;border-radius:8px;text-align:center;margin-bottom:24px">
      <div style="font-size:32px;margin-bottom:4px">✓</div>
      <h1 style="font-size:22px;margin:0">Pago confirmado</h1>
    </div>
    <p style="font-size:13px;color:#777;margin:0 0 24px">Pedido: <strong style="font-family:monospace;color:#222">${escape(input.short_id)}</strong></p>
    <p style="font-size:15px;line-height:1.6">${input.customer_name ? `Hola ${escape(input.customer_name)}, ` : ''}recibimos tu pago de <strong>$${input.total_clp.toLocaleString('es-CL')} CLP</strong>. Estamos preparando tu pedido — te avisamos por WhatsApp cuando esté listo para retiro o envío.</p>
    <div style="background:#f8f8f8;padding:16px;border-radius:8px;margin:24px 0;font-size:13px;line-height:1.6">
      <strong>Referencia de pago:</strong> ${escape(input.payment_reference)}<br>
      ${input.payment_method ? `<strong>Método:</strong> ${escape(input.payment_method)}<br>` : ''}
      <strong>Total:</strong> $${input.total_clp.toLocaleString('es-CL')} CLP
    </div>
    <p style="margin-top:32px;font-size:12px;color:#777">¿Dudas? Respondé este mail o escribinos a <a href="mailto:providencia@boykot.cl" style="color:#777">providencia@boykot.cl</a>.</p>
    <p style="font-size:11px;color:#aaa">Boykot · Av. Providencia 2251, Santiago · <a href="${SITE}" style="color:#aaa">boykot.cl</a></p>
  </body></html>`;

  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: { 'accept': 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      sender: { email: FROM_EMAIL, name: FROM_NAME },
      to: [{ email: input.customer_email, name: input.customer_name }],
      subject: `✓ Pago confirmado · ${input.short_id}`,
      htmlContent: html,
      tags: ['payment-confirmation', 'mp-webhook'],
    }),
  });
  const data = (await res.json()) as BrevoResponse;
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${data.message || data.code || 'unknown'}`);
  return data.messageId ?? null;
}
