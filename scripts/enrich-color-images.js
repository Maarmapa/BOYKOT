#!/usr/bin/env node
/**
 * For each brand color set in web/public/colors/<brand>.json that has colors
 * without images, try to match each color (by code/name) against the scraped
 * product slugs and pull primary_image into the color entry.
 *
 * Targets the brands the memory flagged as missing imagery:
 *   molotow-burner, molotow-premium-plus, molotow-premium-neon,
 *   angelus-neon-{1oz,4oz}, angelus-glitterlites-1oz,
 *   angelus-pearlescents-{1oz,4oz},
 *   angelus-tintura-cuero-3oz, angelus-tintura-gamuza-3oz.
 *
 * Usage: node scripts/enrich-color-images.js [--dry]
 */
const fs = require('node:fs');
const path = require('node:path');

const COLORS_DIR = path.join(__dirname, '..', 'web', 'public', 'colors');
const PRODUCTS_DIR = path.join(__dirname, '..', 'scraped', 'products');

const TARGETS = [
  { slug: 'molotow-burner', tokens: ['molotow', 'burner'] },
  { slug: 'molotow-premium-plus', tokens: ['molotow', 'premium', 'plus'] },
  { slug: 'molotow-premium-neon', tokens: ['molotow', 'neon'] },
  { slug: 'angelus-neon-1oz', tokens: ['angelus', 'neon', '1oz'] },
  { slug: 'angelus-neon-4oz', tokens: ['angelus', 'neon', '4oz'] },
  { slug: 'angelus-glitterlites-1oz', tokens: ['angelus', 'glitter'] },
  { slug: 'angelus-pearlescents-1oz', tokens: ['angelus', 'pearl'] },
  { slug: 'angelus-pearlescents-4oz', tokens: ['angelus', 'pearl', '4oz'] },
  { slug: 'angelus-tintura-cuero-3oz', tokens: ['angelus', 'tintura', 'cuero'] },
  { slug: 'angelus-tintura-gamuza-3oz', tokens: ['angelus', 'tintura', 'gamuza'] },
];

const dry = process.argv.includes('--dry');

function normalize(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function loadScrapedIndex() {
  const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const p = JSON.parse(fs.readFileSync(path.join(PRODUCTS_DIR, f), 'utf8'));
    return {
      slug: p.slug,
      name: p.name || '',
      norm: normalize(`${p.slug} ${p.name}`),
      image: p.primary_image || (p.gallery && p.gallery[0]) || null,
    };
  });
}

function bestMatch(color, brandTokens, index) {
  const codeNorm = normalize(color.code);
  const nameNorm = normalize(color.name);
  const queryTokens = [...brandTokens.map(normalize), ...codeNorm.split(/\s+/).filter(Boolean), ...nameNorm.split(/\s+/).filter(Boolean)];
  let best = null;
  let bestScore = 0;
  for (const p of index) {
    if (!p.image) continue;
    if (!brandTokens.every(t => p.norm.includes(normalize(t)))) continue;
    let score = 0;
    for (const t of queryTokens) {
      if (t && t.length >= 2 && p.norm.includes(t)) score += t.length;
    }
    if (score > bestScore) { bestScore = score; best = p; }
  }
  return bestScore >= 4 ? best : null;
}

function main() {
  console.log(`[enrich] loading scrape index...`);
  const index = loadScrapedIndex();
  console.log(`[enrich] ${index.length} products in scrape\n`);

  for (const target of TARGETS) {
    const file = path.join(COLORS_DIR, `${target.slug}.json`);
    if (!fs.existsSync(file)) {
      console.log(`[skip] ${target.slug} — file not found`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data.colors)) {
      console.log(`[skip] ${target.slug} — no colors[]`);
      continue;
    }

    let filled = 0;
    let already = 0;
    for (const c of data.colors) {
      if (c.image) { already++; continue; }
      const m = bestMatch(c, target.tokens, index);
      if (m) {
        c.image = m.image;
        c.matchSlug = m.slug;
        filled++;
      }
    }
    console.log(`[${target.slug}] ${filled} filled, ${already} already had images, ${data.colors.length - filled - already} still missing`);
    if (!dry && filled > 0) fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }
}

main();
