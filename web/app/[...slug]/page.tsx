// Catch-all para las 59 páginas scrapeadas de boykot.cl que no tienen una
// implementación custom (brand landings, /tienda, IC, sneakers, curaciones).
//
// Routes específicos (/colores, /marcas, /producto/[slug], etc.) toman
// prioridad. Si una URL no matchea ningún route específico, Next.js cae acá.

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import pagesData from '../../data/pages.json';

interface Section {
  level?: number;
  heading: string;
  body?: string;
  images?: string[];
  links?: Array<{ href: string; text: string }>;
}

interface PageData {
  url: string;
  title: string;
  description: string;
  heroImage: string | null;
  sections: Section[];
  paragraphs: string[];
  productLinks: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
}

const PAGES = pagesData as unknown as Record<string, PageData>;

function getPage(slug: string[]): PageData | null {
  const key = slug.join('/');
  return PAGES[key] ?? null;
}

export async function generateStaticParams() {
  return Object.keys(PAGES).map(slug => ({ slug: slug.split('/') }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return { title: 'No encontrado · Boykot' };
  return {
    title: `${page.title} · Boykot`,
    description: page.description?.slice(0, 160),
    openGraph: {
      title: page.title,
      description: page.description?.slice(0, 200),
      images: page.heroImage ? [page.heroImage] : undefined,
      siteName: 'Boykot',
      locale: 'es_CL',
    },
  };
}

// Rewrite product links from old WP URLs to new Next.js URLs
function rewriteLink(href: string): string {
  // /tienda/foo-bar/ → /producto/foo-bar
  const productMatch = href.match(/\/tienda\/(?:[^/]+\/)*([^/]+)\/?$/);
  if (productMatch && productMatch[1]) return `/producto/${productMatch[1]}`;
  // Boykot domain absolute → relative
  if (href.startsWith('https://www.boykot.cl/')) {
    return href.replace('https://www.boykot.cl', '');
  }
  return href;
}

export default async function ScrapedPage({
  params,
}: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  // Filter out empty/trivial sections
  const sections = page.sections.filter(
    s => (s.body && s.body.length > 20) || (s.images && s.images.length > 0),
  );

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-20">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-4">
            Boykot
          </div>
          <h1 className="text-4xl sm:text-6xl text-gray-900 mb-6 leading-[1.05]">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
              {page.description}
            </p>
          )}
        </div>
      </section>

      {/* Hero image (si hay) */}
      {page.heroImage && !page.heroImage.includes('logo') && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="aspect-[16/9] sm:aspect-[16/7] bg-gray-50 rounded-xl overflow-hidden">
            <img
              src={page.heroImage}
              alt={page.title}
              className="w-full h-full object-cover"
            />
          </div>
        </section>
      )}

      {/* Secciones extraídas */}
      {sections.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
          {sections.map((sec, i) => (
            <div key={i} className="prose prose-gray max-w-none">
              <h2 className={`text-gray-900 ${sec.level === 3 ? 'text-2xl' : 'text-3xl'} mb-4`}>
                {sec.heading}
              </h2>
              {sec.body && (
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>
              )}
              {sec.images && sec.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 not-prose mt-6">
                  {sec.images.map((src, j) => (
                    <div key={j} className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Fallback: paragraphs si no hubo sections */}
      {sections.length === 0 && page.paragraphs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-gray-700 leading-relaxed">
          {page.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {/* Galería de imágenes inline si hay */}
      {page.images.length > 0 && sections.length === 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {page.images.map((img, i) => (
              <div key={i} className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Productos relacionados (extraídos del scrape) */}
      {page.productLinks.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
              En esta sección
            </div>
            <h2 className="text-2xl text-gray-900 mb-8">Productos</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {page.productLinks.slice(0, 30).map((link, i) => (
                <li key={i}>
                  <Link
                    href={rewriteLink(link.href)}
                    className="block px-4 py-3 bg-white border border-gray-100 rounded-md text-sm text-gray-800 hover:border-gray-300 hover:text-gray-900 transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Volver al inicio */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
