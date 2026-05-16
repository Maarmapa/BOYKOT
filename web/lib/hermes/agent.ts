// Hermes — agente Claude que responde DMs de IG/WhatsApp en nombre de Boykot.
//
// Arquitectura:
//   - Webhook Meta llega → /api/bot/{whatsapp|instagram}/webhook
//   - Webhook persiste mensaje en Supabase (tabla bot_conversations + bot_messages)
//   - Webhook llama runHermesTurn() con el historial reciente
//   - runHermesTurn() usa Claude API con tools (search_products, check_stock, get_link)
//   - Claude responde con texto plano para mandar de vuelta al cliente
//   - Webhook envía la respuesta vía Meta Graph API
//
// Personality: español chileno informal pero profesional, tono Boykot.
// Tools (definidas abajo): search_products, check_stock_by_sku, get_product_link.

import 'server-only';
import {
  findProducts,
  findWithStock,
  getProductBySku,
  enrichWithStock,
  formatProductReply,
  type LookupProduct,
  type LookupProductWithStock,
} from '../lookup';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 1024;

export interface HermesMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Eres Hermes, el asistente AI oficial de Boykot — tienda de materiales de arte, ilustración y graffiti en Chile (distribuidor oficial Copic, Angelus y Holbein desde 2010).

Estás respondiendo DMs/mensajes de clientes en Instagram y WhatsApp. Tu tono:
- Español chileno informal pero profesional (uso "vos" / "tú" según se acomode)
- Cálido, directo, sin formalismos excesivos
- Conocedor del catálogo, no pretender saber lo que no sabés
- Si el cliente quiere algo específico, USAS las tools para buscar en stock real-time

REGLAS:
1. SIEMPRE usar tools para responder sobre stock/precio/links — nunca inventar
2. Mencionar siempre que el envío es 24-48hrs Chile o retiro en Av. Providencia 2251 (Metro Los Leones)
3. Para preguntas técnicas complejas (¿qué Copic usar para piel?), responde con info general y ofrecé pasar a un humano
4. Para pedidos/compras grandes, ofrecé asesoría WhatsApp con humano: +56 2 2335 0961
5. Para B2B/mayoristas, mencionar el formulario /b2b
6. NO uses emojis excesivos, máximo 1-2 por mensaje
7. NO repitas el saludo en cada mensaje
8. Si no encontrás un producto, decilo claro y ofrecé alternativas

Cuando uses una tool y encontrás producto en stock, formato preferido:
"Sí, tenemos [Producto] en stock ([N] disponibles). Precio: $X CLP.
Link: [URL]
Despacho 24-48hrs o retiro en tienda. ¿Te lo dejo apartado?"`;

const TOOLS = [
  {
    name: 'search_products',
    description: 'Busca productos en el catálogo Boykot por nombre, marca, categoría o SKU. Devuelve top matches con precio + stock en tiempo real desde BSale.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Texto de búsqueda: nombre del producto, marca, o SKU. Ej: "Copic Sketch B01" o "Angelus rojo" o "marcadores"',
        },
        limit: {
          type: 'integer',
          description: 'Máximo de resultados (default 5)',
          default: 5,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'check_stock_by_sku',
    description: 'Verifica stock real-time de un producto específico por SKU exacto (ej: "ANGE73304BLACK")',
    input_schema: {
      type: 'object',
      properties: {
        sku: {
          type: 'string',
          description: 'SKU exacto del producto',
        },
      },
      required: ['sku'],
    },
  },
];

interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}
interface TextBlock {
  type: 'text';
  text: string;
}
type ContentBlock = ToolUseBlock | TextBlock;

interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ContentBlock[];
  stop_reason: 'end_turn' | 'tool_use' | string;
  usage: { input_tokens: number; output_tokens: number };
}

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
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Claude API ${res.status}: ${errText.slice(0, 300)}`);
  }
  return (await res.json()) as ClaudeResponse;
}

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  if (name === 'search_products') {
    const query = String(input.query || '');
    const limit = Math.min(10, Math.max(1, Number(input.limit) || 5));
    const products = await findWithStock(query, limit);
    return {
      query,
      total: products.length,
      products: products.map(p => ({
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        brand: p.brand,
        price_clp: p.price,
        url: p.url,
        in_stock: p.stock ? (p.stock.available ?? p.stock.bsale_raw ?? 0) > 0 : p.availability !== 'OutOfStock',
        stock_qty: p.stock?.available ?? p.stock?.bsale_raw ?? null,
      })),
    };
  }
  if (name === 'check_stock_by_sku') {
    const sku = String(input.sku || '');
    const p = getProductBySku(sku);
    if (!p) return { found: false, sku };
    const enriched = await enrichWithStock([p]);
    const product = enriched[0];
    return {
      found: true,
      product: {
        slug: product.slug,
        name: product.name,
        sku: product.sku,
        price_clp: product.price,
        url: product.url,
        in_stock: product.stock ? (product.stock.available ?? 0) > 0 : product.availability !== 'OutOfStock',
        stock_qty: product.stock?.available ?? product.stock?.bsale_raw ?? null,
      },
    };
  }
  return { error: 'unknown tool', name };
}

/**
 * Run one turn of Hermes. history is the conversation so far; the last
 * message must be from the user. Returns Hermes' text response.
 * Iteratively executes tool_use blocks until Claude returns end_turn.
 */
export async function runHermesTurn(history: HermesMessage[]): Promise<string> {
  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    throw new Error('history must end with user message');
  }

  // Convert history to Claude API format
  type ApiMessage = { role: 'user' | 'assistant'; content: unknown };
  const messages: ApiMessage[] = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Iterate up to 5 tool rounds (defensive)
  for (let iter = 0; iter < 5; iter++) {
    const response = await callClaude(messages);

    if (response.stop_reason === 'end_turn') {
      // Concat all text blocks
      const text = response.content
        .filter((b): b is TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('\n')
        .trim();
      return text || 'Disculpa, no pude generar respuesta. Escribinos al WhatsApp +56 2 2335 0961.';
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((b): b is ToolUseBlock => b.type === 'tool_use');
      // Append assistant message with tool_use blocks
      messages.push({ role: 'assistant', content: response.content });
      // Execute tools, append tool_result blocks
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

    // Unknown stop reason
    return 'Disculpa, hubo un error procesando tu mensaje. Te paso a un humano: +56 2 2335 0961.';
  }

  return 'Tu consulta requiere asesoría más detallada. Te paso a un humano: WhatsApp +56 2 2335 0961.';
}

/** Convenience: format a product result as a DM-ready text using the lookup helper. */
export function quickReply(p: LookupProductWithStock): string {
  return formatProductReply(p);
}

export type { LookupProduct, LookupProductWithStock };
