// Metadata por marca para las landing pages /marca/[slug].
// Cada marca agrupa sus sub-líneas (cartas de color) + descripción +
// hero image + sello "Distribuidor oficial Chile".

export interface BrandSubLine {
  name: string;       // "Sketch", "Ciao", "Ink"
  slug: string;       // slug del color set en /colores/[slug]
  description: string;
  colors: number;     // cantidad de colores
  priceFrom?: number; // CLP precio desde
}

export interface BrandMeta {
  slug: string;       // 'copic', 'angelus', 'holbein', 'molotow'
  name: string;       // 'Copic', 'Angelus'...
  tagline: string;
  description: string;
  origin: string;     // 'Japón', 'Estados Unidos'
  since: string;      // '1987'
  heroImage: string;
  logo?: string;
  officialDistributor: boolean;
  subLines: BrandSubLine[];
  highlights: string[];
}

export const BRANDS_META: Record<string, BrandMeta> = {
  copic: {
    slug: 'copic',
    name: 'Copic',
    tagline: 'Marcadores base alcohol · Estándar profesional',
    description: 'Copic es el marcador base alcohol estándar de la industria de manga, ilustración profesional y diseño gráfico. Fabricado en Japón desde 1987 por Too Corporation. Tintas recargables, ergonómico, ultra-mezclable. Boykot es distribuidor oficial en Chile.',
    origin: 'Japón',
    since: '1987',
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
    officialDistributor: true,
    subLines: [
      { name: 'Sketch', slug: 'copic-sketch', description: 'El icónico — punta súper brush flexible, 358 colores, recargable.', colors: 358, priceFrom: 4300 },
      { name: 'Ciao', slug: 'copic-ciao', description: 'Versión económica para estudiantes — 180 colores, mismo color que Sketch.', colors: 180, priceFrom: 3900 },
      { name: 'Ink', slug: 'copic-ink', description: 'Tinta de recarga concentrada para todos los marcadores Copic — 358 colores.', colors: 358, priceFrom: 4900 },
      { name: 'Wide', slug: 'copic-wide', description: 'Punta ancha de 21mm para bocetos grandes y backgrounds — 36 colores.', colors: 36, priceFrom: 5300 },
      { name: 'Classic', slug: 'copic-classic', description: 'La línea profesional original — 214 colores, recargable.', colors: 214, priceFrom: 3400 },
    ],
    highlights: [
      'Tintas base alcohol sin ácido',
      'Recargables — durabilidad de años',
      'Hasta 12 mezclas perfectas por color',
      'Estándar en industria manga + diseño',
    ],
  },
  angelus: {
    slug: 'angelus',
    name: 'Angelus',
    tagline: 'Pinturas para cuero · Custom sneakers profesional',
    description: 'Angelus es el estándar mundial en pinturas acrílicas para cuero. Usado por customizadores de sneakers, restauradores de calzado, y artistas textiles. Flexible, durable, secado rápido — no agrieta. Fabricado en USA desde 1907. Boykot es distribuidor oficial en Chile.',
    origin: 'Estados Unidos',
    since: '1907',
    heroImage: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg?2020',
    officialDistributor: true,
    subLines: [
      { name: 'Standard 1oz', slug: 'angelus-standard-1oz', description: 'Pintura para cuero clásica en 88 colores. Formato 30ml.', colors: 88, priceFrom: 5500 },
      { name: 'Standard 4oz', slug: 'angelus-standard-4oz', description: 'Misma calidad standard, formato 120ml para proyectos grandes.', colors: 88, priceFrom: 16500 },
      { name: 'Pearlescents', slug: 'angelus-pearlescents-1oz', description: 'Acabado perlado iridiscente. 7 colores metálicos.', colors: 7, priceFrom: 6900 },
      { name: 'Neon', slug: 'angelus-neon-1oz', description: 'Pintura fluorescente bajo luz UV. 12 colores vibrantes.', colors: 12, priceFrom: 6900 },
      { name: 'Glitterlites', slug: 'angelus-glitterlites-1oz', description: 'Pintura con glitter incorporado. 19 colores brillantes.', colors: 19, priceFrom: 6900 },
      { name: 'Collector', slug: 'angelus-collector', description: 'Colección especial limitada — 30 colores exclusivos.', colors: 30, priceFrom: 7900 },
      { name: 'Tintura Cuero', slug: 'angelus-tintura-cuero-3oz', description: 'Tinte para cuero (no opaca, penetra) — 39 colores.', colors: 39, priceFrom: 9900 },
      { name: 'Tintura Gamuza', slug: 'angelus-tintura-gamuza-3oz', description: 'Tinte específico para gamuza/suede — 25 colores.', colors: 25, priceFrom: 9900 },
    ],
    highlights: [
      'Estándar mundial custom sneakers',
      'Flexible — no agrieta con el uso',
      'Secado rápido (30 min al tacto)',
      'Compatible con todos los tipos de cuero',
    ],
  },
  holbein: {
    slug: 'holbein',
    name: 'Holbein',
    tagline: 'Acuarela, gouache, óleo · Calidad japonesa premium',
    description: 'Holbein Artists Materials es el fabricante japonés de pinturas premium para artistas profesionales. Más de 100 años perfeccionando pigmentos finos, granulación controlada y consistencia perfecta. Acuarela, óleo, gouache, acryla — todo de calidad museográfica. Boykot es distribuidor oficial en Chile.',
    origin: 'Japón',
    since: '1900',
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2018/12/H001.jpg',
    officialDistributor: true,
    subLines: [
      { name: 'Acuarela 15ml', slug: 'holbein-acuarela-15ml', description: 'Artist Watercolor (HWC) — 120 colores en 6 series A-F.', colors: 120, priceFrom: 5900 },
      { name: 'Acuarela 60ml', slug: 'holbein-acuarela-60ml', description: 'Formato grande para artistas profesionales — 38 colores series A-D.', colors: 38, priceFrom: 19900 },
      { name: 'Óleo 20ml', slug: 'holbein-oleo-20ml', description: 'Óleo profesional — 179 colores en 11 series.', colors: 179, priceFrom: 6400 },
      { name: 'Gouache 15ml', slug: 'holbein-gouache-15ml', description: 'Designer Gouache — 89 colores en 6 series A-G.', colors: 89, priceFrom: 5900 },
      { name: 'Acryla Gouache 20ml', slug: 'holbein-acryla-gouache-20ml', description: 'Gouache acrílico — combinación gouache + resistencia al agua. 107 colores.', colors: 107, priceFrom: 5900 },
      { name: 'Acryla Gouache 40ml', slug: 'holbein-acryla-gouache-40ml', description: 'Formato grande del icónico acryla gouache japonés. 93 colores.', colors: 93, priceFrom: 9900 },
    ],
    highlights: [
      'Pigmentos finamente molidos en Japón',
      'Series por costo del pigmento (A-G)',
      'Sin uso de agentes dispersantes baratos',
      'Calidad museográfica reconocida',
    ],
  },
  molotow: {
    slug: 'molotow',
    name: 'Molotow',
    tagline: 'Aerosoles graffiti · Estándar mundial premium',
    description: 'Molotow es la marca premium del mundo graffiti y street art. Aerosoles con pigmentos 4-veces molidos, tecnología covers-all™ y all-season™. Usado por los mejores writers globalmente. Made in Germany. Boykot distribuye toda la línea: Premium, Neon, Plus, Burner, One4All.',
    origin: 'Alemania',
    since: '1996',
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2021/06/b1b1a265-9f84-4d0c-b3fc-70da7332afa1-337995_1_ufa_uv-varnish_1.png',
    officialDistributor: false,
    subLines: [
      { name: 'Premium 400ml', slug: 'molotow-premium', description: 'El icónico aerosol — 224 colores. Estándar absoluto del graffiti premium.', colors: 224, priceFrom: 6000 },
      { name: 'Premium Neon', slug: 'molotow-premium-neon', description: 'Pigmentos fluorescentes para piezas y highlights. 8 colores.', colors: 8, priceFrom: 6000 },
      { name: 'Premium Plus', slug: 'molotow-premium-plus', description: 'Edición especial con 12 colores fuera del catálogo regular.', colors: 12, priceFrom: 7900 },
      { name: 'Burner', slug: 'molotow-burner', description: 'Acabado metálico (chrome, gold, copper, black). Cobertura máxima.', colors: 7, priceFrom: 5990 },
    ],
    highlights: [
      'Tecnologías no-dust™, anti-drip™, covers-all™',
      'Pigmentos 4-veces molidos = máxima cobertura',
      'all-season™ funciona -10°C a +50°C',
      'Usado por los top writers globales',
    ],
  },
};

export const BRAND_META_SLUGS = Object.keys(BRANDS_META);
