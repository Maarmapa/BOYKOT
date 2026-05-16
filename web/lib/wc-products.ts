// Acceso enriquecido a productos: combina products.json (existente, BSale-sourced)
// con wc-products.json (rescatado de wp-json/wc/store/v1/products).
//
// La idea: products.json es el cache stable usado por el sitemap y otras rutas.
// wc-products.json tiene descripcion HTML completa + multi-image + atributos
// que no estan en products.json. Cuando renderizamos /producto/[slug],
// usamos el match de wc-products para enriquecer si existe.

import wcData from '../data/wp-archive/wc-products.json';
import wcVariationsData from '../data/wp-archive/wc-variations.json';

export interface WcImage {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WcAttribute {
  id: number;
  name: string;
  taxonomy: string;
  has_variations: boolean;
  terms: Array<{ id: number; name: string; slug: string }>;
}

export interface WcProduct {
  id: number;
  slug: string;
  name: string;
  sku: string | null;
  parent: number;
  type: 'simple' | 'variable' | 'grouped' | string;
  on_sale: boolean;
  permalink: string;
  short: string;
  description: string;
  price: number | null;
  regular_price: number | null;
  sale_price: number | null;
  is_in_stock: boolean;
  is_purchasable: boolean;
  images: WcImage[];
  categories: WcCategory[];
  attributes: WcAttribute[];
  variations: Array<{ id: number; attributes?: Array<{ name: string; value: string }> }>;
  average_rating: string;
  review_count: number;
}

export interface WcVariation {
  id: number;
  parent: number;
  sku: string | null;
  name: string;
  price: number | null;
  regular_price: number | null;
  is_in_stock: boolean;
  is_purchasable: boolean;
  image: string | null;
  attributes: Array<{ name: string; value: string }>;
  on_sale: boolean;
}

const WC_PRODUCTS = wcData as unknown as WcProduct[];
const WC_VARIATIONS = wcVariationsData as unknown as WcVariation[];

// Index por slug — lookup O(1) en runtime
const BY_SLUG: Record<string, WcProduct> = {};
for (const p of WC_PRODUCTS) {
  BY_SLUG[p.slug] = p;
}

// Index variations por parent product
const VARIATIONS_BY_PARENT: Record<number, WcVariation[]> = {};
for (const v of WC_VARIATIONS) {
  if (!VARIATIONS_BY_PARENT[v.parent]) VARIATIONS_BY_PARENT[v.parent] = [];
  VARIATIONS_BY_PARENT[v.parent].push(v);
}

export function getWcProduct(slug: string): WcProduct | null {
  return BY_SLUG[slug] ?? null;
}

export function getVariationsFor(productId: number): WcVariation[] {
  return VARIATIONS_BY_PARENT[productId] ?? [];
}

// Helper: imagenes deduped del producto (algunas vienen repetidas en sizes)
export function uniqueImages(p: WcProduct): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const img of p.images || []) {
    if (img.src && !seen.has(img.src)) {
      seen.add(img.src);
      out.push(img.src);
    }
  }
  return out;
}
