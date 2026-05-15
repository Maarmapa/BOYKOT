#!/usr/bin/env node
/**
 * Angelus Leather Paint isn't a single variable product on boykot.cl — each
 * color is its own product page. We cluster them by slug prefix and emit
 * one unified brand file with code/name/imageUrl/sourceUrl per color.
 *
 * Two SKU lines:
 *   1oz: slug pattern  pintura-cuero-angelus-1-oz-{name-only}        (~86 prods)
 *        image filename pattern  {code}-{name}-1-oz-...
 *   4oz: slug pattern  pintura-cuero-angelus-4-onzas-{code}-{name}   (~89 prods)
 *        image filename has same {code}-{name}
 *
 * The 1oz line keeps the code in the IMAGE filename only — we parse it from
 * there. 4oz keeps it in both.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'scraped', 'products');
const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

function titleCase(slug) {
  return slug.split(/[-_]/).filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function pickMainImage(gallery) {
  const full = (gallery || []).filter(u => !u.includes('-600x600'));
  if (full.length === 0) return null;
  // Prefer the one whose filename starts with a 3-digit code.
  return full.find(u => /\/\d{3}[-_]/.test(u.split('/').pop() || '')) || full[0];
}

function parseCodeFromImage(url) {
  const filename = (url || '').split('/').pop() || '';
  // 001-black-1-oz-...  or 001_black_1-...
  const m = filename.match(/^(\d{3})[-_]([a-z0-9_-]+?)([-_]1[-_]oz|[-_]4[-_]oz|[-_]grande|[-_][a-f0-9]{8,}|\.|$)/i);
  if (!m) return null;
  return { code: m[1], slug: m[2] };
}

function process({ slugPrefix, productName, basePriceClp, outSlug, parseSlug }) {
  const files = fs.readdirSync(SRC).filter(f => f.startsWith(slugPrefix));
  const byCode = new Map();
  let missingCode = 0;

  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
    const img = pickMainImage(data.gallery);
    let code, name;

    if (parseSlug) {
      // 4oz: slug = pintura-cuero-angelus-4-onzas-{code}-{name}
      const after = data.slug.slice(slugPrefix.length); // e.g. "001-black"
      const m = after.match(/^(\d{3})-(.+)$/);
      if (m) { code = m[1]; name = titleCase(m[2]); }
    } else {
      // 1oz: code from image filename
      const parsed = img ? parseCodeFromImage(img) : null;
      if (parsed) {
        code = parsed.code;
        // Prefer the cleaner slug-derived name (no -1-oz tail).
        name = titleCase(data.slug.slice(slugPrefix.length));
      }
    }

    if (!code) { missingCode++; continue; }

    if (!byCode.has(code) || (!byCode.get(code).imageUrl && img)) {
      byCode.set(code, {
        code,
        name,
        imageUrl: img,
        sourceUrl: data.url,
        bsale_product_id: data.bsale_match?.product_id ?? null,
      });
    }
  }

  const colors = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));
  const out = {
    slug: outSlug,
    productName,
    basePriceClp,
    bsaleProductId: 0,
    sourceCount: colors.length,
    generatedAt: new Date().toISOString(),
    colors,
  };
  const outFile = path.join(OUT_DIR, `${outSlug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log(`  ✓ ${outSlug.padEnd(35)} ${String(colors.length).padStart(3)} colors` +
    (missingCode ? ` (skipped ${missingCode} without code)` : ''));
}

process({
  slugPrefix: 'pintura-cuero-angelus-1-oz-',
  productName: 'Angelus Leather Paint 1oz',
  basePriceClp: 5500,
  outSlug: 'angelus-leather-paint-1oz',
  parseSlug: false,
});

process({
  slugPrefix: 'pintura-cuero-angelus-4-onzas-',
  productName: 'Angelus Leather Paint 4oz',
  basePriceClp: 16500,
  outSlug: 'angelus-leather-paint-4oz',
  parseSlug: true,
});

// Re-run for the legacy 1-onzas-{code} pattern too (a handful of products).
process({
  slugPrefix: 'pintura-cuero-angelus-1-onzas-',
  productName: 'Angelus Leather Paint 1oz (legacy slugs)',
  basePriceClp: 5500,
  outSlug: 'angelus-leather-paint-1oz-legacy',
  parseSlug: true,
});
