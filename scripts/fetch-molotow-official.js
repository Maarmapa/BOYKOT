#!/usr/bin/env node
/**
 * Scrape the official Molotow Premium catalog from shop.molotow.com.
 * Every swatch is shipped as a div with style="background-color:#XXXXXX"
 * and inner text "#012 Pastel Orange" (code + name). Tag classes hint at
 * filter groups (yellow, red, blue, neutral, pastel, etc.) which we keep as
 * a family signal.
 *
 * Usage: node scripts/fetch-molotow-official.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const fetch = globalThis.fetch || require('node-fetch');

const URL = 'https://shop.molotow.com/en/product/molotow-premium/';
const OUT = path.resolve(__dirname, '..', 'web', 'public', 'colors', 'molotow-premium-400ml.json');

function familyFromClasses(cls) {
  if (!cls) return null;
  const m = cls.match(/farbfilter-farben-([a-z]+)/);
  return m ? m[1] : null;
}

(async () => {
  const res = await fetch(URL, { headers: { 'user-agent': 'BoykotScraper/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const colors = [];
  $('.subproduct-row.mw-grid-color').each((_, el) => {
    const $el = $(el);
    const style = $el.attr('style') || '';
    const hex = (style.match(/background[-color:]*\s*:?\s*(#[0-9A-Fa-f]{6})/i) || [])[1];
    if (!hex) return;

    // shop.molotow.com renders the swatch label inside .art-name
    //   <span class="art-name">#012 pastel orange</span>
    const raw = $el.find('.art-name').first().text().trim();
    if (!raw) return;

    const m = raw.match(/^#?(\d{3})\s+(.+)$/);
    if (!m) return;

    const code = m[1];
    const name = m[2].replace(/\s*\(.*$/, '').trim();
    const family = familyFromClasses($el.attr('class') || '');

    // De-dupe by code
    if (!colors.find(c => c.code === code)) {
      colors.push({ code, name, hex: hex.toLowerCase(), family });
    }
  });

  // Sort by numeric code
  colors.sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));

  const out = {
    slug: 'molotow-premium',
    productName: 'Molotow Premium 400ml',
    bsaleProductId: 2236,
    sourceUrl: URL,
    sourceOfficial: true,
    generatedAt: new Date().toISOString(),
    colors,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`✓ ${colors.length} official Molotow Premium colors with hex written to ${path.relative(process.cwd(), OUT)}`);
  console.log('Sample:');
  colors.slice(0, 5).forEach(c => console.log(`  ${c.code}  ${c.hex}  ${c.name.padEnd(30)} (${c.family || '—'})`));
})();
