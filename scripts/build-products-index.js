#!/usr/bin/env node
/**
 * Build a slim search index from scraped/products/*.json:
 *   web/public/products-index.json
 *
 * Each entry: {slug, name, sku, price, image, categories, brand}
 *
 * Also writes the full minified bundle to:
 *   web/data/products.json
 *
 * Combined size is what the server reads when /producto/[slug] is rendered.
 */
const fs = require('node:fs');
const path = require('node:path');

const SCRAPE_DIR = path.join(__dirname, '..', 'scraped', 'products');
const OUT_INDEX = path.join(__dirname, '..', 'web', 'public', 'products-index.json');
const OUT_FULL = path.join(__dirname, '..', 'web', 'data', 'products.json');

function brandGuess(name) {
  if (!name) return null;
  const first = String(name).trim().split(/\s+/)[0];
  const known = [
    'Angelus', 'Holbein', 'Copic', 'Molotow', 'POSCA', 'Posca',
    'Createx', 'Wicked', 'ZIG', 'Zig', 'Kuretake', 'Prismacolor',
    'Faber', 'Staedtler', 'Aqua', 'Solar', 'Chameleon', 'Ultra',
    'Atyou', 'Poplol', 'Acrilex', 'Reaper', 'Markal',
  ];
  return known.includes(first) ? first : null;
}

function categoryGuess(p) {
  const breadcrumb = (p.breadcrumbs || [])
    .map(b => (b.name || '').toLowerCase())
    .filter(Boolean);
  const cats = (p.categories || []).map(c => String(c).toLowerCase());
  const all = [...breadcrumb, ...cats];
  if (all.some(s => /(marcador|copic|posca|zig)/.test(s))) return 'marcadores';
  if (all.some(s => /(pintura|acuarela|óleo|oleo|aerosol|airbrush|cuero|tintura|gouache|acrila)/.test(s))) return 'pintura';
  if (all.some(s => /(lápic|lapic|grafito|blackliner|prismacolor)/.test(s))) return 'lapices';
  if (all.some(s => /(pincel|bastidor|cuaderno|papel|libro|material|accesor)/.test(s))) return 'materiales';
  return null;
}

function main() {
  const files = fs.readdirSync(SCRAPE_DIR).filter(f => f.endsWith('.json'));
  console.log(`[index] reading ${files.length} product files…`);

  const slim = [];
  const full = {};
  let skipped = 0;

  for (const f of files) {
    let p;
    try {
      p = JSON.parse(fs.readFileSync(path.join(SCRAPE_DIR, f), 'utf8'));
    } catch {
      skipped++; continue;
    }
    if (!p.slug || !p.name) { skipped++; continue; }

    const cat = categoryGuess(p);
    const brand = brandGuess(p.name);

    slim.push({
      slug: p.slug,
      name: p.name,
      sku: p.sku || null,
      price: p.price_clp || null,
      image: p.primary_image || null,
      cat,
      brand,
    });

    full[p.slug] = {
      slug: p.slug,
      name: p.name,
      sku: p.sku || null,
      url: p.url || null,
      price: p.price_clp || null,
      availability: p.availability || 'InStock',
      description: p.description || '',
      short: p.short_description || '',
      image: p.primary_image || null,
      gallery: (p.gallery || []).slice(0, 8),
      breadcrumbs: (p.breadcrumbs || []).map(b => b.name).filter(Boolean),
      cat,
      brand,
    };
  }

  // Sort slim alphabetically by name for stable diffs
  slim.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_FULL), { recursive: true });
  fs.writeFileSync(OUT_INDEX, JSON.stringify(slim));
  fs.writeFileSync(OUT_FULL, JSON.stringify(full));

  console.log(`[index] wrote ${slim.length} products (${skipped} skipped)`);
  console.log(`[index]   ${OUT_INDEX}: ${(fs.statSync(OUT_INDEX).size / 1024).toFixed(1)} KB`);
  console.log(`[index]   ${OUT_FULL}: ${(fs.statSync(OUT_FULL).size / 1024).toFixed(1)} KB`);
}

main();
