import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPost,
  allPostSlugs,
  allPosts,
  plainTitle,
  plainExcerpt,
  firstImageFromContent,
} from '@/lib/wp-archive';

interface Params {
  slug: string;
}

export async function generateStaticParams() {
  return allPostSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Post no encontrado · Boykot' };
  const title = plainTitle(post);
  const excerpt = plainExcerpt(post, 200);
  const image = firstImageFromContent(post);
  return {
    title: `${title} · Boykot Blog`,
    description: excerpt,
    openGraph: {
      title,
      description: excerpt,
      images: image ? [image] : [],
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const title = plainTitle(post);
  const date = new Date(post.date).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const heroImage = firstImageFromContent(post);

  // Related posts (last 3 different from this one)
  const related = allPosts().filter(p => p.slug !== slug).slice(0, 3);

  return (
    <main className="bg-white min-h-screen">
      <article>
        {/* Hero */}
        <section className="border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
            <nav className="text-xs text-gray-400 mb-6">
              <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
              <Link href="/blog" className="hover:text-gray-700">Blog</Link> /{' '}
              <span className="text-gray-700 line-clamp-1">{title}</span>
            </nav>
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
              {date}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 leading-tight">
              {title}
            </h1>
          </div>

          {heroImage && (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-50">
                <img src={heroImage} alt={title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </section>

        {/* Content */}
        <section className="border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div
              className="wp-content"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </div>
        </section>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
              Más del blog
            </div>
            <h2 className="text-2xl text-gray-900 mb-8">Te puede interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map(r => {
                const rTitle = plainTitle(r);
                const rImage = firstImageFromContent(r);
                const rDate = new Date(r.date).toLocaleDateString('es-CL', {
                  year: 'numeric', month: 'short', day: 'numeric',
                });
                return (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-md"
                  >
                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                      {rImage && (
                        <img src={rImage} alt={rTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">
                        {rDate}
                      </div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">
                        {rTitle}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿Te interesó este artículo?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Hablemos por WhatsApp o pasá por la tienda — Av. Providencia 2251, Metro Los Leones.
          </p>
          <a
            href="https://wa.me/56223350961"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp →
          </a>
        </div>
      </section>
    </main>
  );
}
