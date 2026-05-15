import 'server-only';
import type { Cart } from './types';

// Lazy import so Resend isn't loaded if RESEND_API_KEY is unset.
async function resend() {
  const { Resend } = await import('resend');
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY missing');
  return new Resend(key);
}

const FROM = process.env.EMAIL_FROM || 'Boykot <hola@boykot.cl>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

type Variant = '1h' | '24h' | '72h';

const SUBJECTS: Record<Variant, string> = {
  '1h': '¿Olvidaste algo en tu carro? 🎨',
  '24h': 'Tus colores te están esperando',
  '72h': 'Última oportunidad — recupera tu selección',
};

export async function sendAbandonedCartEmail(cart: Cart, variant: Variant): Promise<string | null> {
  if (!cart.email) return null;

  const html = renderHtml(cart, variant);
  const r = await resend();
  const { data, error } = await r.emails.send({
    from: FROM,
    to: cart.email,
    subject: SUBJECTS[variant],
    html,
  });
  if (error) throw new Error(error.message);
  return data?.id ?? null;
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
