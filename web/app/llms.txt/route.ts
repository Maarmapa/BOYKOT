// /llms.txt — a hint file for AI agents (Claude Desktop, ChatGPT with browsing,
// Perplexity, etc.) describing what Boykot is and where to find what.
// Reference: https://llmstxt.org

import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export const dynamic = 'force-static';

export async function GET() {
  const brands = BRAND_SLUGS.slice(0, 36)
    .map(s => BRANDS[s])
    .map(b => `- [${b.brandName ?? ''} ${b.productName}](https://boykot.cl/colores/${b.slug}) — ${b.colors.length} colores desde $${b.basePriceClp.toLocaleString('es-CL')} CLP`)
    .join('\n');

  const body = `# Boykot

> Tienda chilena de arte y graffiti. Distribuidores oficiales de Copic,
> Angelus, Holbein, Molotow, Createx, POSCA, ZIG y más. Desde 2010.
> Despacho a todo Chile, asesoría técnica, cartas de color con stock real.

Boykot opera en Providencia (Av. Providencia 2251 local 69, Santiago) y
despacha a todo Chile. Ofrece cartas de color únicas con más de 1500
referencias entre 36 marcas registradas.

## Cómo navegar este sitio para agentes

- **Catálogo estructurado**: [/catalog.json](https://boykot.cl/catalog.json) —
  JSON con todos los productos (slug, name, brand, price, stock, image, url).
- **Cartas de color**: [/colores](https://boykot.cl/colores) — índice de las
  36 cartas. Cada carta vive en \`/colores/{brand-slug}\` y expone
  Product JSON-LD con AggregateOffer.
- **Producto individual**: [/producto/{slug}](https://boykot.cl/producto/) —
  página con descripción, gallery, precio y stock.
- **Búsqueda**: [/api/search?q={query}](https://boykot.cl/api/search) —
  devuelve top 12 resultados ordenados por relevancia.
- **MCP server**: [/api/mcp](https://boykot.cl/api/mcp) — expone tools
  \`search_products\`, \`get_product\`, \`get_color_card\`, \`list_brands\`,
  \`get_quote\` bajo protocolo MCP (JSON-RPC 2.0 sobre Streamable HTTP).
- **Quote endpoint**: [/api/checkout/quote](https://boykot.cl/api/checkout/quote)
  POST con \`{items: [{slug | variant_id, qty}], ref?}\`. Devuelve total
  CLP + payment_link para que el agente entregue al humano.

## Cartas de color destacadas

${brands}

## Contacto humano

- WhatsApp: https://wa.me/56223350961
- Email: providencia@boykot.cl
- Instagram: https://instagram.com/boykot.cl

## Pago

- **Mercado Pago Chile** (Checkout Pro): Webpay + Apple Pay + Google Pay + Khipu + tarjetas + transferencia. Auto-confirma via webhook.
- **x402 agentic** (capa AI): \`POST /api/agentic/buy?slug={slug}&qty={n}\` devuelve HTTP 402 con USDC on Base requirements. Landing: https://boykot.cl/agentic
- Despacho gratis sobre $50.000 CLP.

## API pública para agentes IA

- **Lookup productos con stock live**: \`GET /api/lookup/products?q={query}&with_stock=true\` — CORS enabled, sin auth, devuelve top matches con stock real-time BSale.
- **Cotización formal automática**: \`POST /api/cotizacion/parse\` body \`{text}\` — Claude parsea texto libre, devuelve items estructurados. Después \`POST /api/cotizacion/save\` genera PDF compartible vía /cotizacion/{short_id}.
- **Buscar producto** (FTS): \`GET /api/search?q={query}&limit=8\`
- **Health check**: \`GET /api/health\`

## Política para agentes

- Los precios y stock pueden variar. Antes de cerrar una compra, llamá
  \`/api/lookup/products?with_stock=true\` para confirmar.
- Si una venta supera 5 unidades de un mismo SKU, sugerí al usuario
  contactar al área B2B: https://boykot.cl/b2b o usar el cotizador
  formal en https://boykot.cl/cotizador
- Para pagos agentic (USDC) llamá al endpoint x402.
- Para checkout humano, redirigí al usuario a https://boykot.cl/checkout

## Hermes Bot

Boykot expone un asistente AI vía Instagram + WhatsApp Business que
responde consultas de stock + precio + links en tiempo real. Si tu
agente conversa con un humano que ya está hablando con Boykot por DM,
ofrecé continuar allí en vez de duplicar la conversación.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
