#!/usr/bin/env node
/**
 * Holbein products on boykot.cl ship their swatch image as a CSS background
 * inside the Yoast Product JSON-LD `description` field, e.g.
 *
 *   "description": "#FFF url(https://www.boykot.cl/wp-content/uploads/2026/04/G541.jpg) no-repeat"
 *
 * The .woocommerce-product-gallery on these pages is empty, so the generic
 * scraper missed them. This script re-fetches each individual product page,
 * parses JSON-LD, extracts {sku, name, price, imageUrl} and emits one
 * cluster brand file per Holbein line.
 *
 * Usage: node scripts/build-holbein-individual.js
 */

const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

const SCRAPED = path.resolve(__dirname, '..', 'scraped', 'products');
const OUT_DIR = path.resolve(__dirname, '..', 'web', 'public', 'colors');

const LINES = [
  {
    prefix: 'gouache-15-ml-color-',
    out:    'holbein-gouache-15ml',
    productName: 'Gouache Holbein 15ml',
    basePriceClp: 12200,
  },
  {
    prefix: 'oleo-20-ml-color-',
    out:    'holbein-oleo-20ml',
    productName: 'Óleo Holbein 20ml',
    basePriceClp: 8900,
  },
  {
    prefix: 'acryla-gouache-20-ml-color-',
    out:    'holbein-acryla-gouache-20ml',
    productName: 'Acryla Gouache Holbein 20ml',
    basePriceClp: 6900,
  },
  {
    prefix: 'acryla-gouche-40-ml-color-',
    out:    'holbein-acryla-gouache-40ml',
    productName: 'Acryla Gouache Holbein 40ml',
    basePriceClp: 11900,
  },
];

const CONCURRENCY = 3;
const RATE = 3;

async function fetchHtml(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'BoykotScraper/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (attempt < 3) {
      await new Promise(r => setTimeout(r, 600 * attempt));
      return fetchHtml(url, attempt + 1);
    }
    throw err;
  }
}

function parseLD(html) {
  // Greedy match content of every <script type="application/ld+json"> block.
  const re = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data['@type'] === 'Product') return data;
    } catch (_) { /* keep looking */ }
  }
  return null;
}

function imageFromDescription(desc) {
  if (!desc) return null;
  const m = desc.match(/url\((https?:\/\/[^)]+)\)/);
  return m ? m[1] : null;
}

async function runWithConcurrency(tasks) {
  let i = 0, running = 0, windowStart = Date.now(), inWindow = 0;
  return new Promise(resolve => {
    const next = () => {
      if (i >= tasks.length && running === 0) return resolve();
      while (running < CONCURRENCY && i < tasks.length) {
        const now = Date.now();
        if (now - windowStart >= 1000) { windowStart = now; inWindow = 0; }
        if (inWindow >= RATE) { setTimeout(next, 1000 - (now - windowStart)); return; }
        inWindow++; running++;
        Promise.resolve()
          .then(tasks[i++])
          .catch(() => {})
          .finally(() => { running--; next(); });
      }
    };
    next();
  });
}

async function processLine(line) {
  const files = fs.readdirSync(SCRAPED).filter(f => f.startsWith(line.prefix));
  console.log(`\n${line.out}: ${files.length} pages to fetch`);

  const colors = [];
  const tasks = files.map(f => async () => {
    const localData = JSON.parse(fs.readFileSync(path.join(SCRAPED, f), 'utf8'));
    try {
      const html = await fetchHtml(localData.url);
      const ld = parseLD(html);
      if (!ld) return;
      const imageUrl = imageFromDescription(ld.description);
      const code = ld.sku ? String(ld.sku).toUpperCase() : null;
      if (!code) return;
      // Extract a clean name: strip "Gouache 15 ml color" / "Oleo 20 ml color" prefix etc.
      let name = (ld.name || localData.name || '').trim();
      name = name.replace(/^(Gouache|Oleo|Óleo|Acryla Gouache|Acryla Gouche)\s+\d+\s*ml\s+color\s+/i, '');
      colors.push({
        code,
        name,
        imageUrl,
        sourceUrl: localData.url,
        priceClp: ld.offers?.[0]?.price ? parseInt(ld.offers[0].price, 10) : null,
      });
    } catch (err) {
      // Silently skip — slug not found, 404, etc.
    }
  });

  await runWithConcurrency(tasks);

  // Dedupe by code; sort.
  const byCode = new Map();
  for (const c of colors) if (!byCode.has(c.code)) byCode.set(c.code, c);
  const sorted = [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code));

  const out = {
    slug: line.out,
    productName: line.productName,
    basePriceClp: line.basePriceClp,
    bsaleProductId: 0,
    sourceCount: sorted.length,
    generatedAt: new Date().toISOString(),
    colors: sorted,
  };
  fs.writeFileSync(path.join(OUT_DIR, `${line.out}.json`), JSON.stringify(out, null, 2));
  const withImg = sorted.filter(c => c.imageUrl).length;
  console.log(`  ✓ ${sorted.length} colors (${withImg} with image)`);
}

(async () => {
  for (const line of LINES) await processLine(line);
})();
