import productsData from '../data/products.json';

export interface Product {
  slug: string;
  name: string;
  sku: string | null;
  url: string | null;
  price: number | null;
  availability: 'InStock' | 'OutOfStock' | string;
  description: string;
  short: string;
  image: string | null;
  gallery: string[];
  breadcrumbs: string[];
  cat: 'marcadores' | 'pintura' | 'lapices' | 'materiales' | null;
  brand: string | null;
}

const PRODUCTS = productsData as unknown as Record<string, Product>;

export function getProduct(slug: string): Product | null {
  return PRODUCTS[slug] ?? null;
}

export function allProductSlugs(): string[] {
  return Object.keys(PRODUCTS);
}

export function productsByCategory(cat: Product['cat']): Product[] {
  if (!cat) return [];
  return Object.values(PRODUCTS).filter(p => p.cat === cat);
}

export function relatedProducts(p: Product, n = 6): Product[] {
  const pool = Object.values(PRODUCTS).filter(
    o => o.slug !== p.slug && (o.brand === p.brand || o.cat === p.cat),
  );
  return pool.slice(0, n);
}
