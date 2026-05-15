#!/usr/bin/env node
/**
 * Boykot.cl ships one individual product page per Copic Sketch color
 * (/tienda/marcadores/copic-markers/copic-individual/copic-sketch/<code>/).
 * Each page exposes a unique "sketchpost" photo where the marker cap shows
 * the actual color. That is a much better swatch source than Drive (where
 * we only had 131/358).
 *
 * This script walks scraped/products/marcador-copic-sketch-*.json and emits
 * web/public/colors/copic-sketch-images.json: { CODE: imageUrl }.
 *
 * Usage: node scripts/build-copic-sketch-images.js
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'scraped', 'products');
const OUT = path.resolve(__dirname, '..', 'web', 'public', 'colors', 'copic-sketch-images.json');

function pickPrimary(gallery) {
  // Prefer "sketchpost" (cap-on shot, color most visible) over capoff/chart.
  // Skip auto-generated 600x600 variants.
  const full = gallery.filter(u => !u.includes('-600x600'));
  return (
    full.find(u => /sketchpost/i.test(u)) ||
    full.find(u => /capoff/i.test(u)) ||
    full[0] ||
    null
  );
}

function main() {
  const files = fs.readdirSync(SRC).filter(f => /^marcador-copic-sketch-/.test(f));
  const map = {};
  let missing = 0;
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
    // Slug → code. e.g. marcador-copic-sketch-b04.json → B04
    const slug = p.slug.replace(/^marcador-copic-sketch-/, '').toUpperCase();
    if (slug === 'COLOR-EMPTY-SKETCH') continue;
    const url = pickPrimary(p.gallery || []);
    if (url) map[slug] = url;
    else missing++;
  }
  fs.writeFileSync(OUT, JSON.stringify(map, null, 2));
  const keys = Object.keys(map);
  console.log(`✓ ${keys.length} sketch image URLs (skipped ${missing} with no usable photo)`);
  console.log('  sample:', keys.slice(0, 5).map(k => `${k}=${map[k].slice(-40)}`).join('\n          '));
}

main();
