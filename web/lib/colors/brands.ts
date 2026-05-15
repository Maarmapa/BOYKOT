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

// Angelus Pintura Cuero sub-líneas extraídas del consolidado BSale 2262
// (separadas por SKU prefix vía build-extended-maps).
import angelusStandardPint from '../../public/colors/angelus-standard-pint.json';
import angelusStandardQuart from '../../public/colors/angelus-standard-quart.json';
import angelusCollector from '../../public/colors/angelus-collector.json';
import angelusGlow1oz from '../../public/colors/angelus-glow-1oz.json';

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

// BSale variant maps por brand-slug (generado por /api/bsale/build-all-maps).
// adapt() hidrata color.variantId automáticamente desde acá.
import bsaleVariants from '../../data/bsale-variants-all.json';
const VARIANTS_BY_BRAND = (bsaleVariants as { by_brand: Record<string, Record<string, number>> }).by_brand;

interface JsonBrand {
  slug: string;
  productName: string;
  basePriceClp?: number;
  bsaleProductId: number | null;
  heroImage?: string | null;
  colorChartImage?: string | null;
  description?: string | null;
  gallery?: string[] | null;
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
  // Hydra variantId desde bsale-variants-all.json si hay mapa para este brand.
  // Match por code exacto (B00 → variantId 25708 para sketch, etc).
  const variantMap = VARIANTS_BY_BRAND[overrides.slug ?? data.slug];
  const colors = variantMap
    ? data.colors.map(c => ({
        ...c,
        variantId: c.variantId ?? variantMap[c.code] ?? variantMap[c.code.toUpperCase()],
      }))
    : data.colors;

  return {
    slug: data.slug,
    brandName,
    productName,
    basePriceClp: data.basePriceClp ?? 0,
    bsaleProductId: data.bsaleProductId ?? 0,
    colors,
    heroImage: data.heroImage ?? heroMap[data.slug] ?? undefined,
    description: data.description ?? undefined,
    gallery: data.gallery ?? undefined,
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
    bsaleProductId: 2280,
    colors: COPIC_WIDE,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },

  // Molotow — 132 colors via web scrape (BSale catalog only listed 50)
  'molotow-premium': adapt(molotowPremiumWeb as JsonBrand, { basePriceClp: 6000 }),
  'molotow-premium-neon': adapt(molotowPremiumNeon as JsonBrand, { basePriceClp: 6000, bsaleProductId: 2238 }),
  'molotow-premium-plus': adapt(molotowPremiumPlus as JsonBrand, { basePriceClp: 7900, bsaleProductId: 2239 }),

  // Holbein — via woo-variations-table-grid AJAX selector
  'holbein-acuarela-15ml': adapt(holbein15ml as JsonBrand, { basePriceClp: 5900 }),
  'holbein-acuarela-60ml': adapt(holbein60ml as JsonBrand, { basePriceClp: 19900 }),

  // Angelus Pintura Cuero (BSale productId 2262 consolida 10 sub-lineas).
  // Cada sub-slug se mapea por SKU prefix en bsale-variants-all.json:
  //   ANGE72001=standard-1oz, ANGE72004=standard-4oz, 720PT=pint, ANGE720QT=quart,
  //   ANGE72501/04=neon, ANGE73201+73301/ANGE73204+73304=pearlescents,
  //   ANGE72701=collector, ANGE72101=glow.
  'angelus-standard-1oz': adapt(angelusStandard1oz as JsonBrand, {
    basePriceClp: 5500,
    bsaleProductId: 2262,
    heroImage: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg?2020',
  }),
  'angelus-pearlescents-1oz': adapt(angelusPearlescents1oz as JsonBrand, {
    basePriceClp: 6900,
    bsaleProductId: 2262,
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2023/03/gold-1-d1d3c915-a8bf-439d-8dbb-6f5bbadbb5c8.png',
    description: 'Pintura para cuero con terminación perlada iridiscente. 7 colores metálicos brillantes — ideales para zapatillas y proyectos con efectos especiales.',
  }),
  'angelus-pearlescents-4oz': adapt(angelusPearlescents4oz as JsonBrand, { basePriceClp: 19900, bsaleProductId: 2262 }),
  'angelus-neon-1oz': adapt(angelusNeon1oz as JsonBrand, { basePriceClp: 6900, bsaleProductId: 2262 }),
  'angelus-neon-4oz': adapt(angelusNeon4oz as JsonBrand, { basePriceClp: 19900, bsaleProductId: 2262 }),
  'angelus-glitterlites-1oz': adapt(angelusGlitterlites as JsonBrand, { basePriceClp: 6900, bsaleProductId: 2263 }),
  'angelus-standard-pint': adapt(angelusStandardPint as JsonBrand, { basePriceClp: 39900, bsaleProductId: 2262 }),
  'angelus-standard-quart': adapt(angelusStandardQuart as JsonBrand, { basePriceClp: 69900, bsaleProductId: 2262 }),
  'angelus-collector': adapt(angelusCollector as JsonBrand, { basePriceClp: 7900, bsaleProductId: 2262 }),
  'angelus-glow-1oz': adapt(angelusGlow1oz as JsonBrand, { basePriceClp: 6900, bsaleProductId: 2262 }),
  'angelus-tintura-cuero-3oz': adapt(angelusTinturaCuero as JsonBrand, { basePriceClp: 9900, bsaleProductId: 2264 }),
  'angelus-tintura-gamuza-3oz': adapt(angelusTinturaGamuza as JsonBrand, { basePriceClp: 9900, bsaleProductId: 2265 }),

  // Angelus Standard 4oz — cluster of one-product-per-color (87 photos).
  'angelus-standard-4oz': adapt(angelus4oz as JsonBrand, {
    slug: 'angelus-standard-4oz',
    productName: 'Angelus Pintura Cuero Standard 4oz',
    basePriceClp: 16500,
    bsaleProductId: 2262,
  }),

  // Holbein lines — codes + images extracted from per-product JSON-LD
  // Note: 2693 is "Gouache Serie A 15ml" (regular gouache); 2690 is Acryla.
  'holbein-gouache-15ml': adapt(holbeinGouache15ml as JsonBrand, { bsaleProductId: 2693 }),
  'holbein-oleo-20ml': adapt(holbeinOleo20ml as JsonBrand, { bsaleProductId: 2670 }),
  'holbein-acryla-gouache-20ml': adapt(holbeinAcryla20ml as JsonBrand),
  'holbein-acryla-gouache-40ml': adapt(holbeinAcryla40ml as JsonBrand),

  // Createx — BSale IDs confirmados via /api/bsale/list-all-products?q=createx
  // 3180=60ml, 3187=120ml, 3186=240ml, 3196=Illustration 30ml.
  'createx-airbrush-60ml': adapt(createx60 as JsonBrand, { bsaleProductId: 3180 }),
  'createx-airbrush-120ml': adapt(createx120 as JsonBrand, { bsaleProductId: 3187 }),
  'createx-airbrush-240ml': adapt(createx240 as JsonBrand, { bsaleProductId: 3186 }),
  'createx-illustration-30ml': adapt(createxIllustration as JsonBrand, { bsaleProductId: 3196 }),
  'wicked-colors-480ml': adapt(wickedColors480 as JsonBrand, { bsaleProductId: 3189 }),

  // ZIG
  'zig-calligraphy': adapt(zigCalligraphy as JsonBrand, { bsaleProductId: 3035 }),
  'zig-acrylista-6mm': adapt(zigAcrylista6 as JsonBrand, { bsaleProductId: 3024 }),
  'zig-acrylista-15mm': adapt(zigAcrylista15 as JsonBrand, { bsaleProductId: 3025 }),
  'zig-fabricolor-twin': adapt(zigFabricolor as JsonBrand, { bsaleProductId: 3023 }),

  // Pigmentos
  'solar-color-dust-10gr': adapt(solarColorDust as JsonBrand),
  'chameleon-pigments-10gr': adapt(chameleonPigments as JsonBrand),
  'ultra-thermal-dust-10gr': adapt(ultraThermalDust as JsonBrand),

  // Otros marcadores
  'aqua-color-brush': adapt(aquaColorBrush as JsonBrand, { bsaleProductId: 2797 }),
  'uni-posca-5m': adapt(uniPosca5M as JsonBrand, { bsaleProductId: 2956 }),
  'poplol-gel': adapt(poplolGel as JsonBrand),
  'atyou-spica': adapt(atyouSpica as JsonBrand),
  'kirarina-cute': adapt(kirarinaCute as JsonBrand),
  'aqua-twin': adapt(aquaTwin as JsonBrand, { bsaleProductId: 2419 }),
};

export const BRAND_SLUGS = Object.keys(BRANDS);
