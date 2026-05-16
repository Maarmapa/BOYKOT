import type { MetadataRoute } from 'next';
import { BRAND_SLUGS } from '@/lib/colors/brands';
import { BRAND_META_SLUGS } from '@/lib/brands-meta';
import { allPostSlugs, allPageSlugs } from '@/lib/wp-archive';

// Slugs que NO se exponen via /p/[slug] (tienen su propia ruta)
const SKIP_PAGE_SLUGS = new Set([
  'home', 'cart', 'checkout', 'my-account', 'tienda', 'contacto', 'sobre-boykot',
  'privacidad', 'terminos', 'b2b', 'como-comprar', 'carrito', 'marcas',
]);

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

const CATEGORIES = ['marcadores', 'lapices', 'pintura', 'materiales'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, priority: 1.0 },
    { url: `${SITE}/colores`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/marcas`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/tienda`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/promociones`, lastModified: now, priority: 0.85 },
    { url: `${SITE}/buscar`, lastModified: now, priority: 0.5 },
    { url: `${SITE}/blog`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/agentic`, lastModified: now, priority: 0.6 },
    { url: `${SITE}/cotizador`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/comparar`, lastModified: now, priority: 0.5 },
    { url: `${SITE}/regalos`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/community`, lastModified: now, priority: 0.6 },
    { url: `${SITE}/regalo`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/regalo/canjear`, lastModified: now, priority: 0.5 },
    ...allPostSlugs().map(slug => ({
      url: `${SITE}/blog/${slug}`,
      lastModified: now,
      priority: 0.5,
    })),
    { url: `${SITE}/b2b`, lastModified: now, priority: 0.7 },
    { url: `${SITE}/sobre-boykot`, lastModified: now, priority: 0.6 },
    { url: `${SITE}/contacto`, lastModified: now, priority: 0.6 },
    { url: `${SITE}/como-comprar`, lastModified: now, priority: 0.5 },
    { url: `${SITE}/terminos`, lastModified: now, priority: 0.3 },
    { url: `${SITE}/privacidad`, lastModified: now, priority: 0.3 },
    { url: `${SITE}/carrito`, lastModified: now, priority: 0.3 },
    ...CATEGORIES.map(slug => ({
      url: `${SITE}/categoria/${slug}`,
      lastModified: now,
      priority: 0.7,
    })),
    ...BRAND_SLUGS.map(slug => ({
      url: `${SITE}/colores/${slug}`,
      lastModified: now,
      priority: 0.8,
    })),
    ...BRAND_META_SLUGS.map(slug => ({
      url: `${SITE}/marca/${slug}`,
      lastModified: now,
      priority: 0.85,
    })),
    // SEO landings rescatadas del WP original (preservar Google juice)
    ...allPageSlugs()
      .filter(slug => !SKIP_PAGE_SLUGS.has(slug))
      .map(slug => ({
        url: `${SITE}/p/${slug}`,
        lastModified: now,
        priority: 0.6,
      })),
  ];
}
