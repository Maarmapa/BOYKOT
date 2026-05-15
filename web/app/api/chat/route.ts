import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM = `Eres el asistente de Boykot (boykot.cl), tienda especializada en arte y graffiti en Chile.
Distribuidores oficiales de Copic, Angelus, Holbein, Molotow, Createx, POSCA y otros.

Tono: español chileno informal, breve, cercano. Tutea siempre ("vos" o "tú" según fluya).

Tu trabajo:
- Recomendar productos del catálogo cuando alguien describe lo que quiere hacer
  (ilustración, customización de zapatillas, graffiti, acuarela, etc.).
- Explicar diferencias técnicas (alcohol vs acrílico, viscosidad, fijación).
- Sugerir sets para principiantes vs avanzados.
- Si no sabés un dato específico (stock, precio exacto, fecha de despacho),
  decí "te confirmo con la tienda" y mandá a https://wa.me/56223350961.

NO hagas:
- Inventar precios ni stock — el catálogo dinámico está fuera de tu alcance.
- Prometer despachos.
- Hablar de marcas que no vende Boykot.

Cierre siempre con 1-2 links a páginas relevantes del sitio cuando aplique.`;

const CATALOG_SNAPSHOT = BRAND_SLUGS.slice(0, 36).map(slug => {
  const b = BRANDS[slug];
  return `- ${b.brandName ?? ''} ${b.productName} → /colores/${slug} (${b.colors.length} colores, desde $${b.basePriceClp.toLocaleString('es-CL')})`;
}).join('\n');

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: 'El asistente aún no está activado. Mientras tanto, escribinos por WhatsApp: https://wa.me/56223350961',
    });
  }

  let body: { messages: Message[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const msgs = Array.isArray(body.messages) ? body.messages.slice(-20) : [];

  const client = new Anthropic({ apiKey });
  try {
    const completion = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: `${SYSTEM}\n\nCatálogo (parcial):\n${CATALOG_SNAPSHOT}`,
      messages: msgs.map(m => ({ role: m.role, content: m.content })),
    });

    const reply = completion.content
      .filter(c => c.type === 'text')
      .map(c => (c as { type: 'text'; text: string }).text)
      .join('\n')
      .trim();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[chat]', err);
    return NextResponse.json({
      reply: 'Tuve un problema al responder. Escribinos por WhatsApp: https://wa.me/56223350961',
    }, { status: 502 });
  }
}
