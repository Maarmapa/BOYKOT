import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comunidad Boykot · Artistas chilenos que usan nuestros materiales',
  description:
    'Galería de artistas, grafiteros, ilustradores y diseñadores chilenos que usan materiales Boykot en sus proyectos.',
};

// Artistas chilenos featured. Para activar IG embeds reales, agregar
// post URLs aca y wirearlos con react-instagram-embed o iframe oEmbed.
// Por ahora cards estáticas — placeholder hasta que el user paste IG posts.
const FEATURED_ARTISTS = [
  {
    handle: 'sacred.slcrew',
    name: 'sacred · slcrew',
    bio: 'Lettering + ilustración',
    image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Manuscrito.webp',
    portfolio: 'https://instagram.com/sacred.slcrew',
    materials: 'Holbein · Copic Ink',
  },
  {
    handle: 'ztatik.one',
    name: 'Ztatik.one',
    bio: 'Street art · Demos tienda',
    image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Entintado.webp',
    portfolio: 'https://instagram.com/ztatik.one',
    materials: 'Molotow Premium',
  },
  {
    handle: 'chiquiwawi',
    name: 'Chiquiwawi',
    bio: 'Manga + tutoriales',
    image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Coloreado.webp',
    portfolio: 'https://instagram.com/chiquiwawi',
    materials: 'Copic Sketch · Multiliner',
  },
  {
    handle: 'bstreetshoes',
    name: 'Bstreetshoes',
    bio: 'Custom sneakers',
    image: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg?2020',
    portfolio: 'https://instagram.com/bstreetshoes',
    materials: 'Angelus Leather Paint',
  },
  {
    handle: 'curisaris',
    name: 'Curisaris',
    bio: 'Live art · Eventos',
    image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Boceto-y-dibujo.webp',
    portfolio: 'https://instagram.com/curisaris',
    materials: 'POSCA · Molotow',
  },
  {
    handle: 'safari.colectivo',
    name: 'Safari Colectivo',
    bio: 'Murales colectivos',
    image: 'https://natekla.es/boytok/wp-content/uploads/2025/05/img-Entramado.webp',
    portfolio: 'https://instagram.com/safari.colectivo',
    materials: 'Molotow Burner · Premium',
  },
];

export const dynamic = 'force-dynamic';

export default function CommunityPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Comunidad</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">
            La comunidad Boykot
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Artistas, grafiteros, ilustradores y diseñadores chilenos que confían en nuestros materiales.
            Etiquetá <strong className="text-white">@boykot.cl</strong> en tu próxima obra para aparecer acá.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            Artistas destacados
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-8">Caras y manos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURED_ARTISTS.map(artist => (
              <a
                key={artist.handle}
                href={artist.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-md"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-1">
                    @{artist.handle}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{artist.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{artist.bio}</p>
                  <div className="text-xs text-blue-600 font-semibold">{artist.materials}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-3">¿Querés aparecer acá?</h2>
          <p className="text-gray-700 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Etiquetá <a href="https://instagram.com/boykot.cl" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">@boykot.cl</a>{' '}
            en tu próxima obra hecha con materiales nuestros. Repostamos las mejores cada semana
            y las mejores van directo a la galería.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://instagram.com/boykot.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:bg-gray-700"
            >
              Seguir en IG
            </a>
            <Link
              href="/blog"
              className="inline-block border border-gray-300 text-gray-900 px-6 py-3 rounded-md font-semibold text-sm uppercase tracking-wider hover:border-gray-900"
            >
              Ver blog + talleres
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
