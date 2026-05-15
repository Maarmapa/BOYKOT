#!/usr/bin/env node
/**
 * Generalized version of build-copic-sketch-images.js.
 *
 * For each brand that has individual product pages on boykot.cl
 * (marcador-copic-{line}-{code}), build a { code → swatch image url } map.
 *
 * Generated files (one per brand):
 *   web/public/colors/copic-sketch-images.json   ← 358
 *   web/public/colors/copic-classic-images.json  ← 214
 *   web/public/colors/copic-ciao-images.json     ← 179
 *   web/public/colors/copic-wide-images.json     ←  36
 *
 * The brand registry (lib/colors/copic.ts and brands.ts) hydrates ColorSwatch.imageUrl
 * from these maps.
 *
 * Usage: node scripts/build-individual-images.js
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'scraped', 'products');
const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

const BRANDS = [
  { slugPrefix: 'marcador-copic-sketch-',  out: 'copic-sketch-images',  skipSlugs: ['color-empty-sketch'] },
  { slugPrefix: 'marcador-copic-classic-', out: 'copic-classic-images', skipSlugs: [] },
  { slugPrefix: 'marcador-copic-ciao-',    out: 'copic-ciao-images',    skipSlugs: ['ciao-empty-sketch', 'color-empty-ciao'] },
  { slugPrefix: 'marcador-copic-wide-',    out: 'copic-wide-images',    skipSlugs: ['color-empty-wide'] },
];

// Choose the image that best represents the actual marker color:
//   sketchpost  > capoff  > color_chart  > first available
function pickSwatch(gallery) {
  const full = (gallery || []).filter(u => !u.includes('-600x600'));
  return (
    full.find(u => /sketchpost/i.test(u)) ||
    full.find(u => /capoff|marker_capoff/i.test(u)) ||
    full.find(u => /-front|product|portrait/i.test(u)) ||
    full[0] ||
    null
  );
}

function build(brand) {
  const allFiles = fs.readdirSync(SRC);
  const matched = allFiles.filter(f => f.startsWith(brand.slugPrefix) && f.endsWith('.json'));
  const map = {};
  let missing = 0, skipped = 0;

  for (const f of matched) {
    const slug = f.replace(/\.json$/, '');
    const codePart = slug.slice(brand.slugPrefix.length);
    if (brand.skipSlugs.includes(codePart)) { skipped++; continue; }

    const p = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
    const url = pickSwatch(p.gallery);
    if (!url) { missing++; continue; }

    map[codePart.toUpperCase()] = url;
  }

  const outFile = path.join(OUT_DIR, `${brand.out}.json`);
  fs.writeFileSync(outFile, JSON.stringify(map, null, 2));
  console.log(
    `  ✓ ${brand.out.padEnd(30)} ${String(Object.keys(map).length).padStart(3)} images` +
    (skipped ? ` (skipped ${skipped})` : '') +
    (missing ? ` (missing ${missing})` : '')
  );
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const b of BRANDS) build(b);
}

main();
