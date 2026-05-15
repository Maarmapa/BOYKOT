import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';
import { getProduct } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ───────────────────────── system prompt ─────────────────────────
const SYSTEM = `Eres el asistente de Boykot (boykot.cl), tienda chilena de arte y graffiti.
Distribuidores oficiales de Copic, Angelus, Holbein, Molotow, Createx, POSCA y más.

Tono: español chileno informal, breve, cercano. Tutea siempre.

Tu trabajo:
- Recomendar productos del catálogo cuando alguien describe lo que quiere hacer.
- Explicar diferencias técnicas (base alcohol vs acrílica, viscosidad, fijación).
- Sugerir sets para principiantes vs avanzados.
- Si la consulta es muy técnica o necesita logística (stock, despacho específico,
  facturación), dile que se contacte por WhatsApp: https://wa.me/56223350961

NO hagas:
- Inventar precios ni stock que no veas en los tools.
- Prometer despachos.
- Hablar de marcas que no vende Boykot.

Flujo:
1. Si el usuario describe un proyecto/uso, llamá search_products con palabras clave.
2. Si querés más detalle sobre un producto, llamá get_product con el slug.
3. Si quieren ver colores de una marca, llamá get_color_card con el brand-slug.
4. Cerrá con 1-2 links del sitio (formato markdown: [texto](/ruta)).

Ejemplos de brand-slug para get_color_card:
  copic-sketch, copic-ciao, copic-ink, angelus-standard-1oz, holbein-acuarela-15ml,
  molotow-premium, createx-airbrush-60ml, holbein-oleo-20ml.`;

// Slim cards summary — small, fits inside cache. Detalle pide por tool.
const BRAND_OVERVIEW = BRAND_SLUGS.slice(0, 36).map(slug => {
  const b = BRANDS[slug];
  return `- ${b.brandName ?? ''} ${b.productName} (slug: ${slug}, ${b.colors.length} colores, desde $${b.basePriceClp.toLocaleString('es-CL')})`;
}).join('\n');

// ───────────────────────── tools ─────────────────────────
const TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_products',
    description: 'Busca productos por nombre, marca o sku en el catálogo Boykot. Devuelve hasta 6 resultados con name, slug, brand, price.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto a buscar (ej "copic sketch e00", "angelus rojo", "acuarela 15ml")' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product',
    description: 'Devuelve detalle de un producto (descripción, precio, stock, gallery) por su slug.',
    input_schema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Slug exacto del producto, ej "marcador-copic-sketch-e00"' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'get_color_card',
    description: 'Devuelve los colores de una carta de color por brand-slug. Útil para mostrar variantes.',
    input_schema: {
      type: 'object',
      properties: {
        brand: { type: 'string', description: 'Brand-slug, ej "copic-sketch" o "angelus-standard-1oz"' },
      },
      required: ['brand'],
    },
  },
];

// ───────────────────────── tool runtime ─────────────────────────
interface SlimProduct {
  slug: string;
  name: string;
  sku: string | null;
  price: number | null;
  image: string | null;
  cat: string | null;
  brand: string | null;
}

let _index: SlimProduct[] | null = null;
function searchIndex(): SlimProduct[] {
  if (_index) return _index;
  const file = path.join(process.cwd(), 'public', 'products-index.json');
  _index = JSON.parse(fs.readFileSync(file, 'utf8')) as SlimProduct[];
  return _index;
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function runTool(name: string, input: Record<string, unknown>): unknown {
  if (name === 'search_products') {
    const q = String(input.query || '').trim();
    if (q.length < 2) return { results: [] };
    const idx = searchIndex();
    const qn = normalize(q);
    const tokens = qn.split(/\s+/).filter(Boolean);
    const scored: Array<{ p: SlimProduct; s: number }> = [];
    for (const p of idx) {
      const hay = normalize(`${p.name} ${p.sku ?? ''} ${p.brand ?? ''}`);
      let s = 0;
      for (const t of tokens) if (hay.includes(t)) s += t.length;
      if (hay.startsWith(qn)) s += 10;
      if (hay.includes(qn)) s += 5;
      if (s > 0) scored.push({ p, s });
    }
    scored.sort((a, b) => b.s - a.s);
    return {
      results: scored.slice(0, 6).map(({ p }) => ({
        slug: p.slug, name: p.name, brand: p.brand, price: p.price,
      })),
    };
  }

  if (name === 'get_product') {
    const slug = String(input.slug || '');
    const p = getProduct(slug);
    if (!p) return { error: 'producto no encontrado' };
    return {
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      availability: p.availability,
      description: p.description.slice(0, 600),
      url: `/producto/${p.slug}`,
    };
  }

  if (name === 'get_color_card') {
    const brand = String(input.brand || '');
    const b = BRANDS[brand];
    if (!b) return { error: 'brand no encontrado' };
    return {
      brandName: b.brandName,
      productName: b.productName,
      slug: brand,
      url: `/colores/${brand}`,
      basePrice: b.basePriceClp,
      colorsTotal: b.colors.length,
      // Just first 12 colors as a preview; agent doesn't need all 358
      preview: b.colors.slice(0, 12).map(c => ({ code: c.code, name: c.name })),
    };
  }

  return { error: 'unknown tool' };
}

// ───────────────────────── handler ─────────────────────────
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// In-memory rate limit per IP. Vercel functions cold-start frequently so this
// is best-effort, not strict. 20 messages / 10 min keeps abuse manageable.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const rateMap = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    rateMap.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateMap.set(ip, arr);
  return false;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply: 'El asistente aún no está activado. Mientras tanto, escribinos por WhatsApp: https://wa.me/56223350961',
    });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { reply: 'Estás escribiendo muy rápido. Probá de nuevo en un ratito o escribime por WhatsApp: https://wa.me/56223350961' },
      { status: 429 },
    );
  }

  let body: { messages: Message[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }
  const incoming = Array.isArray(body.messages) ? body.messages.slice(-20) : [];

  const client = new Anthropic({ apiKey });

  // System with prompt caching — cache_control on the catalog snapshot so it's
  // billed once per 5-minute window across all conversations.
  const system: Anthropic.TextBlockParam[] = [
    { type: 'text', text: SYSTEM },
    {
      type: 'text',
      text: `\nCatálogo principal (carta de color por marca):\n${BRAND_OVERVIEW}`,
      cache_control: { type: 'ephemeral' },
    },
  ];

  // Convert messages to API shape
  const apiMessages: Anthropic.MessageParam[] = incoming.map(m => ({
    role: m.role,
    content: m.content,
  }));

  try {
    // Tool-use loop: model may call tools; we run them and feed back.
    let iterations = 0;
    while (iterations++ < 4) {
      const completion = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system,
        tools: TOOLS,
        messages: apiMessages,
      });

      // Collect tool uses; if none, return text
      const toolUses = completion.content.filter(
        (c): c is Anthropic.ToolUseBlock => c.type === 'tool_use',
      );

      if (toolUses.length === 0 || completion.stop_reason === 'end_turn') {
        const text = completion.content
          .filter((c): c is Anthropic.TextBlock => c.type === 'text')
          .map(c => c.text)
          .join('\n')
          .trim();
        return NextResponse.json({
          reply: text || 'No supe qué responder. Escribinos por WhatsApp: https://wa.me/56223350961',
          usage: completion.usage,
        });
      }

      // Feed assistant's tool_use blocks back, then run each tool and send tool_result
      apiMessages.push({ role: 'assistant', content: completion.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map(tu => ({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(runTool(tu.name, tu.input as Record<string, unknown>)),
      }));
      apiMessages.push({ role: 'user', content: toolResults });
    }

    return NextResponse.json({
      reply: 'Tu pregunta requiere más vueltas que las que puedo dar. Escribinos por WhatsApp: https://wa.me/56223350961',
    });
  } catch (err) {
    console.error('[chat]', err);
    return NextResponse.json(
      { reply: 'Tuve un problema al responder. Escribinos por WhatsApp: https://wa.me/56223350961' },
      { status: 502 },
    );
  }
}
