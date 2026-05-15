#!/usr/bin/env node
/**
 * Escanea api.bsale.io/v1/products.json paginado y construye un mapa:
 *
 *   web/data/bsale-products.json
 *   { byCode: { "B00": { productId, variantId, name, price }, ... },
 *     byName: { "Sketch B00": {...}, ... },
 *     byBrand: { copic-sketch: { B00: {...}, ... }, copic-ciao: {...}, ... },
 *     generated_at }
 *
 * Necesita BSALE_ACCESS_TOKEN en el entorno.
 *
 * Uso:
 *   BSALE_ACCESS_TOKEN=... node scripts/build-bsale-map.js
 */
const fs = require('node:fs');
const path = require('node:path');

const TOKEN = process.env.BSALE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('Falta BSALE_ACCESS_TOKEN');
  process.exit(1);
}

const BASE = 'https://api.bsale.io/v1';
const OUT = path.join(__dirname, '..', 'web', 'data', 'bsale-products.json');

// Brand patterns. Cada uno mapea un prefijo de nombre BSale → brand-slug local.
const BRAND_PATTERNS = [
  { regex: /^Sketch\s+([A-Z0-9]+)$/i,             brand: 'copic-sketch' },
  { regex: /^Ciao\s+([A-Z0-9]+)$/i,               brand: 'copic-ciao' },
  { regex: /^Classic\s+([A-Z0-9]+)$/i,            brand: 'copic-classic' },
  { regex: /^Wide\s+([A-Z0-9]+)$/i,               brand: 'copic-wide' },
  { regex: /^Ink\s+([A-Z0-9]+)$/i,                brand: 'copic-ink' },
  { regex: /^Various\s+Ink\s+([A-Z0-9]+)$/i,      brand: 'copic-ink' },
  { regex: /^Multiliner\s+([A-Z0-9.]+)$/i,        brand: 'copic-multiliner' },
  { regex: /^Angelus\s+([A-Z0-9-]+)\s+1\s*oz/i,   brand: 'angelus-standard-1oz' },
  { regex: /^Angelus\s+([A-Z0-9-]+)\s+4\s*oz/i,   brand: 'angelus-standard-4oz' },
  { regex: /^Molotow\s+Premium\s+([A-Z0-9-]+)/i,  brand: 'molotow-premium' },
];

async function call(url) {
  const res = await fetch(url, {
    headers: { access_token: TOKEN, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`BSale ${res.status} ${url}: ${await res.text().catch(() => '')}`);
  return res.json();
}

async function fetchVariantsFor(productId) {
  // Cada producto puede tener una o varias variants; nosotros queremos la default.
  try {
    const data = await call(`${BASE}/variants.json?productid=${productId}&limit=1`);
    return data.items?.[0] ?? null;
  } catch (e) {
    console.warn(`  ! no pude leer variant de product ${productId}: ${e.message}`);
    return null;
  }
}

async function main() {
  const byCode = {};
  const byName = {};
  const byBrand = {};

  let next = `${BASE}/products.json?limit=50&offset=0`;
  let total = 0;
  let pages = 0;

  console.log('Escaneando productos BSale…');

  while (next) {
    const data = await call(next);
    for (const p of data.items ?? []) {
      total++;
      byName[p.name] = { productId: p.id, name: p.name };

      // Match by brand pattern
      for (const { regex, brand } of BRAND_PATTERNS) {
        const m = p.name?.match(regex);
        if (!m) continue;
        const code = m[1].toUpperCase();
        const v = await fetchVariantsFor(p.id);
        const entry = {
          productId: p.id,
          variantId: v?.id ?? null,
          name: p.name,
          code,
          brand,
        };
        byCode[code] = byCode[code] ?? entry; // first wins; later passes can disambiguate
        byBrand[brand] = byBrand[brand] ?? {};
        byBrand[brand][code] = entry;
        process.stdout.write(`.`);
        break;
      }
    }
    pages++;
    next = data.next ?? null;
    if (pages % 5 === 0) console.log(` ${total} products`);
  }

  console.log(`\n\nResumen:`);
  console.log(`  ${total} productos escaneados`);
  for (const brand of Object.keys(byBrand)) {
    console.log(`  ${brand}: ${Object.keys(byBrand[brand]).length} colores mapeados`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      { generated_at: new Date().toISOString(), byCode, byBrand, byName },
      null,
      2,
    ),
  );
  console.log(`\nEscrito: ${OUT}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
