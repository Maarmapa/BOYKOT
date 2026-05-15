#!/usr/bin/env node
/**
 * Scrape comprehensive de natekla.es/boytok/ — la nueva versión del sitio
 * que el cliente armó con su equipo.
 *
 * Saca:
 *   1. Pages (via wp-json/wp/v2/pages)
 *   2. Posts (via wp-json/wp/v2/posts)
 *   3. Categorías + tags WP
 *   4. WooCommerce productos (via wp-json/wc/store/v1/products que es público
 *      en el Store API, no requiere auth)
 *   5. Media library (via wp-json/wp/v2/media)
 *   6. HTML render de cada página (para preservar diseño)
 *
 * Output → scraped-natekla/
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const cheerio = require('cheerio');
const fetch = globalThis.fetch || require('node-fetch');

const BASE = 'https://natekla.es/boytok';
const OUT = path.join(__dirname, '..', 'scraped-natekla');
fs.mkdirSync(OUT, { recursive: true });
for (const sub of ['pages', 'posts', 'products', 'media', 'html', 'categories']) {
  fs.mkdirSync(path.join(OUT, sub), { recursive: true });
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function paginateAll(url) {
  const all = [];
  let page = 1;
  while (true) {
    try {
      const u = url + (url.includes('?') ? '&' : '?') + `per_page=100&page=${page}`;
      const data = await fetchJSON(u);
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      if (data.length < 100) break;
      page++;
    } catch (e) {
      console.warn(`  page ${page} failed: ${e.message}`);
      break;
    }
  }
  return all;
}

function extractRenderedHTML(html) {
  const $ = cheerio.load(html);
  // Tratamos de extraer solo el contenido principal: <main>, .entry-content,
  // .site-main, .e-con. Si nada matchea, devuelve el body entero.
  const selectors = ['main', '.entry-content', '.site-main', '.e-con', '#main', '#content', 'body'];
  for (const s of selectors) {
    const $el = $(s).first();
    if ($el.length) return $el.html() || '';
  }
  return $('body').html() || '';
}

function extractMeta(html) {
  const $ = cheerio.load(html);
  return {
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogImage: $('meta[property="og:image"]').attr('content') || '',
    canonical: $('link[rel="canonical"]').attr('href') || '',
    bodyClass: $('body').attr('class') || '',
  };
}

function extractStyles(html) {
  const $ = cheerio.load(html);
  // CSS de inline-style blocks (Elementor / Jet inyecta mucho aquí)
  const inline = [];
  $('style').each((_, el) => {
    const id = $(el).attr('id') || '';
    const css = $(el).html() || '';
    if (css.length > 20) inline.push({ id, css: css.slice(0, 50_000) });
  });
  // CSS files externos
  const links = [];
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    const id = $(el).attr('id') || '';
    if (href) links.push({ id, href });
  });
  return { inline, links };
}

async function scrapePages() {
  console.log('\n=== Pages ===');
  const pages = await paginateAll(`${BASE}/wp-json/wp/v2/pages`);
  console.log(`  ${pages.length} pages`);
  for (const p of pages) {
    await fsp.writeFile(
      path.join(OUT, 'pages', `${p.slug}.json`),
      JSON.stringify(p, null, 2),
    );
    console.log(`  ✓ ${p.slug} (${p.title.rendered})`);
  }
  return pages;
}

async function scrapePosts() {
  console.log('\n=== Posts ===');
  const posts = await paginateAll(`${BASE}/wp-json/wp/v2/posts`);
  console.log(`  ${posts.length} posts`);
  for (const p of posts) {
    await fsp.writeFile(
      path.join(OUT, 'posts', `${p.slug}.json`),
      JSON.stringify(p, null, 2),
    );
  }
  return posts;
}

async function scrapeProducts() {
  console.log('\n=== Products (WooCommerce Store API) ===');
  // Store API es publico (no requiere auth como wc/v3)
  let products = [];
  try {
    products = await paginateAll(`${BASE}/wp-json/wc/store/v1/products`);
  } catch (e) {
    console.warn(`  Store API failed: ${e.message}`);
    // fallback: WP REST con post_type=product
    try {
      products = await paginateAll(`${BASE}/wp-json/wp/v2/product`);
    } catch {
      console.warn('  WP REST products also failed');
    }
  }
  console.log(`  ${products.length} products`);
  for (const p of products) {
    const slug = p.slug || `id-${p.id}`;
    await fsp.writeFile(
      path.join(OUT, 'products', `${slug}.json`),
      JSON.stringify(p, null, 2),
    );
  }
  return products;
}

async function scrapeCategories() {
  console.log('\n=== Categories (WC product cats) ===');
  let cats = [];
  try {
    cats = await paginateAll(`${BASE}/wp-json/wc/store/v1/products/categories`);
  } catch (e) {
    console.warn(`  Store API cats failed: ${e.message}`);
  }
  console.log(`  ${cats.length} categories`);
  for (const c of cats) {
    await fsp.writeFile(
      path.join(OUT, 'categories', `${c.slug}.json`),
      JSON.stringify(c, null, 2),
    );
  }
  return cats;
}

async function scrapeMedia() {
  console.log('\n=== Media library ===');
  const media = await paginateAll(`${BASE}/wp-json/wp/v2/media`);
  console.log(`  ${media.length} media items`);
  const slim = media.map(m => ({
    id: m.id,
    title: m.title?.rendered,
    src: m.source_url,
    alt: m.alt_text,
    mime: m.mime_type,
    sizes: m.media_details?.sizes
      ? Object.entries(m.media_details.sizes).map(([name, info]) => ({
          name,
          src: info.source_url,
          w: info.width,
          h: info.height,
        }))
      : [],
  }));
  await fsp.writeFile(path.join(OUT, 'media', 'index.json'), JSON.stringify(slim, null, 2));
  return slim;
}

async function scrapeHTML(pages) {
  console.log('\n=== HTML render of each page ===');
  // Plus la home (la sacamos siempre)
  const urls = [BASE + '/', ...pages.map(p => p.link)].filter((v, i, a) => a.indexOf(v) === i);
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const slug = new URL(url).pathname.replace(/\/boytok\//, '').replace(/^\/|\/$/g, '') || 'home';
      const meta = extractMeta(html);
      const main = extractRenderedHTML(html);
      const styles = extractStyles(html);
      const filename = slug.replace(/\//g, '__');
      await fsp.writeFile(
        path.join(OUT, 'html', `${filename}.json`),
        JSON.stringify({ url, slug, meta, main, styles }, null, 2),
      );
      console.log(`  ✓ ${slug}`);
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      console.warn(`  ✗ ${url}: ${e.message}`);
    }
  }
}

(async () => {
  const start = Date.now();
  const pages = await scrapePages();
  await scrapePosts();
  await scrapeProducts();
  await scrapeCategories();
  await scrapeMedia();
  await scrapeHTML(pages);
  const summary = {
    scraped_at: new Date().toISOString(),
    took_seconds: (Date.now() - start) / 1000,
    counts: {
      pages: fs.readdirSync(path.join(OUT, 'pages')).length,
      posts: fs.readdirSync(path.join(OUT, 'posts')).length,
      products: fs.readdirSync(path.join(OUT, 'products')).length,
      categories: fs.readdirSync(path.join(OUT, 'categories')).length,
      html: fs.readdirSync(path.join(OUT, 'html')).length,
    },
  };
  await fsp.writeFile(path.join(OUT, 'index.json'), JSON.stringify(summary, null, 2));
  console.log('\n=== DONE ===');
  console.log(JSON.stringify(summary, null, 2));
})();
