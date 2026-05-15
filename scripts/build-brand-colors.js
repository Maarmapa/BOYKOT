#!/usr/bin/env node
/**
 * Generates web/public/colors/{brand}.json from the BSale catalog snapshot.
 *
 * For brands where colors live as variants of a single BSale product (e.g.
 * Molotow Premium has 50 variants on product 2236), parse the variant
 * description into { code, name, sku, variantId, stock }.
 *
 * Usage:
 *   node scripts/build-brand-colors.js
 */

const fs = require('fs');
const path = require('path');

const CATALOG = path.resolve(__dirname, '..', 'catalog.json');
const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

// Each entry: { slug, productId, parseVariant(v) -> {code, name} | null }
const BRANDS = [
  {
    slug: 'molotow-premium',
    productId: 2236,
    productName: 'Molotow Premium 400 ML',
    // BSale description format: "001 Jasmin Yellow 327001"
    //                            ^^^ ^^^^^^^^^^^^^ ^^^^^^
    //                            code name          internal sku (drop)
    parseVariant(v) {
      const desc = (v.description || '').trim();
      const m = desc.match(/^(\d{3})\s+(.+?)\s+\d+\s*$/);
      if (m) return { code: m[1], name: m[2].trim() };
      // Fallback: just split on first space
      const i = desc.indexOf(' ');
      if (i > 0) return { code: desc.slice(0, i), name: desc.slice(i + 1).trim() };
      return { code: desc, name: '' };
    },
  },
  {
    slug: 'molotow-premium-neon',
    productId: 2238,
    productName: 'Molotow Premium Neon 400ml',
    parseVariant(v) {
      const desc = (v.description || '').trim();
      const m = desc.match(/^(\d{3})\s+(.+?)\s+\d+\s*$/);
      if (m) return { code: m[1], name: m[2].trim() };
      return { code: desc, name: '' };
    },
  },
  {
    slug: 'molotow-premium-plus',
    productId: 2239,
    productName: 'Molotow Premium Plus 400ml',
    parseVariant(v) {
      const desc = (v.description || '').trim();
      const m = desc.match(/^(\d{3})\s+(.+?)\s+\d+\s*$/);
      if (m) return { code: m[1], name: m[2].trim() };
      return { code: desc, name: '' };
    },
  },
  {
    slug: 'molotow-burner',
    productId: 2240,
    productName: 'Molotow Burner',
    parseVariant(v) {
      const desc = (v.description || '').trim();
      return { code: desc, name: '' };
    },
  },
];

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const brand of BRANDS) {
    const product = catalog.find(p => p.product_id === brand.productId);
    if (!product) {
      console.warn(`  skip ${brand.slug} — BSale product ${brand.productId} not in catalog`);
      continue;
    }
    const colors = (product.variants || []).map(v => {
      const parsed = brand.parseVariant(v);
      return {
        code: parsed.code,
        name: parsed.name,
        variantId: v.variant_id,
        sku: v.sku,
      };
    }).filter(c => c.code);

    const out = {
      slug: brand.slug,
      productName: brand.productName,
      bsaleProductId: brand.productId,
      generatedAt: new Date().toISOString(),
      colors,
    };

    const file = path.join(OUT_DIR, `${brand.slug}.json`);
    fs.writeFileSync(file, JSON.stringify(out, null, 2));
    console.log(`  ✓ ${brand.slug}: ${colors.length} colors → ${path.relative(process.cwd(), file)}`);
  }
}

main();
