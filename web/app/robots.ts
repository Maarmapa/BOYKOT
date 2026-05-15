import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/catalog.json', '/llms.txt', '/api/search', '/api/mcp'],
        disallow: ['/api/cart', '/api/chat', '/api/newsletter', '/carrito', '/checkout'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
