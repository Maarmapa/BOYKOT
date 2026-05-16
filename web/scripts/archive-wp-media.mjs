#!/usr/bin/env node
// Lista TODOS los archivos del Media Library via wp-json/wp/v2/media.
// Solo URLs + nombre + sizes — NO descarga los archivos (16k es mucho).
// Esto sirve como inventario para futuras migraciones a CDN propio.

import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.boykot.cl';
const OUT = path.join(__dirname, '..', 'data', 'wp-archive');
const PER_PAGE = 100;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'boykot-migration' }, timeout: 30000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) }); }
          catch (e) { reject(e); }
        } else {
          const err = new Error(`HTTP ${res.statusCode}`);
          err.statusCode = res.statusCode;
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function slim(m) {
  return {
    id: m.id,
    slug: m.slug,
    date: m.date,
    type: m.media_type,
    mime: m.mime_type,
    url: m.source_url,
    title: (m.title?.rendered || '').replace(/<[^>]+>/g, ''),
    alt: m.alt_text || '',
    sizes: Object.fromEntries(
      Object.entries(m.media_details?.sizes || {}).map(([k, v]) => [k, v.source_url])
    ),
  };
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  const head = await fetchJson(`${SITE}/wp-json/wp/v2/media?per_page=1`);
  const total = parseInt(head.headers['x-wp-total'] || '0', 10);
  const totalPages = Math.ceil(total / PER_PAGE);
  console.log(`Total media: ${total}, fetching in ${totalPages} pages...`);

  const all = [];
  let consecutiveErrors = 0;
  for (let page = 1; page <= totalPages; page++) {
    process.stdout.write(`  ${page}/${totalPages} `);
    const url = `${SITE}/wp-json/wp/v2/media?per_page=${PER_PAGE}&page=${page}&_fields=id,slug,date,media_type,mime_type,source_url,title,alt_text,media_details`;
    try {
      const { data } = await fetchJson(url);
      if (Array.isArray(data)) {
        all.push(...data.map(slim));
        consecutiveErrors = 0;
        if (page % 10 === 0) console.log(`(total ${all.length})`);
      }
    } catch (e) {
      console.log(`error: ${e.message}`);
      consecutiveErrors++;
      if (consecutiveErrors >= 5) {
        console.log('Too many consecutive errors, stopping early.');
        break;
      }
    }
    await new Promise(r => setTimeout(r, 30));
  }
  console.log('');

  const out = path.join(OUT, 'media.json');
  await fs.writeFile(out, JSON.stringify(all, null, 2));
  const sizeMb = (Buffer.byteLength(JSON.stringify(all)) / 1024 / 1024).toFixed(1);
  console.log(`\n✓ Saved ${all.length} media entries (${sizeMb} MB)`);

  // Distribución por tipo
  const byType = {};
  for (const m of all) byType[m.type] = (byType[m.type] || 0) + 1;
  console.log(`Types:`, byType);
}

main().catch(e => { console.error(e); process.exit(1); });
