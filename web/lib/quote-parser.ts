// Parse free-text customer input into structured quote items using Claude.
// El cliente B2B pega algo como:
//   "Necesito para proyecto INJUV:
//    50 Copic Sketch surtidos
//    20 Angelus 1oz negro y blanco (10 cada uno)
//    pinceles, lapices grafito surtidos
//    100 papeles A3"
//
// Claude usa las mismas tools del bot (search_products, check_stock_by_sku)
// para identificar y matchear contra catálogo, devolviendo array JSON estructurado.

import 'server-only';
import { findProducts, getProductBySku, enrichWithStock, type LookupProduct } from './lookup';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';

export interface ParsedQuoteItem {
  product_slug?: string;
  product_name: string;
  product_sku?: string | null;
  product_brand?: string | null;
  product_image?: string | null;
  product_url?: string;
  qty: number;
  unit_price_clp: number;
  stock_available?: number | null;
  match_confidence: number;
  raw_match: string;
  match_status: 'matched' | 'not_found';
}

interface ToolUseBlock { type: 'tool_use'; id: string; name: string; input: Record<string, unknown>; }
interface TextBlock { type: 'text'; text: string; }
type ContentBlock = ToolUseBlock | TextBlock;

interface ClaudeResponse {
  content: ContentBlock[];
  stop_reason: string;
  usage: { input_tokens: number; output_tokens: number };
}

const SYSTEM_PROMPT = `Eres un parser experto del catálogo Boykot (materiales arte/graffiti).
Te dan texto libre con una lista de productos que un cliente B2B quiere cotizar.
Tu tarea:

1. Identificar CADA item del listado (puede haber 1-50 items)
2. Para cada uno, usar la tool search_products para encontrarlo en el catálogo
3. Si la búsqueda devuelve 0 resultados, marcar el item como not_found con tu mejor descripción
4. Si hay múltiples matches plausibles, elegí el más probable basándote en contexto

REGLAS:
- Si dicen "surtido" o "varios colores" sin especificar, agregá nota en raw_match pero matchea al producto base + qty solicitada
- Si dicen cantidades como "50 unidades de X" → qty=50
- Si no especifican cantidad pero piden 1 item → qty=1
- Si dicen rangos como "30-40", usá el promedio (35)
- NO inventes SKUs ni precios — usá los que vienen de la tool

OUTPUT FINAL: cuando termines de buscar TODOS los items, devolvé un mensaje de texto con SOLO un bloque JSON, formato:

\`\`\`json
{
  "items": [
    {
      "raw_match": "50 Copic Sketch surtidos B-series",
      "product_slug": "copic-sketch-b01",
      "qty": 50,
      "match_confidence": 0.6,
      "notes": "Cliente pidió surtido — sugerir set"
    }
  ]
}
\`\`\`

Nada de prosa antes ni después del JSON. Solo el JSON dentro del codeblock.`;

const TOOLS = [
  {
    name: 'search_products',
    description: 'Busca productos en el catálogo Boykot por nombre, marca, categoría o SKU. Devuelve top 5 matches con precio + stock.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto búsqueda' },
      },
      required: ['query'],
    },
  },
];

async function callClaude(messages: Array<{ role: 'user' | 'assistant'; content: unknown }>): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY missing');
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Claude ${res.status}: ${errText.slice(0, 300)}`);
  }
  return (await res.json()) as ClaudeResponse;
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name !== 'search_products') return { error: 'unknown_tool' };
  const products = await findProducts(String(input.query || ''), 5);
  return {
    total: products.length,
    products: products.map(p => ({
      slug: p.slug,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      price_clp: p.price,
      availability: p.availability,
      image: p.image,
      url: p.url,
    })),
  };
}

interface ClaudeParsedItem {
  raw_match: string;
  product_slug?: string;
  qty?: number;
  match_confidence?: number;
  notes?: string;
}

/**
 * Parse customer text input into structured quote items.
 * Returns enriched items with stock checked.
 */
export async function parseQuoteInput(rawText: string): Promise<{
  items: ParsedQuoteItem[];
  tokensUsed: { input: number; output: number };
}> {
  type ApiMessage = { role: 'user' | 'assistant'; content: unknown };
  const messages: ApiMessage[] = [
    { role: 'user', content: `Parsea este listado del cliente:\n\n${rawText}` },
  ];

  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let iter = 0; iter < 8; iter++) {
    const response = await callClaude(messages);
    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    if (response.stop_reason === 'end_turn') {
      const text = response.content
        .filter((b): b is TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('\n');

      const jsonMatch = text.match(/\{[\s\S]*"items"[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Claude did not return JSON in final response');
      }
      let parsed: { items: ClaudeParsedItem[] };
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Claude returned invalid JSON: ' + jsonMatch[0].slice(0, 200));
      }

      // Resolver slugs a producto + enriquecer con stock
      const matched: LookupProduct[] = [];
      for (const item of parsed.items) {
        if (item.product_slug) {
          // Lookup directo por slug
          const p = findProducts(item.product_slug, 1);
          if ((await p)[0]) matched.push((await p)[0]);
        }
      }
      const enriched = await enrichWithStock(matched);
      const enrichedBySlug = Object.fromEntries(enriched.map(e => [e.slug, e]));

      const items: ParsedQuoteItem[] = parsed.items.map(item => {
        const product = item.product_slug ? enrichedBySlug[item.product_slug] : null;
        const qty = Math.max(1, Math.floor(item.qty || 1));
        if (!product) {
          return {
            product_name: item.raw_match || 'Producto sin match',
            qty,
            unit_price_clp: 0,
            match_confidence: 0,
            raw_match: item.raw_match,
            match_status: 'not_found',
          };
        }
        return {
          product_slug: product.slug,
          product_name: product.name,
          product_sku: product.sku,
          product_brand: product.brand,
          product_image: product.image,
          product_url: product.url,
          qty,
          unit_price_clp: product.price || 0,
          stock_available: product.stock?.available ?? product.stock?.bsale_raw ?? null,
          match_confidence: item.match_confidence ?? 0.8,
          raw_match: item.raw_match,
          match_status: 'matched',
        };
      });

      return { items, tokensUsed: { input: totalInputTokens, output: totalOutputTokens } };
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((b): b is ToolUseBlock => b.type === 'tool_use');
      messages.push({ role: 'assistant', content: response.content });
      const toolResults = await Promise.all(
        toolUseBlocks.map(async tb => ({
          type: 'tool_result' as const,
          tool_use_id: tb.id,
          content: JSON.stringify(await executeTool(tb.name, tb.input)),
        })),
      );
      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
  }

  throw new Error('Claude exceeded 8 tool iterations');
}
