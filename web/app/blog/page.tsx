import Link from 'next/link';
import { allPosts, plainTitle, plainExcerpt, firstImageFromContent } from '@/lib/wp-archive';

export const metadata = {
  title: 'Blog · Boykot — Copic Award, talleres y artistas',
  description:
    'Concursos Copic Award, talleres, demos en tienda, colaboraciones con artistas y novedades del mundo de los marcadores, pintura y graffiti.',
};

export default function BlogIndexPage() {
  const posts = allPosts();

  return (
    <main className="bg-white min-h-screen">
      {/* Dark hero */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Blog</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">Blog Boykot</h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Copic Award, concursos, talleres, demos en tienda y colaboraciones con artistas chilenos.
          </p>
          <div className="text-sm text-gray-400 mt-4">
            <strong className="text-white">{posts.length}</strong> publicaciones desde 2018
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map(post => {
              const title = plainTitle(post);
              const excerpt = plainExcerpt(post, 140);
              const image = firstImageFromContent(post);
              const date = new Date(post.date).toLocaleDateString('es-CL', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="aspect-[16/10] bg-gray-50 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">
                      {date}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                      {title}
                    </h2>
                    {excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{excerpt}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
