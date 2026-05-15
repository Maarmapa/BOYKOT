#!/usr/bin/env node
/**
 * Enrich web/public/colors/{brand}.json with `description` + `gallery`
 * pulled from the parent scraped product page. Same standard as Copic
 * Sketch — every brand gets a real description + 3-4 thumb images.
 *
 * Usage: node scripts/enrich-brand-meta.js
 */

const fs = require('fs');
const path = require('path');

const SCRAPED = path.resolve(__dirname, '..', 'scraped', 'products');
const COLORS_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

// brand-slug → scraped-product-slug (parent variable product page).
const MAP = {
  'createx-airbrush-60ml': 'createx-airbrush-colors-60ml-unidad',
  'createx-airbrush-120ml': 'createx-airbrush-colors-120ml-unidad',
  'createx-airbrush-240ml': 'createx-airbrush-colors-240ml',
  'createx-illustration-30ml': 'createx-illustration-30ml',
  'wicked-colors-480ml': 'wicked-colors-480ml',
  'zig-calligraphy': 'zig-calligraphy',
  'zig-acrylista-6mm': 'zig-acrylista-6mm',
  'zig-acrylista-15mm': 'zig-acrylista-15mm',
  'zig-fabricolor-twin': 'zig-fabricolor-twin',
  'uni-posca-5m': 'uni-posca-5m-bs-1-8-2-5-mm',
  'aqua-color-brush': 'aqua-color-brush',
  'aqua-twin': 'aqua-twin-unidad-pincel-bisel',
  'poplol-gel': 'lapiz-gel-poplol',
  'atyou-spica': 'marcador-copic-spica',
  'kirarina-cute': 'kirarina-cute-unidad',
  'solar-color-dust-10gr': 'solar-color-dust-10gr',
  'chameleon-pigments-10gr': 'chameleon-pigments-10-gr',
  'ultra-thermal-dust-10gr': 'ultra-thermal-dust-10gr-2',
  'holbein-acuarela-15ml': 'acuarela-15ml-holbein',
  'holbein-acuarela-60ml': 'acuarela-60ml-holbein',
  'angelus-standard-1oz': 'pintura-cuero-angelus-1-oz',
  'angelus-pearlescents-1oz': 'pintura-cuero-angelus-pearlescents-1-onza',
  'angelus-pearlescents-4oz': 'pintura-cuero-angelus-pearlescents-4-onzas',
  'angelus-neon-1oz': 'pintura-cuero-neon-angelus-1-oz',
  'angelus-neon-4oz': 'pintura-cuero-neon-angelus-4-oz',
  'angelus-glitterlites-1oz': 'pintura-cuero-glitterlites-angelus',
  'angelus-tintura-cuero-3oz': 'tintura-cuero-angelus-3-oz',
  'angelus-tintura-gamuza-3oz': 'tintura-gamuza-angelus-3-oz',
};

function pickGallery(scrapedGallery) {
  // Drop tiny size variants and duplicates; cap at 4.
  const full = [...new Set(
    (scrapedGallery || []).filter(u => !/-\d+x\d+\./.test(u))
  )];
  return full.slice(0, 4);
}

function main() {
  let updated = 0, skipped = 0;
  for (const [brandSlug, scrapedSlug] of Object.entries(MAP)) {
    const brandFile = path.join(COLORS_DIR, `${brandSlug}.json`);
    const scrapedFile = path.join(SCRAPED, `${scrapedSlug}.json`);
    if (!fs.existsSync(brandFile) || !fs.existsSync(scrapedFile)) {
      skipped++;
      continue;
    }
    const brand = JSON.parse(fs.readFileSync(brandFile, 'utf8'));
    const scraped = JSON.parse(fs.readFileSync(scrapedFile, 'utf8'));

    const desc = scraped.description ? scraped.description.trim() : null;
    const gallery = pickGallery(scraped.gallery);
    let touched = false;
    if (desc && !brand.description) { brand.description = desc; touched = true; }
    if (gallery.length && (!brand.gallery || brand.gallery.length === 0)) {
      brand.gallery = gallery;
      touched = true;
    }
    if (!brand.heroImage && scraped.primary_image) {
      brand.heroImage = scraped.primary_image;
      touched = true;
    }
    if (touched) {
      fs.writeFileSync(brandFile, JSON.stringify(brand, null, 2));
      updated++;
      console.log(`  ✓ ${brandSlug}`);
    }
  }
  console.log(`\n${updated} updated, ${skipped} skipped.`);
}

main();
