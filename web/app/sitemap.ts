import type { MetadataRoute } from 'next';
import { BRAND_SLUGS } from '@/lib/colors/brands';
import { BRAND_META_SLUGS } from '@/lib/brands-meta';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

const CATEGORIES = ['marcadores', 'lapices', 'pintura', 'materiales'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, priority: 1.0 },
    { url: `${SITE}/colores`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/marcas`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/tienda`, lastModified: now, priority: 0.9 },
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
  ];
}
