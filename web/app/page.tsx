import Link from 'next/link';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

const HERO = {
  title: 'Arte y graffiti — distribuidor oficial en Chile',
  subtitle:
    'Copic · Angelus · Holbein · Molotow · Createx · ZIG · POSCA y más. Despacho a todo Chile, gratis sobre $50.000.',
  cta: { label: 'Ver cartas de color', href: '/colores' },
};

const BRAND_BLOCKS = [
  {
    name: 'Copic',
    subtitle: '358 marcadores · 6 líneas',
    href: '/colores/copic-sketch',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
  },
  {
    name: 'Angelus',
    subtitle: 'Pintura cuero · 88 colores',
    href: '/colores/angelus-standard-1oz',
    image: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg',
  },
  {
    name: 'Holbein',
    subtitle: 'Acuarela · Óleo · Gouache',
    href: '/colores/holbein-oleo-20ml',
    image: 'https://www.boykot.cl/wp-content/uploads/2025/07/170908red_tex_new_fx-ec0ab6c9-e1dc-4f63-af58-b2e177b4ece3-4.jpg',
  },
  {
    name: 'Molotow',
    subtitle: 'Premium 400ml · 224 colores',
    href: '/colores/molotow-premium',
    image: 'https://www.boykot.cl/wp-content/uploads/2024/10/p00327000-ef9dadfd-968f-4c16-bd8d-ca991af72c30.jpg',
  },
  {
    name: 'Createx',
    subtitle: 'Airbrush · Wicked',
    href: '/colores/createx-airbrush-60ml',
    image: 'https://www.boykot.cl/wp-content/uploads/2024/09/airbrush_demo_01_60-22e7c419-0ea1-4d54-9b07-01fc7470781b.jpg',
  },
  {
    name: 'ZIG',
    subtitle: 'Calligraphy · Acrylista · Fabricolor',
    href: '/colores/zig-calligraphy',
    image: 'https://www.boykot.cl/wp-content/uploads/2021/05/logoheader-2021.png',
  },
];

export default function HomePage() {
  const featured = BRAND_SLUGS.map(s => BRANDS[s])
    .filter(b => b.colors.length >= 30)
    .sort((a, b) => b.colors.length - a.colors.length)
    .slice(0, 8);

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
            {HERO.title}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {HERO.subtitle}
          </p>
          <Link
            href={HERO.cta.href}
            className="inline-block px-6 py-3 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#0066ff' }}
          >
            {HERO.cta.label}
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-6">
          Marcas destacadas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {BRAND_BLOCKS.map(b => (
            <Link
              key={b.name}
              href={b.href}
              className="group flex flex-col items-center text-center p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 mb-3">
                <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">{b.name}</div>
              <div className="text-[11px] text-gray-500 mt-1">{b.subtitle}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Cartas de color
              </h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                Elegí color por color, en tiempo real
              </p>
            </div>
            <Link href="/colores" className="text-sm text-gray-700 hover:text-gray-900 font-medium">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.map(brand => (
              <Link
                key={brand.slug}
                href={`/colores/${brand.slug}`}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-gray-300 transition-colors group"
              >
                <div className="relative w-full bg-gray-50" style={{ paddingBottom: '70%' }}>
                  {brand.heroImage ? (
                    <img
                      src={brand.heroImage}
                      alt={brand.productName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {brand.productName}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {brand.colors.length} colores · ${brand.basePriceClp.toLocaleString('es-CL')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">
          Comunidad
        </h2>
        <p className="text-2xl font-bold text-gray-900 mb-3">Síguenos en Instagram</p>
        <a
          href="https://instagram.com/boykot187"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-700 hover:text-gray-900 underline underline-offset-4"
        >
          @boykot187
        </a>
      </section>
    </main>
  );
}
