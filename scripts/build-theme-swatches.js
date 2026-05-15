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
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-sketch/',  out: 'copic-sketch-images' },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-classic/', out: 'copic-classic-images' },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-ciao/',    out: 'copic-ciao-images' },
  { url: 'https://www.boykot.cl/tienda/marcadores/copic-markers/copic-individual/copic-wide/',    out: 'copic-wide-images' },
];

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'BoykotScraper/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}

function extractSwatches(html) {
  const $ = cheerio.load(html);
  const map = {};
  $('.bwe-grouped-products-wrapper .group-product').each((_, el) => {
    const $el = $(el);
    const code = $el.find('.product-title').text().trim();
    if (!code) return;
    const style = $el.find('.product-skin').attr('style') || '';
    const m = style.match(/url\((['"]?)([^)'"]+)\1\)/);
    if (m) map[code] = m[2];
  });
  return map;
}

async function processSource(src) {
  const html = await fetchHtml(src.url);
  const map = extractSwatches(html);
  const file = path.join(OUT_DIR, `${src.out}.json`);
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
  console.log(`  ✓ ${src.out.padEnd(28)} ${String(Object.keys(map).length).padStart(3)} swatches`);
  return map;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const src of SOURCES) {
    try { await processSource(src); }
    catch (err) { console.log(`  ✗ ${src.out}: ${err.message}`); }
  }
})();
