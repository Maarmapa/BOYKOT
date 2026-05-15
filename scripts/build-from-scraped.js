#!/usr/bin/env node
/**
 * Build web/public/colors/{slug}.json from scraped/products/{slug}.json for any
 * product Boykot's WooCommerce exposes as a variable with code-prefixed labels
 * (Createx, ZIG, POSCA, Aqua Color Brush, etc.).
 *
 * Variant labels look like:
 *   "5102-transparent-violet"        → { code:"5102", name:"Transparent Violet" }
 *   "010-pure-black"                 → { code:"010",  name:"Pure Black" }
 *   "f2-amarillo-fluor"              → { code:"F2",   name:"Amarillo Fluor" }
 *   "008-pink-art-nr-727008"         → { code:"008",  name:"Pink" }   (drop "art-nr-XXXX")
 *
 * Usage:
 *   node scripts/build-from-scraped.js
 */

const fs = require('fs');
const path = require('path');

const SCRAPED = path.resolve(__dirname, '..', 'scraped', 'products');
const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

// slug → { productName, basePriceClp, output }
// Hand-picked from the scrape (24 candidates with >=20 variants).
const TARGETS = [
  { src: 'copic-classic', out: 'copic-classic', name: 'Copic Classic', priceClp: 3400 },
  { src: 'createx-airbrush-colors-60ml-unidad', out: 'createx-airbrush-60ml', name: 'Createx Airbrush Colors 60ml', priceClp: 4900 },
  { src: 'createx-airbrush-colors-120ml-unidad', out: 'createx-airbrush-120ml', name: 'Createx Airbrush Colors 120ml', priceClp: 7900 },
  { src: 'createx-airbrush-colors-240ml', out: 'createx-airbrush-240ml', name: 'Createx Airbrush Colors 240ml', priceClp: 13900 },
  { src: 'wicked-colors-480ml', out: 'wicked-colors-480ml', name: 'Wicked Colors 480ml', priceClp: 26900 },
  { src: 'createx-illustration-30ml', out: 'createx-illustration-30ml', name: 'Createx Illustration 30ml', priceClp: 5900 },
  { src: 'zig-calligraphy', out: 'zig-calligraphy', name: 'ZIG Calligraphy', priceClp: 3900 },
  { src: 'zig-acrylista-6mm', out: 'zig-acrylista-6mm', name: 'ZIG Acrylista 6mm', priceClp: 5500 },
  { src: 'zig-acrylista-15mm', out: 'zig-acrylista-15mm', name: 'ZIG Acrylista 15mm', priceClp: 7900 },
  { src: 'zig-fabricolor-twin', out: 'zig-fabricolor-twin', name: 'ZIG Fabricolor Twin', priceClp: 3500 },
  { src: 'solar-color-dust-10gr', out: 'solar-color-dust-10gr', name: 'SOLAR Color Dust 10gr', priceClp: 6900 },
  { src: 'chameleon-pigments-10-gr', out: 'chameleon-pigments-10gr', name: 'Chameleon Pigments 10gr', priceClp: 6900 },
  { src: 'ultra-thermal-dust-10gr-2', out: 'ultra-thermal-dust-10gr', name: 'Ultra Thermal Dust 10gr', priceClp: 8900 },
  { src: 'aqua-color-brush', out: 'aqua-color-brush', name: 'Aqua Color Brush', priceClp: 4500 },
  { src: 'uni-posca-5m-bs-1-8-2-5-mm', out: 'uni-posca-5m', name: 'Uni POSCA 5M (1.8-2.5mm)', priceClp: 4500 },
  { src: 'lapiz-gel-poplol', out: 'poplol-gel', name: 'Lápiz Gel POPLOL', priceClp: 2500 },
  { src: 'marcador-copic-spica', out: 'atyou-spica', name: 'Marcador Atyou Spica', priceClp: 3900 },
  { src: 'kirarina-cute-unidad', out: 'kirarina-cute', name: 'Kirarina Cute', priceClp: 3500 },
  { src: 'aqua-twin-unidad-pincel-bisel', out: 'aqua-twin', name: 'Aqua Twin', priceClp: 5500 },
];

function parseLabel(label) {
  // Drop trailing "art-nr-XXXX" or "-XXXXXX" pure numeric suffix.
  let s = label.replace(/-art-nr-\d+$/i, '').replace(/-\d{4,}$/, '');
  // First token = code, rest = name.
  const i = s.indexOf('-');
  if (i < 0) return { code: s.toUpperCase(), name: '' };
  const code = s.slice(0, i).toUpperCase();
  const name = s.slice(i + 1)
    .split('-')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return { code, name };
}

function findColorChart(gallery) {
  // Look for image URLs containing "carta" or "chart"
  return gallery.find(u => /carta|color[-_]chart|color[-_]card/i.test(u)) || null;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let total = 0;
  for (const t of TARGETS) {
    const src = path.join(SCRAPED, `${t.src}.json`);
    if (!fs.existsSync(src)) {
      console.warn(`  ✗ ${t.out}: source not found (${t.src}.json)`);
      continue;
    }
    const product = JSON.parse(fs.readFileSync(src, 'utf8'));
    const variants = product.variants || [];
    const colors = variants.map(v => {
      const { code, name } = parseLabel(v.label);
      return { code, name, in_stock: v.in_stock !== false };
    }).filter(c => c.code);

    const out = {
      slug: t.out,
      productName: t.name,
      basePriceClp: t.priceClp,
      bsaleProductId: product.bsale_match?.product_id ?? null,
      heroImage: product.primary_image,
      colorChartImage: findColorChart(product.gallery || []),
      sourceUrl: product.url,
      generatedAt: new Date().toISOString(),
      colors,
    };
    fs.writeFileSync(path.join(OUT_DIR, `${t.out}.json`), JSON.stringify(out, null, 2));
    console.log(`  ✓ ${t.out}: ${colors.length} colors`);
    total += colors.length;
  }
  console.log(`\nDone. ${TARGETS.length} brand files, ${total} total color entries.`);
}

main();
