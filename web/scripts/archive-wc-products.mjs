#!/usr/bin/env node
// Archiva TODOS los productos WooCommerce via wc/store/v1/products (sin auth).
// Equivale al "Exportar CSV" del wp-admin pero sin necesitar acceso al admin.
//
// Output: web/data/wp-archive/wc-products.json (todos los 3.6k productos
// con descripcion completa, precios, multi-image, categorias, atributos).
//
// Compat: Node 16+ (usa https module, no global fetch).

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
    https.get(url, { headers: { 'user-agent': 'boykot-migration' } }, res => {
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

// Slim the product to only fields we actually want — saves ~70% size
// by dropping srcset HTML, redundant prices, review counts, etc.
function slim(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku || null,
    parent: p.parent || 0,
    type: p.type,
    on_sale: p.on_sale,
    permalink: p.permalink,
    short: stripHtml(p.short_description || ''),
    description: stripHtml(p.description || ''),
    price: parseInt(p.prices?.price || '0', 10) || null,
    regular_price: parseInt(p.prices?.regular_price || '0', 10) || null,
    sale_price: parseInt(p.prices?.sale_price || '0', 10) || null,
    is_in_stock: Boolean(p.is_in_stock),
    is_purchasable: Boolean(p.is_purchasable),
    images: (p.images || []).map(i => ({ id: i.id, src: i.src, thumbnail: i.thumbnail, alt: i.alt || '' })),
    categories: (p.categories || []).map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    attributes: p.attributes || [],
    variations: p.variations || [],
    average_rating: p.average_rating || '0',
    review_count: p.review_count || 0,
  };
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });

  // Discovery: total count
  const head = await fetchJson(`${SITE}/wp-json/wc/store/v1/products?per_page=1`);
  const total = parseInt(head.headers['x-wp-total'] || '0', 10);
  const totalPages = Math.ceil(total / PER_PAGE);
  console.log(`Total products: ${total}, fetching in ${totalPages} pages of ${PER_PAGE}...`);

  const all = [];
  for (let page = 1; page <= totalPages; page++) {
    process.stdout.write(`  page ${page}/${totalPages}... `);
    const url = `${SITE}/wp-json/wc/store/v1/products?per_page=${PER_PAGE}&page=${page}`;
    try {
      const { data } = await fetchJson(url);
      if (!Array.isArray(data)) {
        console.log('skipping (not array)');
        continue;
      }
      const slimmed = data.map(slim);
      all.push(...slimmed);
      console.log(`+${data.length} (total ${all.length})`);
    } catch (e) {
      console.error(`error: ${e.message}`);
      // continue on error, partial is better than nothing
    }
    // pequeño delay para no estresar Cloudflare
    await new Promise(r => setTimeout(r, 50));
  }

  const outFile = path.join(OUT, 'wc-products.json');
  await fs.writeFile(outFile, JSON.stringify(all, null, 2));
  const sizeMb = (Buffer.byteLength(JSON.stringify(all)) / 1024 / 1024).toFixed(1);
  console.log(`\n✓ Saved ${all.length} products to wc-products.json (${sizeMb} MB)`);

  // Estadísticas
  const inStock = all.filter(p => p.is_in_stock).length;
  const onSale = all.filter(p => p.on_sale).length;
  const variable = all.filter(p => p.type === 'variable').length;
  const withImages = all.filter(p => p.images.length > 0).length;
  console.log(`\nStats:`);
  console.log(`  ${inStock} in stock · ${onSale} on sale · ${variable} variable · ${withImages} with images`);
}

main().catch(e => { console.error(e); process.exit(1); });
