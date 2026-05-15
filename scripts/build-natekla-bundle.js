#!/usr/bin/env node
/**
 * Consolida scraped-natekla/ → JSONs slim para Next.js:
 *
 *   web/data/natekla-products.json  — 3669 productos (slim: slug, name,
 *                                     price, image, categories, brand)
 *   web/data/natekla-categories.json — 267 categorias (slim: slug, name,
 *                                     parent, count, image)
 *   web/data/natekla-pages.json     — 10 pages (raw rendered + meta)
 */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const IN = path.join(__dirname, '..', 'scraped-natekla');
const OUT = path.join(__dirname, '..', 'web', 'data');
fs.mkdirSync(OUT, { recursive: true });

// ───────────────── Products ─────────────────
function buildProducts() {
  const files = fs.readdirSync(path.join(IN, 'products')).filter(f => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(IN, 'products', f), 'utf8'));
      const image = p.images?.[0]?.src || null;
      out.push({
        slug: p.slug,
        name: stripTags(p.name),
        sku: p.sku || null,
        price: priceFromString(p.prices?.price ?? p.price),
        currency: p.prices?.currency_code || 'CLP',
        image,
        gallery: (p.images || []).slice(0, 6).map(i => i.src),
        permalink: p.permalink,
        description: stripTags(p.description || p.short_description || '').slice(0, 600),
        categories: (p.categories || []).map(c => c.slug),
        on_sale: p.on_sale,
        in_stock: p.is_in_stock,
        brand: guessBrand(p.name),
      });
    } catch (e) {
      console.warn(`skip ${f}: ${e.message}`);
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  fs.writeFileSync(path.join(OUT, 'natekla-products.json'), JSON.stringify(out));
  console.log(`  Products: ${out.length} (${(fs.statSync(path.join(OUT, 'natekla-products.json')).size / 1024).toFixed(1)} KB)`);
  return out;
}

function priceFromString(s) {
  if (!s) return null;
  if (typeof s === 'number') return s;
  const n = parseFloat(String(s).replace(/[^\d.]/g, ''));
  return isNaN(n) ? null : Math.round(n);
}

function stripTags(html) {
  if (!html) return '';
  return cheerio.load(html, null, false).text().trim();
}

const KNOWN_BRANDS = [
  'Copic', 'Angelus', 'Holbein', 'Molotow', 'Createx', 'Wicked',
  'POSCA', 'Posca', 'ZIG', 'Kuretake', 'Prismacolor',
  'Faber-Castell', 'Faber', 'Staedtler', 'Aqua', 'Solar',
  'Chameleon', 'Ultra', 'Atyou', 'Poplol', 'Kirarina', 'Acrilex',
  'Markal', 'Blackliner', 'Multiliner',
];

function guessBrand(name) {
  if (!name) return null;
  for (const b of KNOWN_BRANDS) {
    if (name.toLowerCase().includes(b.toLowerCase())) return b;
  }
  return null;
}

// ───────────────── Categories ─────────────────
function buildCategories() {
  const files = fs.readdirSync(path.join(IN, 'categories')).filter(f => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    try {
      const c = JSON.parse(fs.readFileSync(path.join(IN, 'categories', f), 'utf8'));
      out.push({
        id: c.id,
        slug: c.slug,
        name: c.name,
        parent: c.parent,
        count: c.count,
        image: c.image?.src || null,
        permalink: c.permalink,
      });
    } catch (e) {
      console.warn(`skip cat ${f}: ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(OUT, 'natekla-categories.json'), JSON.stringify(out));
  console.log(`  Categories: ${out.length} (${(fs.statSync(path.join(OUT, 'natekla-categories.json')).size / 1024).toFixed(1)} KB)`);
  return out;
}

// ───────────────── Pages ─────────────────
function buildPages() {
  const files = fs.readdirSync(path.join(IN, 'html')).filter(f => f.endsWith('.json'));
  const out = {};
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(IN, 'html', f), 'utf8'));
      out[data.slug] = {
        url: data.url,
        title: stripTags(data.meta?.title || data.slug),
        meta: data.meta,
        // Truncate to 200KB to keep bundle reasonable
        main: (data.main || '').slice(0, 200_000),
      };
    } catch (e) {
      console.warn(`skip page ${f}: ${e.message}`);
    }
  }
  fs.writeFileSync(path.join(OUT, 'natekla-pages.json'), JSON.stringify(out));
  console.log(`  Pages: ${Object.keys(out).length} (${(fs.statSync(path.join(OUT, 'natekla-pages.json')).size / 1024).toFixed(1)} KB)`);
}

console.log('Building natekla bundles…');
buildProducts();
buildCategories();
buildPages();
console.log('\nDone.');
