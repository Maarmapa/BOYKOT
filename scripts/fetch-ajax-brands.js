#!/usr/bin/env node
/**
 * Targeted re-scrape for products whose variants are rendered by the
 * woo-variations-table-grid plugin. The plugin AJAX-loads the visible grid,
 * but the source HTML still ships every variant as a hidden form input:
 *
 *   <input name="attribute_pa_color" value="acuarela-serie-a-15ml-w201-chinese-white">
 *
 * The regular scraper only looked at h5.product-title (Copic pattern). This
 * one walks attribute_pa_* hidden inputs to grab the JS-rendered brands.
 *
 * Usage:  node scripts/fetch-ajax-brands.js
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

const SCRAPED = path.resolve(__dirname, '..', 'scraped', 'products');

const TARGETS = [
  'https://www.boykot.cl/tienda/pintura/holbein/acuarela-holbein/acuarela-15ml-holbein/',
  'https://www.boykot.cl/tienda/pintura/holbein/acuarela-holbein/acuarela-5ml-holbein/',
  'https://www.boykot.cl/tienda/pintura/holbein/acuarela-holbein/acuarela-60ml-holbein/',
  'https://www.boykot.cl/tienda/pintura/holbein/gouache-holbein/gouache-15-ml-holbein/',
  'https://www.boykot.cl/tienda/pintura/holbein/oleo-holbein/oleo-20-ml-holbein/',
  'https://www.boykot.cl/tienda/pintura/sprays/premium-molotow/molotow-premium-400-ml/',
  'https://www.boykot.cl/tienda/pintura/sprays/premium-molotow/molotow-premium-neon-400-ml/',
  'https://www.boykot.cl/tienda/pintura/sprays/premium-molotow/molotow-premium-plus-400-ml/',
  'https://www.boykot.cl/tienda/pintura/sprays/molotow-burner-600ml/',
  'https://www.boykot.cl/tienda/pintura/angelus/pintura-cuero-angelus/standard-paint-angelus/',
];

function slugFromUrl(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts[parts.length - 1];
}

async function fetchOne(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'BoykotScraper/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

(async () => {
  fs.mkdirSync(SCRAPED, { recursive: true });
  for (const url of TARGETS) {
    try {
      const html = await fetchOne(url);
      const $ = cheerio.load(html);
      const variants = [];
      $('input[name^="attribute_pa_"]').each((_, el) => {
        const label = ($(el).attr('value') || '').trim();
        if (label && !variants.find(v => v.label === label)) {
          variants.push({ label, in_stock: true });
        }
      });
      const slug = slugFromUrl(url);
      const gallery = [...new Set(
        $('.woocommerce-product-gallery a').map((_, el) => $(el).attr('href')).get()
          .concat($('.woocommerce-product-gallery img').map((_, el) => $(el).attr('src') || $(el).attr('data-src')).get())
          .filter(Boolean)
      )];
      const price = $('p.price .woocommerce-Price-amount').first().text().trim().replace(/[^\d]/g, '');

      const out = {
        url,
        slug,
        name: $('h1.product_title').text().trim(),
        price_clp: price ? parseInt(price, 10) : null,
        variants,
        gallery,
        scraped_at: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(SCRAPED, `${slug}.json`), JSON.stringify(out, null, 2));
      console.log(`  ✓ ${slug.padEnd(45)} ${String(variants.length).padStart(3)} vars  ${gallery.length} imgs`);
    } catch (err) {
      console.log(`  ✗ ${url} — ${err.message}`);
    }
  }
})();
