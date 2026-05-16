import type { MetadataRoute } from 'next';
import productsData from '../../data/products.json';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';
const PER_SITEMAP = 5000;

interface SlimProduct {
  slug: string;
  availability?: string;
}

const PRODUCTS = productsData as unknown as Record<string, SlimProduct>;
const ALL_SLUGS = Object.keys(PRODUCTS);

// Para >50k URLs Google requiere split. Tenemos 3618 -> 1 sitemap es suficiente,
// pero dejamos preparado el split por chunks de 5000 por si crece el catalogo.
export async function generateSitemaps() {
  const total = Math.ceil(ALL_SLUGS.length / PER_SITEMAP);
  return Array.from({ length: total }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = parseInt(await props.id, 10) || 0;
  const start = id * PER_SITEMAP;
  const end = start + PER_SITEMAP;
  const slice = ALL_SLUGS.slice(start, end);
  const now = new Date();

  return slice.map(slug => {
    const p = PRODUCTS[slug];
    const inStock = p?.availability !== 'OutOfStock';
    return {
      url: `${SITE}/producto/${slug}`,
      lastModified: now,
      // Productos en stock con mayor prioridad de crawl
      priority: inStock ? 0.7 : 0.4,
      changeFrequency: 'weekly' as const,
    };
  });
}
