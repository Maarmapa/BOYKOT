#!/usr/bin/env node
// Fetches all variation details for variable WC products.
// Reads wc-products.json, finds variable products (type === 'variable'),
// and calls /products/{variationId} for each to get per-variant price/stock/sku.
//
// Output: data/wp-archive/wc-variations.json

import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.boykot.cl';
const OUT = path.join(__dirname, '..', 'data', 'wp-archive');
const CONCURRENCY = 8;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'boykot-migration' }, timeout: 20000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        } else {
          const err = new Error(`HTTP ${res.statusCode}`);
          err.statusCode = res.statusCode;
          reject(err);
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

function slim(p) {
  return {
    id: p.id,
    parent: p.parent,
    sku: p.sku || null,
    name: p.name,
    price: parseInt(p.prices?.price || '0', 10) || null,
    regular_price: parseInt(p.prices?.regular_price || '0', 10) || null,
    is_in_stock: Boolean(p.is_in_stock),
    is_purchasable: Boolean(p.is_purchasable),
    image: p.images?.[0]?.src || null,
    attributes: p.attributes || [],
    on_sale: p.on_sale,
  };
}

async function pool(items, fn, concurrency) {
  const results = [];
  let i = 0;
  let done = 0;
  const total = items.length;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        const r = await fn(items[idx]);
        results[idx] = r;
      } catch (e) {
        results[idx] = null;
      }
      done++;
      if (done % 50 === 0) process.stdout.write(`  ${done}/${total}\n`);
    }
  }));
  return results;
}

async function main() {
  const productsFile = path.join(OUT, 'wc-products.json');
  const products = JSON.parse(await fs.readFile(productsFile, 'utf8'));
  const variableProducts = products.filter(p => p.type === 'variable' && p.variations?.length);
  const variationIds = variableProducts.flatMap(p => p.variations.map(v => v.id || v));
  console.log(`Found ${variableProducts.length} variable products → ${variationIds.length} variations to fetch`);

  const results = await pool(variationIds, async id => {
    const url = `${SITE}/wp-json/wc/store/v1/products/${id}`;
    const data = await fetchJson(url);
    return slim(data);
  }, CONCURRENCY);

  const valid = results.filter(Boolean);
  await fs.writeFile(path.join(OUT, 'wc-variations.json'), JSON.stringify(valid, null, 2));
  const sizeMb = (Buffer.byteLength(JSON.stringify(valid)) / 1024 / 1024).toFixed(1);
  console.log(`\n✓ Saved ${valid.length}/${variationIds.length} variations (${sizeMb} MB)`);
}

main().catch(e => { console.error(e); process.exit(1); });
