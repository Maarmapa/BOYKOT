#!/usr/bin/env node
// Archiva posts + pages desde wp-json/* (no requiere auth, lectura solo).
// Funciona aunque wp-admin este caido porque Cloudflare cachea el REST API.
// Output: web/data/wp-archive/{posts,pages,categories,tags}.json
//
// Compat: Node 16+ (usa https module, no global fetch).

import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = 'https://www.boykot.cl';
const OUT = path.join(__dirname, '..', 'data', 'wp-archive');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'boykot-migration' } }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
        } else {
          const err = new Error(`HTTP ${res.statusCode}`);
          err.statusCode = res.statusCode;
          err.body = body.slice(0, 500);
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function fetchAll(type, fields) {
  const items = [];
  let page = 1;
  for (;;) {
    const url = `${SITE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=${fields}`;
    process.stdout.write(`  page ${page}... `);
    try {
      const data = await fetchJson(url);
      if (!Array.isArray(data) || data.length === 0) {
        console.log('done (empty)');
        break;
      }
      items.push(...data);
      console.log(`+${data.length} (total ${items.length})`);
      if (data.length < 100) break;
      page++;
    } catch (e) {
      if ((e.statusCode === 400 || e.statusCode === 404) && page > 1) {
        console.log('done (overflow)');
        break;
      }
      console.error(`error: ${e.message}`, e.body || '');
      throw e;
    }
  }
  return items;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const fields = 'id,slug,date,modified,title,content,excerpt,status,categories,tags,featured_media,link';

  console.log('Fetching posts...');
  const posts = await fetchAll('posts', fields);
  await fs.writeFile(path.join(OUT, 'posts.json'), JSON.stringify(posts, null, 2));
  console.log(`✓ Saved ${posts.length} posts to data/wp-archive/posts.json`);

  console.log('\nFetching pages...');
  const pages = await fetchAll('pages', fields);
  await fs.writeFile(path.join(OUT, 'pages.json'), JSON.stringify(pages, null, 2));
  console.log(`✓ Saved ${pages.length} pages to data/wp-archive/pages.json`);

  console.log('\nFetching categories...');
  const cats = await fetchAll('categories', 'id,name,slug,count,parent,description');
  await fs.writeFile(path.join(OUT, 'categories.json'), JSON.stringify(cats, null, 2));
  console.log(`✓ Saved ${cats.length} categories`);

  console.log('\nFetching tags...');
  const tags = await fetchAll('tags', 'id,name,slug,count');
  await fs.writeFile(path.join(OUT, 'tags.json'), JSON.stringify(tags, null, 2));
  console.log(`✓ Saved ${tags.length} tags`);

  console.log('\nDone. Archive at web/data/wp-archive/');
}

main().catch(e => { console.error(e); process.exit(1); });
