import Link from 'next/link';
import { BRANDS_META } from '@/lib/brands-meta';

export const metadata = {
  title: 'Promociones · Boykot',
  description:
    'Descuentos, kits, packs y promociones especiales en marcadores Copic, pinturas Angelus y aerosoles Molotow.',
};

// Promociones manuales (curadas por el dueño). Hoy son placeholders que
// el user puede ir actualizando manualmente — futuro: tabla en Supabase
// + admin UI para editarlas en vivo.
interface Promo {
  slug: string;
  title: string;
  subtitle: string;
  discount?: string;
  href: string;
  image: string;
  badge?: string;
}

const PROMOS: Promo[] = [
  {
    slug: 'copic-set-72',
    title: 'Sets Copic Sketch',
    subtitle: 'Sets de 12, 24, 36, 72 colores. Mejor precio que comprar individual.',
    discount: 'Hasta 15% off',
    href: '/marca/copic',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
    badge: 'Set',
  },
  {
    slug: 'angelus-kit-starter',
    title: 'Angelus Starter Kit',
    subtitle: 'Kit básico custom sneakers — 5 pinturas + deglazer + pinceles.',
    discount: '$51.000',
    href: '/marca/angelus',
    image: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg?2020',
    badge: 'Kit',
  },
  {
    slug: 'molotow-pack-graffiti',
    title: 'Packs Molotow Premium',
    subtitle: 'Packs de 6, 12 latas con descuento por volumen.',
    discount: 'Desde $34.500',
    href: '/marca/molotow',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/06/b1b1a265-9f84-4d0c-b3fc-70da7332afa1-337995_1_ufa_uv-varnish_1.png',
    badge: 'Pack',
  },
  {
    slug: 'holbein-acuarela-set',
    title: 'Holbein Set Acuarela',
    subtitle: 'Sets de 12, 18, 24, 48 colores en tubos 5ml y 15ml.',
    discount: 'Desde $42.900',
    href: '/marca/holbein',
    image: 'https://www.boykot.cl/wp-content/uploads/2018/12/H001.jpg',
    badge: 'Set',
  },
];

export default function PromocionesPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-600 via-orange-500 to-yellow-400 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-white/80 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-white">Promociones</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight">
            Promociones Boykot
          </h1>
          <p className="text-lg text-white/90 max-w-2xl leading-relaxed">
            Sets, kits, packs y descuentos por volumen en las mejores marcas de arte
            e ilustración profesional.
          </p>
        </div>
      </section>

      {/* Promo grid */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {PROMOS.map(promo => (
              <Link
                key={promo.slug}
                href={promo.href}
                className="group block bg-white border border-gray-200 hover:border-gray-900 rounded-xl overflow-hidden transition-all hover:shadow-xl"
              >
                <div className="grid grid-cols-2">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 sm:p-6 flex flex-col justify-center">
                    {promo.badge && (
                      <div className="inline-block self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-rose-50 text-rose-700 rounded mb-2">
                        {promo.badge}
                      </div>
                    )}
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                      {promo.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-3">
                      {promo.subtitle}
                    </p>
                    {promo.discount && (
                      <div className="text-sm font-bold text-rose-700 mb-3">{promo.discount}</div>
                    )}
                    <div className="text-xs font-semibold text-gray-900 group-hover:underline">
                      Ver →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* B2B mayorista */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Mayoristas / B2B
              </div>
              <h2 className="text-3xl sm:text-4xl text-gray-900 mb-3">
                Precios especiales para retail y academias
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                Si tenés una tienda de arte, academia, escuela o estudio profesional, accedé
                a precios mayoristas, condiciones especiales de pago y catálogos exclusivos.
              </p>
              <Link
                href="/b2b"
                className="inline-block text-white px-7 py-3.5 rounded-md font-semibold text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#0066ff' }}
              >
                Programa B2B →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['copic', 'angelus', 'holbein', 'molotow'] as const).map(slug => {
                const meta = BRANDS_META[slug];
                if (!meta) return null;
                return (
                  <div key={slug} className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={meta.heroImage}
                      alt={meta.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp para promos custom */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl mb-3">¿Buscás un set específico?</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm sm:text-base">
            Te podemos armar un set custom de Copic, Angelus o Holbein con los colores
            que necesites y precio especial por volumen.
          </p>
          <a
            href="https://wa.me/56223350961?text=Hola!%20Quiero%20armar%20un%20set%20custom"
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
