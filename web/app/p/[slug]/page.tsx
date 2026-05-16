import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPage,
  allPageSlugs,
  plainTitle,
  plainExcerpt,
  firstImageFromContent,
  sanitizeWpContent,
} from '@/lib/wp-archive';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

// Páginas SEO rescatadas del WP original (regalos-para-artistas, sets-base-agua,
// copic-award-chile-2025, etc). Sirvalas como /p/[slug] para preservar el SEO
// juice de Google. NO incluir las páginas internas del nuevo site (sobre-boykot,
// tienda, etc) ya que tienen su propia ruta dedicada.

interface Params {
  slug: string;
}

const SKIP_SLUGS = new Set([
  'home', 'cart', 'checkout', 'my-account', 'tienda', 'contacto', 'sobre-boykot',
  'privacidad', 'terminos', 'b2b', 'como-comprar', 'carrito', 'marcas',
]);

export async function generateStaticParams() {
  return allPageSlugs()
    .filter(s => !SKIP_SLUGS.has(s))
    .map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page || SKIP_SLUGS.has(slug)) return { title: 'No encontrado · Boykot' };
  const title = plainTitle(page);
  const excerpt = plainExcerpt(page, 200) || `${title} en Boykot — materiales de arte y graffiti en Chile`;
  const image = firstImageFromContent(page);
  return {
    title: `${title} · Boykot`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      images: image ? [image] : [],
      type: 'article',
    },
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  if (SKIP_SLUGS.has(slug)) notFound();
  const page = getPage(slug);
  if (!page || page.status !== 'publish') notFound();

  const title = plainTitle(page);
  const heroImage = firstImageFromContent(page);

  return (
    <main className="bg-white min-h-screen">
      <BreadcrumbSchema
        crumbs={[
          { name: 'Inicio', url: SITE },
          { name: title, url: `${SITE}/p/${slug}` },
        ]}
      />
      <article>
        {/* Breadcrumbs + title */}
        <section className="border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-6">
            <nav className="text-xs text-gray-400 mb-6">
              <Link href="/" className="hover:text-gray-700">Inicio</Link>
              <span> / </span>
              <span className="text-gray-700 line-clamp-1">{title}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight">
              {title}
            </h1>
          </div>
          {heroImage && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
              <div className="aspect-[16/9] bg-gray-50 rounded-xl overflow-hidden">
                <img src={heroImage} alt={title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </section>

        {/* Content from WP — full HTML preserved */}
        <section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div
              className="wp-content"
              dangerouslySetInnerHTML={{ __html: sanitizeWpContent(page.content.rendered) }}
            />
          </div>
        </section>
      </article>

      {/* CTA volver al catálogo */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-center">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/tienda"
              className="inline-block px-6 py-3 text-white font-semibold rounded-md text-sm uppercase tracking-wider"
              style={{ backgroundColor: '#0066ff' }}
            >
              Ir al catálogo
            </Link>
            <Link
              href="/marcas"
              className="inline-block px-6 py-3 border border-gray-300 text-gray-900 font-semibold rounded-md text-sm uppercase tracking-wider hover:border-gray-900 transition-colors"
            >
              Ver marcas
            </Link>
            <a
              href="https://wa.me/56223350961"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
