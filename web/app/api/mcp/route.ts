// MCP server (Model Context Protocol) over Streamable HTTP transport.
// Exposes Boykot's catalog tools so any MCP-compatible client (Claude Desktop,
// Claude Code, ChatGPT custom GPT, etc.) can connect and query.
//
// Protocol: JSON-RPC 2.0 messages, single POST endpoint.
// Reference: https://modelcontextprotocol.io/specification

import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { BRANDS } from '@/lib/colors/brands';
import { getProduct } from '@/lib/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PROTOCOL_VERSION = '2025-06-18';

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
function loadIndex(): SlimProduct[] {
  if (_index) return _index;
  const file = path.join(process.cwd(), 'public', 'products-index.json');
  _index = JSON.parse(fs.readFileSync(file, 'utf8')) as SlimProduct[];
  return _index;
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// ───────────────────────── tool definitions ─────────────────────────
const TOOLS = [
  {
    name: 'search_products',
    description: 'Busca productos en el catálogo Boykot por nombre, marca o sku.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texto a buscar (ej "copic sketch e00", "angelus rojo cuero")' },
        limit: { type: 'number', description: 'Máximo de resultados (default 8, max 25)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_product',
    description: 'Devuelve detalle completo de un producto por su slug: name, precio, stock, descripción, gallery, url.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Slug exacto, ej "marcador-copic-sketch-e00"' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'get_color_card',
    description: 'Devuelve una carta de color de marca: lista de colores con código, nombre y SKU.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: { type: 'string', description: 'Brand-slug, ej "copic-sketch", "angelus-standard-1oz", "molotow-premium"' },
      },
      required: ['brand'],
    },
  },
  {
    name: 'list_brands',
    description: 'Lista las cartas de color disponibles (slug, marca, producto, # colores, precio base).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_quote',
    description: 'Arma un quote para los items del carro y devuelve total + payment_link para entregar al humano. No cobra, solo cotiza.',
    inputSchema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          description: 'Items a cotizar: cada uno con slug (producto suelto) o variant_id (un color de una carta), y qty.',
          items: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              variant_id: { type: 'number' },
              qty: { type: 'number' },
            },
          },
        },
        ref: { type: 'string', description: 'Referral key opcional del agente para track de conversiones' },
      },
      required: ['items'],
    },
  },
];

// ───────────────────────── tool implementations ─────────────────────────
function runSearch(input: { query?: string; limit?: number }) {
  const q = String(input.query || '').trim();
  const limit = Math.min(input.limit ?? 8, 25);
  if (q.length < 2) return { results: [] };
  const idx = loadIndex();
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
    results: scored.slice(0, limit).map(({ p }) => ({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price_clp: p.price,
      image: p.image,
      url: `https://boykot.cl/producto/${p.slug}`,
    })),
    total: scored.length,
  };
}

function runGetProduct(input: { slug?: string }) {
  const slug = String(input.slug || '');
  const p = getProduct(slug);
  if (!p) return { error: 'producto no encontrado', slug };
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.cat,
    price_clp: p.price,
    currency: 'CLP',
    availability: p.availability,
    description: p.description,
    image: p.image,
    gallery: p.gallery,
    url: `https://boykot.cl/producto/${p.slug}`,
  };
}

function runGetColorCard(input: { brand?: string }) {
  const brand = String(input.brand || '');
  const b = BRANDS[brand];
  if (!b) return { error: 'brand no encontrado', brand };
  return {
    slug: brand,
    brand_name: b.brandName,
    product_name: b.productName,
    base_price_clp: b.basePriceClp,
    colors_total: b.colors.length,
    url: `https://boykot.cl/colores/${brand}`,
    colors: b.colors.map(c => ({
      code: c.code,
      name: c.name,
      sku: c.sku ?? null,
      hex: 'hex' in c ? (c as { hex?: string }).hex ?? null : null,
    })),
  };
}

function runListBrands() {
  const slugs = Object.keys(BRANDS);
  return {
    brands: slugs.map(s => {
      const b = BRANDS[s];
      return {
        slug: s,
        brand_name: b.brandName,
        product_name: b.productName,
        colors_total: b.colors.length,
        base_price_clp: b.basePriceClp,
        url: `https://boykot.cl/colores/${s}`,
      };
    }),
  };
}

// ───────────────────────── JSON-RPC handler ─────────────────────────
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

function rpcResult(id: string | number | null | undefined, result: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function rpcError(id: string | number | null | undefined, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

async function handleRequest(req: JsonRpcRequest) {
  switch (req.method) {
    case 'initialize':
      return rpcResult(req.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: {
          name: 'boykot-mcp',
          version: '1.0.0',
          description: 'Catálogo Boykot — arte y graffiti, Chile. Cartas de color, productos, stock.',
        },
      });

    case 'notifications/initialized':
      return null; // no response

    case 'tools/list':
      return rpcResult(req.id, { tools: TOOLS });

    case 'tools/call': {
      const params = (req.params || {}) as { name?: string; arguments?: Record<string, unknown> };
      const name = params.name;
      const args = params.arguments ?? {};
      let result: unknown;
      try {
        if (name === 'search_products') result = runSearch(args as { query?: string; limit?: number });
        else if (name === 'get_product') result = runGetProduct(args as { slug?: string });
        else if (name === 'get_color_card') result = runGetColorCard(args as { brand?: string });
        else if (name === 'list_brands') result = runListBrands();
        else if (name === 'get_quote') {
          // Forward to /api/checkout/quote on the same host
          const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
          const res = await fetch(`${origin}/api/checkout/quote`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(args),
          });
          result = await res.json();
        }
        else return rpcError(req.id, -32601, `Unknown tool: ${name}`);
      } catch (e) {
        return rpcError(req.id, -32603, `Tool error: ${(e as Error).message}`);
      }
      return rpcResult(req.id, {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      });
    }

    case 'ping':
      return rpcResult(req.id, {});

    default:
      return rpcError(req.id, -32601, `Method not found: ${req.method}`);
  }
}

export async function POST(req: NextRequest) {
  let body: JsonRpcRequest | JsonRpcRequest[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(rpcError(null, -32700, 'Parse error'), { status: 400 });
  }

  if (Array.isArray(body)) {
    const responses = (await Promise.all(body.map(handleRequest))).filter(r => r !== null);
    return NextResponse.json(responses);
  }
  const result = await handleRequest(body);
  if (result === null) return new Response(null, { status: 202 });
  return NextResponse.json(result);
}

// Discovery: GET returns metadata so clients can verify the endpoint
export async function GET() {
  return NextResponse.json({
    name: 'boykot-mcp',
    version: '1.0.0',
    description: 'Catálogo Boykot vía MCP. POST JSON-RPC para usar.',
    protocolVersion: PROTOCOL_VERSION,
    transport: 'streamable-http',
    docs: 'https://boykot.cl/llms.txt',
    tools: TOOLS.map(t => t.name),
  });
}
