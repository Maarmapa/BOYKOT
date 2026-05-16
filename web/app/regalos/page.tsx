import Link from 'next/link';
import type { Metadata } from 'next';
import { getPage } from '@/lib/wp-archive';

export const metadata: Metadata = {
  title: 'Regalos para artistas · Boykot — Ideas de regalo creativas',
  description:
    'Guías de regalo curadas: para artistas, grafiteros, principiantes, dibujantes, niños. Materiales premium Copic, Angelus, Holbein con sets armados.',
};

// Lista curada de las landings de regalos rescatadas del WP
const GIFT_GUIDES = [
  { slug: 'regaos-para-artistas', label: 'Para artistas', emoji: '🎨', desc: 'Sets y kits curados para artistas profesionales.' },
  { slug: 'regalos-para-grafiteros', label: 'Para grafiteros', emoji: '🖌', desc: 'Aerosoles, marcadores y materiales street art.' },
  { slug: 'regalo-para-principiantes', label: 'Para principiantes', emoji: '✏️', desc: 'Empezar a dibujar sin abrumarse con opciones.' },
  { slug: 'regalo-para-dibujantes', label: 'Para dibujantes', emoji: '✍', desc: 'Marcadores, lápices y papeles profesionales.' },
  { slug: 'sets-marcadores-copic-hasta-7-un', label: 'Sets Copic chicos', emoji: '🌈', desc: 'Sets de 5-7 Copic ideales para principiantes.' },
  { slug: 'sets-marcadores-copic-10-72-unidades', label: 'Sets Copic grandes', emoji: '✨', desc: 'Sets de 10 a 72 marcadores Copic.' },
  { slug: 'sets-base-agua', label: 'Sets base agua', emoji: '💧', desc: 'Acuarela, gouache y brush pens.' },
  { slug: 'marcadores-de-pintura', label: 'Marcadores de pintura', emoji: '🎯', desc: 'POSCA, Molotow, Sharpie y más.' },
  { slug: 'ideas-navidenas', label: 'Ideas navideñas', emoji: '🎄', desc: 'Regalos pensados para diciembre.' },
];

export const dynamic = 'force-dynamic';

export default function RegalosHubPage() {
  // Validar que las landings existan en wp-archive
  const guides = GIFT_GUIDES.filter(g => getPage(g.slug));

  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-rose-600 via-orange-500 to-yellow-400 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-white/80 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-white">Regalos</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">
            Guías de regalo
          </h1>
          <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
            Ideas curadas según a quién le vas a regalar. Sets armados, packs especiales
            y combinaciones que funcionan para todos los niveles.
          </p>
        </div>
      </section>

      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {guides.map(g => (
              <Link
                key={g.slug}
                href={`/p/${g.slug}`}
                className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl p-6 transition-all hover:shadow-md"
              >
                <div className="text-4xl mb-3">{g.emoji}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:underline">
                  {g.label}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">{g.desc}</p>
                <div className="mt-4 text-xs font-semibold text-blue-600 group-hover:underline">
                  Ver guía →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿No sabés qué regalar?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Te ayudamos a elegir según presupuesto, edad y nivel del destinatario.
            Hablemos por WhatsApp.
          </p>
          <a
            href="https://wa.me/56223350961?text=Hola%21%20Quiero%20idea%20de%20regalo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider text-white"
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp →
          </a>
        </div>
      </section>
    </main>
  );
}
