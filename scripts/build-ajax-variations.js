#!/usr/bin/env node
/**
 * Brands rendered by woo-variations-table-grid expose every variant as a
 * hidden form input in the static HTML:
 *
 *   <input name="attribute_pa_color" value="451-riot-red">
 *   <input name="attribute_pa_color" value="452-pacific-blue">
 *   ...
 *
 * No per-color image survives the static markup in a reliable order, but
 * the code + name slug is enough to render the brand grid with a code
 * placeholder. When swatch images become available we slot them in later.
 *
 * Add a TARGET below to bring a new line on board.
 *
 * Usage:  node scripts/build-ajax-variations.js
 */

const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

const TARGETS = [
  {
    url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/pearlescents/pintura-cuero-angelus-pearlescents-4-onzas/',
    slug: 'angelus-pearlescents-4oz',
    productName: 'Angelus Pearlescents 4oz',
    basePriceClp: 19900,
  },
  {
    url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/neon/pintura-cuero-neon-angelus-1-oz/',
    slug: 'angelus-neon-1oz',
    productName: 'Angelus Neon 1oz',
    basePriceClp: 6900,
  },
  {
    url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/neon/pintura-cuero-neon-angelus-4-oz/',
    slug: 'angelus-neon-4oz',
    productName: 'Angelus Neon 4oz',
    basePriceClp: 19900,
  },
  {
    url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/glitterlites/pintura-cuero-glitterlites-angelus/',
    slug: 'angelus-glitterlites-1oz',
    productName: 'Angelus Glitterlites 1oz',
    basePriceClp: 6900,
  },
  {
    url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/angelus-pinturas/tintura-angelus-pinturas/tintura-cuero-angelus-3-oz/',
    slug: 'angelus-tintura-cuero-3oz',
    productName: 'Angelus Tintura Cuero 3oz',
    basePriceClp: 9900,
  },
  {
    url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/angelus-pinturas/tintura-angelus-pinturas/tintura-gamuza-angelus-3-oz/',
    slug: 'angelus-tintura-gamuza-3oz',
    productName: 'Angelus Tintura Gamuza 3oz',
    basePriceClp: 9900,
  },

  // Createx & Wicked — full variation JSON inline with per-color image URL.
  // These overwrite the older code-only files from build-from-scraped.js.
  {
    url: 'https://www.boykot.cl/tienda/uncategorized/createx-airbrush-colors-60ml-unidad/',
    slug: 'createx-airbrush-60ml',
    productName: 'Createx Airbrush 60ml',
    basePriceClp: 4900,
  },
  {
    url: 'https://www.boykot.cl/tienda/uncategorized/createx-airbrush-colors-120ml-unidad/',
    slug: 'createx-airbrush-120ml',
    productName: 'Createx Airbrush 120ml',
    basePriceClp: 7900,
  },
  {
    url: 'https://www.boykot.cl/tienda/uncategorized/createx-airbrush-colors-240ml/',
    slug: 'createx-airbrush-240ml',
    productName: 'Createx Airbrush 240ml',
    basePriceClp: 13900,
  },
  {
    url: 'https://www.boykot.cl/tienda/uncategorized/wicked-colors-480ml/',
    slug: 'wicked-colors-480ml',
    productName: 'Wicked Colors 480ml',
    basePriceClp: 26900,
  },
  {
    url: 'https://www.boykot.cl/tienda/uncategorized/createx-illustration-30ml/',
    slug: 'createx-illustration-30ml',
    productName: 'Createx Illustration 30ml',
    basePriceClp: 5900,
  },
  // ZIG
  { url: 'https://www.boykot.cl/tienda/marcadores/zig-calligraphy/', slug: 'zig-calligraphy', productName: 'ZIG Calligraphy', basePriceClp: 3900 },
  { url: 'https://www.boykot.cl/tienda/marcadores/zig-acrylista-6mm/', slug: 'zig-acrylista-6mm', productName: 'ZIG Acrylista 6mm', basePriceClp: 5500 },
  { url: 'https://www.boykot.cl/tienda/marcadores/zig-acrylista-15mm/', slug: 'zig-acrylista-15mm', productName: 'ZIG Acrylista 15mm', basePriceClp: 7900 },
  { url: 'https://www.boykot.cl/tienda/marcadores/zig-fabricolor-twin/', slug: 'zig-fabricolor-twin', productName: 'ZIG Fabricolor Twin', basePriceClp: 3500 },
  // POSCA
  { url: 'https://www.boykot.cl/tienda/marcadores/posca/uni-posca-5m-bs-1-8-2-5-mm/', slug: 'uni-posca-5m', productName: 'Uni POSCA 5M', basePriceClp: 4500 },
  // Aqua / Molotow ink
  { url: 'https://www.boykot.cl/tienda/marcadores/molotow-markers/aqua-ink/aqua-color-brush/', slug: 'aqua-color-brush', productName: 'Aqua Color Brush', basePriceClp: 4500 },
  { url: 'https://www.boykot.cl/tienda/marcadores/molotow-markers/aqua-ink/aqua-twin-unidad-pincel-bisel/', slug: 'aqua-twin', productName: 'Aqua Twin', basePriceClp: 5500 },
  // Lápices / markers misc
  { url: 'https://www.boykot.cl/tienda/lapices/boligrafo/lapiz-gel-poplol/', slug: 'poplol-gel', productName: 'Lápiz Gel POPLOL', basePriceClp: 2500 },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/marcador-copic-spica/', slug: 'atyou-spica', productName: 'Marcador Atyou Spica', basePriceClp: 3900 },
  { url: 'https://www.boykot.cl/tienda/marcadores/kirarina/kirarina-cute-unidad/', slug: 'kirarina-cute', productName: 'Kirarina Cute', basePriceClp: 3500 },
  // Pigmentos
  { url: 'https://www.boykot.cl/tienda/pintura/solar-color/solar-color-dust-10gr/', slug: 'solar-color-dust-10gr', productName: 'SOLAR Color Dust 10gr', basePriceClp: 6900 },
  { url: 'https://www.boykot.cl/tienda/pintura/solar-color/chameleon-pigments-10-gr/', slug: 'chameleon-pigments-10gr', productName: 'Chameleon Pigments 10gr', basePriceClp: 6900 },
  { url: 'https://www.boykot.cl/tienda/pintura/solar-color/ultra-thermal-dust-10gr-2/', slug: 'ultra-thermal-dust-10gr', productName: 'Ultra Thermal Dust 10gr', basePriceClp: 8900 },
];

function titleCase(slug) {
  return slug.split(/[-_]/).filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// "451-riot-red" → { code: "451", name: "Riot Red" }
// "rich-brown"  → { code: "RICHBROWN", name: "Rich Brown" } (no leading digits)
function parseSlug(value) {
  const m = value.match(/^(\d{2,4})-(.+)$/);
  if (m) return { code: m[1], name: titleCase(m[2]) };
  return { code: value.replace(/-/g, '').toUpperCase(), name: titleCase(value) };
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'BoykotScraper/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\\\//g, '/');
}

function extractFromProductVariations(html) {
  // Find data-product_variations="<encoded JSON>"
  const m = html.match(/data-product_variations="([^"]+)"/);
  if (!m) return null;
  let json;
  try {
    json = JSON.parse(decodeHtml(m[1]));
  } catch (err) {
    return null;
  }
  if (!Array.isArray(json)) return null;
  const colors = [];
  const seen = new Set();
  for (const v of json) {
    const slug = v?.attributes?.attribute_pa_color;
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const parsed = parseSlug(slug);
    const url = v?.image?.url || null;
    colors.push({
      ...parsed,
      imageUrl: url,
      variantId: v?.variation_id ?? undefined,
    });
  }
  return colors;
}

async function processTarget(t) {
  const html = await fetchHtml(t.url);

  // Best path: full variation JSON embedded in the WC variations form
  // (Createx, Wicked, etc. embed it — includes per-color imageUrl).
  let colors = extractFromProductVariations(html);

  // Fallback: just the attribute_pa_color slugs (no images).
  if (!colors || colors.length === 0) {
    const matches = [...html.matchAll(/name="attribute_pa_color" value="([^"]+)"/g)].map(m => m[1]);
    const seen = new Set();
    colors = [];
    for (const slug of matches) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      colors.push(parseSlug(slug));
    }
  }
  colors.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  const out = {
    slug: t.slug,
    productName: t.productName,
    basePriceClp: t.basePriceClp,
    bsaleProductId: 0,
    sourceUrl: t.url,
    sourceCount: colors.length,
    generatedAt: new Date().toISOString(),
    colors,
  };
  fs.writeFileSync(path.join(OUT_DIR, `${t.slug}.json`), JSON.stringify(out, null, 2));
  console.log(`  ✓ ${t.slug.padEnd(34)} ${String(colors.length).padStart(3)} colors`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const t of TARGETS) {
    try { await processTarget(t); }
    catch (err) { console.log(`  ✗ ${t.slug}: ${err.message}`); }
  }
})();
