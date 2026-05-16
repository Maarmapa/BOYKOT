// Acceso al archivo de WP (posts + pages) bajado con scripts/archive-wp-content.mjs.
// Lectura solo — no requiere auth ni red en runtime.

import postsData from '../data/wp-archive/posts.json';
import pagesData from '../data/wp-archive/pages.json';

export interface WpItem {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: { rendered: string };
  content: { rendered: string; protected?: boolean };
  excerpt: { rendered: string; protected?: boolean };
  status: string;
  categories?: number[];
  tags?: number[];
  featured_media?: number;
  link: string;
}

const POSTS = postsData as unknown as WpItem[];
const PAGES = pagesData as unknown as WpItem[];

// Ordenar posts por fecha desc (más recientes primero).
const POSTS_SORTED = [...POSTS].sort((a, b) =>
  new Date(b.date).getTime() - new Date(a.date).getTime()
);

export function allPosts(): WpItem[] {
  return POSTS_SORTED;
}

export function getPost(slug: string): WpItem | null {
  return POSTS.find(p => p.slug === slug) ?? null;
}

export function allPostSlugs(): string[] {
  return POSTS.map(p => p.slug);
}

export function getPage(slug: string): WpItem | null {
  return PAGES.find(p => p.slug === slug) ?? null;
}

export function allPageSlugs(): string[] {
  return PAGES.map(p => p.slug);
}

// Limpiar HTML title (saca entidades + tags).
export function plainTitle(item: WpItem): string {
  return item.title.rendered
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ');
}

// Excerpt limpio para listings (sin HTML, max N chars).
export function plainExcerpt(item: WpItem, max = 160): string {
  const stripped = item.excerpt.rendered
    .replace(/<[^>]+>/g, '')
    .replace(/&hellip;/g, '…')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= max) return stripped;
  return stripped.slice(0, max - 1) + '…';
}

// Primera imagen del contenido — útil para card preview cuando no hay featured_media.
export function firstImageFromContent(item: WpItem): string | null {
  const m = item.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
