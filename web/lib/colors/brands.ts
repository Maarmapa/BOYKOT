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

function adapt(data: JsonBrand, overrides: Partial<BrandColorSet> = {}): BrandColorSet {
  return {
    slug: data.slug,
    productName: data.productName,
    basePriceClp: data.basePriceClp ?? 0,
    bsaleProductId: data.bsaleProductId ?? 0,
    colors: data.colors,
    heroImage: data.heroImage ?? undefined,
    ...overrides,
  };
}

export const BRANDS: Record<string, BrandColorSet> = {
  // Copic — every line uses its own per-color photos from boykot.cl.
  'copic-sketch': {
    slug: 'copic-sketch',
    productName: 'Copic Sketch',
    basePriceClp: 4300,
    bsaleProductId: 2278,
    colors: COPIC_SKETCH,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg',
  },
  'copic-ink': {
    slug: 'copic-ink',
    productName: 'COPIC Ink',
    basePriceClp: 4900,
    bsaleProductId: 2978,
    colors: COPIC_INK,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
    heroImage: 'https://www.boykot.cl/wp-content/uploads/2024/12/copic_ink_1-2a9a6ef5-c971-45a8-992d-94ce10085a43.jpg',
  },
  'copic-ciao': {
    slug: 'copic-ciao',
    productName: 'Copic Ciao',
    basePriceClp: 3900,
    bsaleProductId: 2279,
    colors: COPIC_CIAO,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'copic-classic': {
    slug: 'copic-classic',
    productName: 'Copic Classic',
    basePriceClp: 3400,
    bsaleProductId: 0,
    colors: COPIC_CLASSIC,
    familyOrder: COPIC_FAMILY_ORDER,
    familyNames: COPIC_FAMILY_NAMES,
  },
  'copic-wide': {
    slug: 'copic-wide',
    productName: 'Copic Wide',
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
