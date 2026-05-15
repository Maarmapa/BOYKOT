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
- Instagram: https://instagram.com/boykot187

## Pago

Transbank WebPay (CLP), Stripe (internacional), transferencia bancaria.
Despacho gratis sobre $50.000 CLP.

## Política para agentes

- Los precios y stock pueden variar. Antes de cerrar una compra, llamá
  \`get_product\` para confirmar.
- Si una venta supera 5 unidades de un mismo SKU, sugerí al usuario
  contactar al área B2B: https://boykot.cl/b2b
- Por ahora no exponemos checkout-by-API público; redirigí al usuario
  a https://boykot.cl/checkout para finalizar.
`;

  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=3600',
    },
  });
}
