#!/usr/bin/env node
// Bulk seed de public.products_fts desde products.json + wc-products.json
// Lee env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (no commitea creds)
//
// Uso: cd /Users/jibtone/Boykot && node web/scripts/seed-products-fts.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const WC_FILE = path.join(__dirname, '..', 'data', 'wp-archive', 'wc-products.json');
const BATCH = 500;

function postJson(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      method: 'POST',
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: { 'content-type': 'application/json', ...headers },
    };
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: text });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${text.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }

  const products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
  let wcByslug = {};
  try {
    const wc = JSON.parse(await fs.readFile(WC_FILE, 'utf8'));
    for (const p of wc) {
      wcByslug[p.slug] = p;
    }
  } catch {
    console.warn('wc-products.json not found, using only products.json');
  }

  const slugs = Object.keys(products);
  console.log(`Seeding ${slugs.length} products to products_fts...`);

  const rows = slugs.map(slug => {
    const p = products[slug];
    const wc = wcByslug[slug];
    const cats = wc?.categories?.map(c => c.name).join(', ') || p.cat || '';
    return {
      slug,
      name: p.name || slug,
      sku: p.sku || null,
      brand: p.brand || null,
      category: cats,
      short: (p.short || '').slice(0, 500),
      price_clp: p.price || null,
      image: p.image || null,
      availability: p.availability || 'InStock',
    };
  });

  // Bulk upsert in batches of 500
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    try {
      await postJson(
        `${SUPABASE_URL}/rest/v1/products_fts?on_conflict=slug`,
        batch,
        {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          prefer: 'resolution=merge-duplicates,return=minimal',
        },
      );
      inserted += batch.length;
      process.stdout.write(`  upserted ${inserted}/${rows.length}\r`);
    } catch (e) {
      console.error(`\nbatch ${i} failed:`, e.message);
    }
  }
  console.log(`\n✓ Done. ${inserted} rows in products_fts.`);
}

main().catch(e => { console.error(e); process.exit(1); });
