#!/usr/bin/env node
/**
 * Toma scraped/pages/*.json y arma un bundle único:
 *   web/data/pages.json = { "[slug]": {title, sections, ...}, ... }
 *
 * Slug = URL path sin slashes (ej "copic-chile__copic-sketch").
 * Después el catch-all route /[...slug] lee de acá.
 */
const fs = require('node:fs');
const path = require('node:path');

const IN = path.join(__dirname, '..', 'scraped', 'pages');
const OUT = path.join(__dirname, '..', 'web', 'data', 'pages.json');

const files = fs.readdirSync(IN).filter(f => f.endsWith('.json'));
const pages = {};
let total = 0;

for (const f of files) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(IN, f), 'utf8'));
    // El slug viene del nombre del archivo: copic-chile__copic-sketch.json → "copic-chile/copic-sketch"
    const slug = f.replace(/\.json$/, '').replace(/__/g, '/');
    pages[slug] = {
      url: data.url,
      title: cleanTitle(data.title),
      description: data.description,
      heroImage: data.heroImage,
      sections: (data.sections || []).filter(s => s.body || s.images?.length),
      paragraphs: data.paragraphs?.slice(0, 8) || [],
      productLinks: (data.productLinks || []).slice(0, 30),
      images: (data.images || []).slice(0, 8),
    };
    total++;
  } catch (e) {
    console.warn(`skip ${f}: ${e.message}`);
  }
}

function cleanTitle(t) {
  if (!t) return '';
  return String(t).replace(/\s*[-–—]\s*Boykot.*$/i, '').trim();
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(pages));
console.log(`Wrote ${total} pages → ${OUT} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
