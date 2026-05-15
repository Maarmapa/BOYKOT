#!/usr/bin/env node
/**
 * Boykot's WP theme ships a flat color swatch per code under
 *   /wp-content/themes/boykot/images/{line}/{CODE}.jpg
 *
 * The "grouped products" page renders these as a CSS background on each
 * <div class="product-skin">. Confirmed for copic-sketch / copic-classic /
 * copic-ciao at minimum.
 *
 * Walking the grouped-products page is the most reliable way to discover
 * the {CODE → swatch URL} mapping.
 *
 * Usage: node scripts/build-theme-swatches.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const fetch = globalThis.fetch || require('node-fetch');

const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

const SOURCES = [
  // Copic — product-title carries the code (FB/FBG fluors keep parenthesized SKU).
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-sketch/',  out: 'copic-sketch-images' },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-classic/', out: 'copic-classic-images' },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-ciao/',    out: 'copic-ciao-images' },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-wide/',    out: 'copic-wide-images' },

  // Angelus & friends — product-title is empty; we infer the code from the
  // swatch URL itself (the {CODE}.jpg basename).
  { url: 'https://www.boykot.cl/tienda/pintura/angelus/pinturas/standard-paint/pintura-cuero-angelus-1-oz/', out: 'angelus-standard-1oz-images', codeFromUrl: true },
];

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'BoykotScraper/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function extractSwatches(html, opts = {}) {
  const $ = cheerio.load(html);
  const map = {};
  $('.bwe-grouped-products-wrapper .group-product').each((_, el) => {
    const $el = $(el);
    const style = $el.find('.product-skin').attr('style') || '';
    const urlMatch = style.match(/url\((['"]?)([^)'"]+)\1\)/);
    if (!urlMatch) return;
    const swatchUrl = urlMatch[2];

    let label = $el.find('.product-title').text().trim();
    const paren = label.match(/\(([^)]+)\)\s*$/);
    if (paren) label = paren[1].trim();

    // Fallback: derive the code from the swatch filename, e.g.
    //   ".../images/angelus/standard/color/001.jpg" → "001"
    //   ".../005-white.jpg"                          → "005"
    // Numbers always win over text suffixes appended for human readability.
    if (!label && opts.codeFromUrl) {
      const filename = (swatchUrl.split('/').pop() || '').split(/[?#]/)[0];
      const numericMatch = filename.match(/^(\d+)/);
      if (numericMatch) label = numericMatch[1];
      else {
        const m = filename.match(/^([A-Z0-9-]+)\.(jpg|jpeg|png|webp)/i);
        if (m) label = m[1];
      }
    }
    if (!label) return;
    map[label] = swatchUrl;
  });
  return map;
}

async function processSource(src) {
  const html = await fetchHtml(src.url);
  const map = extractSwatches(html, { codeFromUrl: !!src.codeFromUrl });
  const file = path.join(OUT_DIR, `${src.out}.json`);
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
  console.log(`  ✓ ${src.out.padEnd(35)} ${String(Object.keys(map).length).padStart(3)} swatches`);
  return map;
}


(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const src of SOURCES) {
    try { await processSource(src); }
    catch (err) { console.log(`  ✗ ${src.out}: ${err.message}`); }
  }
})();
