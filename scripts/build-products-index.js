#!/usr/bin/env node
/**
 * Build a slim search index + full bundle from scraped/products/*.json with
 * brand/category detection, name cleaning and de-duplication.
 *
 * Outputs:
 *   web/public/products-index.json   (slim, for search)
 *   web/data/products.json           (full, per slug, used by /producto/[slug])
 */
const fs = require('node:fs');
const path = require('node:path');

const SCRAPE_DIR = path.join(__dirname, '..', 'scraped', 'products');
const OUT_INDEX = path.join(__dirname, '..', 'web', 'public', 'products-index.json');
const OUT_FULL = path.join(__dirname, '..', 'web', 'data', 'products.json');

// Brand detection — order matters; longer/more specific names first.
const BRANDS = [
  'Prismacolor', 'Faber-Castell', 'Faber', 'Staedtler',
  'Copic Sketch', 'Copic Ciao', 'Copic Classic', 'Copic Wide', 'Copic Ink', 'COPIC', 'Copic',
  'Molotow', 'Angelus', 'Holbein', 'Createx', 'Wicked', 'POSCA', 'Posca',
  'ZIG', 'Kuretake', 'Aqua Color', 'Aqua Twin', 'Aqua', 'Markal',
  'Solar Color Dust', 'Solar', 'Chameleon', 'Ultra Thermal', 'Ultra',
  'Atyou Spica', 'Atyou', 'Poplol', 'Kirarina', 'Acrilex', 'Reaper Master',
  'Blackliner', 'Multiliner',
];

function detectBrand(p) {
  const haystack = `${p.name || ''} ${(p.breadcrumbs || []).map(b => b.name).join(' ')}`.toLowerCase();
  for (const b of BRANDS) {
    if (haystack.includes(b.toLowerCase())) return b.split(' ')[0]; // canonical first word
  }
  return null;
}

function detectCategory(p) {
  const breadcrumb = (p.breadcrumbs || []).map(b => (b.name || '').toLowerCase()).filter(Boolean);
  const cats = (p.categories || []).map(c => String(c).toLowerCase());
  const url = String(p.url || '').toLowerCase();
  const all = [...breadcrumb, ...cats, url];

  if (all.some(s => /(marcador|copic|posca|zig|fineliner|blackliner|multiliner|brush.?pen)/.test(s))) return 'marcadores';
  if (all.some(s => /(pintura|acuarela|óleo|oleo|aerosol|spray|airbrush|cuero|tintura|gouache|acrila|wicked|createx|angelus|molotow)/.test(s))) return 'pintura';
  if (all.some(s => /(lápic|lapic|grafito|prismacolor)/.test(s))) return 'lapices';
  if (all.some(s => /(pincel|bastidor|cuaderno|papel|libro|material|accesor|kit|pigmento|polvo)/.test(s))) return 'materiales';
  return null;
}

function cleanName(name) {
  if (!name) return '';
  let s = String(name).trim();
  // Remove duplicated text: "X Boykot Graffiti...XBoykot Graffiti..."
  // Strip "Boykot Graffiti..." suffix and anything after it.
  s = s.replace(/\s*Boykot Graffiti.*$/i, '');
  // Some names have themselves duplicated verbatim end-to-end
  const half = Math.floor(s.length / 2);
  if (s.length > 40 && s.slice(0, half).trim() === s.slice(half).trim()) {
    s = s.slice(0, half).trim();
  }
  // Normalize whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // Strip trailing weird dashes/letters from cut suffixes
  s = s.replace(/[-–—\s]+[A-Z]$/i, '').trim();
  return s;
}

function cleanDescription(desc) {
  if (!desc) return '';
  return String(desc)
    .replace(/\s*Boykot Graffiti.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 2000);
}

function main() {
  const files = fs.readdirSync(SCRAPE_DIR).filter(f => f.endsWith('.json'));
  console.log(`[index] reading ${files.length} product files…`);

  const slim = [];
  const full = {};
  const seenByName = new Map(); // dedupe by normalized name
  let skipped = 0;
  let cleanedNames = 0;

  for (const f of files) {
    let p;
    try {
      p = JSON.parse(fs.readFileSync(path.join(SCRAPE_DIR, f), 'utf8'));
    } catch { skipped++; continue; }
    if (!p.slug || !p.name) { skipped++; continue; }

    const name = cleanName(p.name);
    if (name !== p.name) cleanedNames++;
    if (!name) { skipped++; continue; }

    const cat = detectCategory(p);
    const brand = detectBrand(p);

    // Dedupe: prefer in-stock + image + non-empty description.
    const key = name.toLowerCase().replace(/\s+/g, ' ');
    const existing = seenByName.get(key);
    const score =
      (p.primary_image ? 4 : 0) +
      (p.availability !== 'OutOfStock' ? 3 : 0) +
      (p.description ? 2 : 0) +
      (p.price_clp ? 1 : 0);
    if (existing && existing.score >= score) {
      skipped++;
      continue;
    }
    if (existing && existing.score < score) {
      // drop the earlier weaker one
      const idx = slim.findIndex(s => s.slug === existing.slug);
      if (idx >= 0) slim.splice(idx, 1);
      delete full[existing.slug];
    }

    slim.push({
      slug: p.slug,
      name,
      sku: p.sku || null,
      price: p.price_clp || null,
      image: p.primary_image || (p.gallery && p.gallery[0]) || null,
      cat,
      brand,
    });

    full[p.slug] = {
      slug: p.slug,
      name,
      sku: p.sku || null,
      url: p.url || null,
      price: p.price_clp || null,
      availability: p.availability || 'InStock',
      description: cleanDescription(p.description),
      short: cleanDescription(p.short_description),
      image: p.primary_image || (p.gallery && p.gallery[0]) || null,
      gallery: (p.gallery || []).slice(0, 8),
      breadcrumbs: (p.breadcrumbs || []).map(b => b.name).filter(Boolean),
      cat,
      brand,
    };

    seenByName.set(key, { slug: p.slug, score });
  }

  slim.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  fs.mkdirSync(path.dirname(OUT_INDEX), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_FULL), { recursive: true });
  fs.writeFileSync(OUT_INDEX, JSON.stringify(slim));
  fs.writeFileSync(OUT_FULL, JSON.stringify(full));

  // Stats
  const withBrand = slim.filter(p => p.brand).length;
  const withImage = slim.filter(p => p.image).length;
  const withPrice = slim.filter(p => p.price).length;

  console.log(`[index] kept ${slim.length} products (${skipped} skipped, ${cleanedNames} names cleaned)`);
  console.log(`[index]   with brand: ${withBrand}/${slim.length} (${Math.round(100 * withBrand / slim.length)}%)`);
  console.log(`[index]   with image: ${withImage}/${slim.length}`);
  console.log(`[index]   with price: ${withPrice}/${slim.length}`);
  console.log(`[index]   ${OUT_INDEX}: ${(fs.statSync(OUT_INDEX).size / 1024).toFixed(1)} KB`);
  console.log(`[index]   ${OUT_FULL}: ${(fs.statSync(OUT_FULL).size / 1024).toFixed(1)} KB`);
}

main();
