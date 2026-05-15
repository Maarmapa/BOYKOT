import type { BrandColorSet, ColorSwatch } from './types';
import {
  COPIC_SKETCH, COPIC_INK, COPIC_CIAO, COPIC_CLASSIC, COPIC_WIDE,
  COPIC_FAMILY_ORDER, COPIC_FAMILY_NAMES,
} from './copic';

// BSale-sourced (catalog.json → scripts/build-brand-colors.js)
// Note: molotow-premium uses the 132-color web scrape (more complete) — see below.
import molotowPremiumWeb from '../../public/colors/molotow-premium-400ml.json';
import molotowPremiumNeon from '../../public/colors/molotow-premium-neon.json';
import molotowPremiumPlus from '../../public/colors/molotow-premium-plus.json';

// AJAX-rendered (scripts/fetch-ajax-brands.js)
import holbein15ml from '../../public/colors/holbein-acuarela-15ml.json';
import holbein60ml from '../../public/colors/holbein-acuarela-60ml.json';

// Hero image map (built by `node scripts/build-hero-images.js`)
import heroImages from '../../public/colors/_hero-images.json';

// Angelus 4oz cluster (one product page per color, photos of the bottle).
import angelus4oz from '../../public/colors/angelus-leather-paint-4oz.json';

// Angelus Standard 1oz with theme swatches (bwe-grouped page).
import angelusStandard1oz from '../../public/colors/angelus-standard-1oz.json';
import angelusPearlescents1oz from '../../public/colors/angelus-pearlescents-1oz.json';

// Angelus AJAX-rendered lines (woo-variations-table-grid)
import angelusPearlescents4oz from '../../public/colors/angelus-pearlescents-4oz.json';
import angelusNeon1oz from '../../public/colors/angelus-neon-1oz.json';
import angelusNeon4oz from '../../public/colors/angelus-neon-4oz.json';
import angelusGlitterlites from '../../public/colors/angelus-glitterlites-1oz.json';
import angelusTinturaCuero from '../../public/colors/angelus-tintura-cuero-3oz.json';
import angelusTinturaGamuza from '../../public/colors/angelus-tintura-gamuza-3oz.json';

// Holbein individuals: image+sku extracted from JSON-LD background CSS
// (scripts/build-holbein-individual.js).
import holbeinGouache15ml from '../../public/colors/holbein-gouache-15ml.json';
import holbeinOleo20ml from '../../public/colors/holbein-oleo-20ml.json';
import holbeinAcryla20ml from '../../public/colors/holbein-acryla-gouache-20ml.json';
import holbeinAcryla40ml from '../../public/colors/holbein-acryla-gouache-40ml.json';

// Scraper-sourced (scraped/products/*.json → scripts/build-from-scraped.js)
import createx60 from '../../public/colors/createx-airbrush-60ml.json';
import createx120 from '../../public/colors/createx-airbrush-120ml.json';
import createx240 from '../../public/colors/createx-airbrush-240ml.json';
import createxIllustration from '../../public/colors/createx-illustration-30ml.json';
import wickedColors480 from '../../public/colors/wicked-colors-480ml.json';
import zigCalligraphy from '../../public/colors/zig-calligraphy.json';
import zigAcrylista6 from '../../public/colors/zig-acrylista-6mm.json';
import zigAcrylista15 from '../../public/colors/zig-acrylista-15mm.json';
import zigFabricolor from '../../public/colors/zig-fabricolor-twin.json';
import solarColorDust from '../../public/colors/solar-color-dust-10gr.json';
import chameleonPigments from '../../public/colors/chameleon-pigments-10gr.json';
import ultraThermalDust from '../../public/colors/ultra-thermal-dust-10gr.json';
import aquaColorBrush from '../../public/colors/aqua-color-brush.json';
import uniPosca5M from '../../public/colors/uni-posca-5m.json';
import poplolGel from '../../public/colors/poplol-gel.json';
import atyouSpica from '../../public/colors/atyou-spica.json';
import kirarinaCute from '../../public/colors/kirarina-cute.json';
import aquaTwin from '../../public/colors/aqua-twin.json';

interface JsonBrand {
  slug: string;
  productName: string;
  basePriceClp?: number;
  bsaleProductId: number | null;
  heroImage?: string | null;
  colorChartImage?: string | null;
  colors: ColorSwatch[];
}

const heroMap = heroImages as Record<string, string>;

function adapt(data: JsonBrand, overrides: Partial<BrandColorSet> = {}): BrandColorSet {
  // Split "Brand Product Line" → brandName + productName when possible.
  // Heuristic: first word becomes brandName (Angelus / Holbein / Createx / etc.)
  // unless overrides already supply one. The full string stays as productName
  // fallback when the split makes no sense.
  let brandName = overrides.brandName;
  let productName = overrides.productName ?? data.productName;
  if (!brandName) {
    const first = (data.productName || '').split(' ')[0];
    if (['Angelus', 'Holbein', 'Molotow', 'Createx', 'Wicked', 'ZIG', 'POSCA',
         'Uni', 'POPLOL', 'Atyou', 'Kirarina', 'SOLAR', 'Chameleon', 'Ultra',
         'Aqua', 'Copic', 'COPIC'].includes(first)) {
      brandName = first;
      productName = data.productName.slice(first.length).trim() || data.productName;
    }
  }
  return {
    slug: data.slug,
    brandName,
    productName,
    basePriceClp: data.basePriceClp ?? 0,
    bsaleProductId: data.bsaleProductId ?? 0,
    colors: data.colors,
    heroImage: data.heroImage ?? heroMap[data.slug] ?? undefined,
    ...overrides,
  };
}

export const BRANDS: Record<string, BrandColorSet> = {
  // Copic — every line uses its own per-color photos from boykot.cl.
  'copic-sketch': {
    slug: 'copic-sketch',
    brandName: 'Copic',
    productName: 'Sketch',
    basePriceClp: 4300,
    bsaleProductId: 2278,
    colors: COPIC_SKETCH,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
    description: 'Nuestro marcador icónico original se lanzó en 1987 y amado por los profesionales creativos desde entonces. Recargable, ergonómico, ultra-mezclable y elaborado con el más alto grado de tintas a base de alcohol. Compatible con el juego de aerógrafo Copic. Ideal para ilustración gráfica y arquitectónica.',
    gallery: [
      'https://www.boykot.cl/wp-content/uploads/2021/07/feature1_sketch-1.jpeg',
      'https://www.boykot.cl/wp-content/uploads/2021/07/feature2_sketch-2.jpeg',
      'https://www.boykot.cl/wp-content/uploads/2021/07/12d213b6-f39d-49e6-8df4-323427c41607-3_sketch_color_chart.jpeg',
    ],
  },
  'copic-ink': {
    slug: 'copic-ink',
    brandName: 'Copic',
    productName: 'Ink',
    basePriceClp: 4900,
    bsaleProductId: 2978,
    colors: COPIC_INK,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2024/12/copic_ink_1-2a9a6ef5-c971-45a8-992d-94ce10085a43.jpg',
    description: 'Tinta de recarga concentrada para todos los marcadores Copic. Los mismos 358 códigos que Copic Sketch — usá la carta para elegir y agregar las tintas que necesitás.',
    gallery: [
      'https://www.boykot.cl/wp-content/uploads/2024/12/copic_ink_2-ca2425ce-e233-4308-87ce-c2383f56cc30.jpg',
      'https://www.boykot.cl/wp-content/uploads/2024/12/copic_ink_3-8e7276a3-d550-427d-b2f8-3981ec7928bc.jpg',
      'https://www.boykot.cl/wp-content/uploads/2024/12/copic_ink_4-ab7d9170-6c92-4f62-ab03-fd1dd1cd8103.jpg',
    ],
  },
  'copic-ciao': {
    slug: 'copic-ciao',
    brandName: 'Copic',
    productName: 'Ciao',
    basePriceClp: 3900,
    bsaleProductId: 2279,
    colors: COPIC_CIAO,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'copic-classic': {
    slug: 'copic-classic',
    brandName: 'Copic',
    productName: 'Classic',
    basePriceClp: 3400,
    bsaleProductId: 0,
    colors: COPIC_CLASSIC,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'copic-wide': {
    slug: 'copic-wide',
    brandName: 'Copic',
    productName: 'Wide',
    basePriceClp: 5300,
    bsaleProductId: 0,
    colors: COPIC_WIDE,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },

  // Molotow — 132 colors via web scrape (BSale catalog only listed 50)
  'molotow-premium': adapt(molotowPremiumWeb as JsonBrand, { basePriceClp: 6000 }),
  'molotow-premium-neon': adapt(molotowPremiumNeon as JsonBrand, { basePriceClp: 6000 }),
  'molotow-premium-plus': adapt(molotowPremiumPlus as JsonBrand, { basePriceClp: 7900 }),

  // Holbein — via woo-variations-table-grid AJAX selector
  'holbein-acuarela-15ml': adapt(holbein15ml as JsonBrand, { basePriceClp: 5900 }),
  'holbein-acuarela-60ml': adapt(holbein60ml as JsonBrand, { basePriceClp: 19900 }),

  // Angelus Standard 1oz — preferred: bwe-grouped theme swatches with names merged
  'angelus-standard-1oz': adapt(angelusStandard1oz as JsonBrand, {
    basePriceClp: 5500,
    heroImage: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg?2020',
  }),
  'angelus-pearlescents-1oz': adapt(angelusPearlescents1oz as JsonBrand, {
    basePriceClp: 6900,
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2023/03/gold-1-d1d3c915-a8bf-439d-8dbb-6f5bbadbb5c8.png',
    description: 'Pintura para cuero con terminación perlada iridiscente. 7 colores metálicos brillantes — ideales para zapatillas y proyectos con efectos especiales.',
  }),
  'angelus-pearlescents-4oz': adapt(angelusPearlescents4oz as JsonBrand, { basePriceClp: 19900 }),
  'angelus-neon-1oz': adapt(angelusNeon1oz as JsonBrand, { basePriceClp: 6900 }),
  'angelus-neon-4oz': adapt(angelusNeon4oz as JsonBrand, { basePriceClp: 19900 }),
  'angelus-glitterlites-1oz': adapt(angelusGlitterlites as JsonBrand, { basePriceClp: 6900 }),
  'angelus-tintura-cuero-3oz': adapt(angelusTinturaCuero as JsonBrand, { basePriceClp: 9900 }),
  'angelus-tintura-gamuza-3oz': adapt(angelusTinturaGamuza as JsonBrand, { basePriceClp: 9900 }),

  // Angelus Standard 4oz — cluster of one-product-per-color (87 photos).
  // No theme swatch source like the 1oz, so we keep the bottle photos.
  // Note: JSON file still uses the legacy slug — override it here so the
  // registry key matches the public URL exactly.
  'angelus-standard-4oz': adapt(angelus4oz as JsonBrand, {
    slug: 'angelus-standard-4oz',
    productName: 'Angelus Pintura Cuero Standard 4oz',
    basePriceClp: 16500,
  }),

  // Holbein lines — codes + images extracted from per-product JSON-LD
  'holbein-gouache-15ml': adapt(holbeinGouache15ml as JsonBrand),
  'holbein-oleo-20ml': adapt(holbeinOleo20ml as JsonBrand),
  'holbein-acryla-gouache-20ml': adapt(holbeinAcryla20ml as JsonBrand),
  'holbein-acryla-gouache-40ml': adapt(holbeinAcryla40ml as JsonBrand),

  // Createx — scraper-sourced
  'createx-airbrush-60ml': adapt(createx60 as JsonBrand),
  'createx-airbrush-120ml': adapt(createx120 as JsonBrand),
  'createx-airbrush-240ml': adapt(createx240 as JsonBrand),
  'createx-illustration-30ml': adapt(createxIllustration as JsonBrand),
  'wicked-colors-480ml': adapt(wickedColors480 as JsonBrand),

  // ZIG
  'zig-calligraphy': adapt(zigCalligraphy as JsonBrand),
  'zig-acrylista-6mm': adapt(zigAcrylista6 as JsonBrand),
  'zig-acrylista-15mm': adapt(zigAcrylista15 as JsonBrand),
  'zig-fabricolor-twin': adapt(zigFabricolor as JsonBrand),

  // Pigmentos
  'solar-color-dust-10gr': adapt(solarColorDust as JsonBrand),
  'chameleon-pigments-10gr': adapt(chameleonPigments as JsonBrand),
  'ultra-thermal-dust-10gr': adapt(ultraThermalDust as JsonBrand),

  // Otros marcadores
  'aqua-color-brush': adapt(aquaColorBrush as JsonBrand),
  'uni-posca-5m': adapt(uniPosca5M as JsonBrand),
  'poplol-gel': adapt(poplolGel as JsonBrand),
  'atyou-spica': adapt(atyouSpica as JsonBrand),
  'kirarina-cute': adapt(kirarinaCute as JsonBrand),
  'aqua-twin': adapt(aquaTwin as JsonBrand),
};

export const BRAND_SLUGS = Object.keys(BRANDS);
