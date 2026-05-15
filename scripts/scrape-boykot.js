#!/usr/bin/env node
/**
 * scrape-boykot.js
 *
 * Mirrors boykot.cl content (products, categories, brands, blog posts, pages)
 * into ../scraped/. Designed to be resumable and idempotent.
 *
 * Usage:
 *   node scripts/scrape-boykot.js              # scrape metadata
 *   node scripts/scrape-boykot.js --images     # download images for already-scraped products
 *   node scripts/scrape-boykot.js --only=products
 *   node scripts/scrape-boykot.js --limit=20   # cap per type (debugging)
 *
 * Output:
 *   scraped/products/{slug}.json
 *   scraped/categories/{slug}.json
 *   scraped/brands/{slug}.json
 *   scraped/posts/{slug}.json
 *   scraped/pages/{slug}.json
 *   scraped/images/{slug}/*.{jpg,png,webp}
 *   scraped/index.json                         # global summary
 *   scraped/.failed.log                        # URLs that errored
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const cheerio = require('cheerio');
const fetch = globalThis.fetch || require('node-fetch');

// ---------- Config

const SITE = 'https://www.boykot.cl';
const SITEMAP_INDEX = `${SITE}/sitemap_index.xml`;
const OUT = path.resolve(__dirname, '..', 'scraped');
const CATALOG_PATH = path.resolve(__dirname, '..', 'catalog.json');

const CONCURRENCY = 3;           // polite to Kinsta + Cloudflare
const REQUESTS_PER_SECOND = 3;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_RETRIES = 3;

const args = parseArgs(process.argv.slice(2));

// ---------- CLI

function parseArgs(argv) {
  const out = { only: null, limit: null, images: false, raw: false };
  for (const a of argv) {
    if (a === '--images') out.images = true;
    else if (a === '--raw') out.raw = true;
    else if (a.startsWith('--only=')) out.only = a.slice(7);
    else if (a.startsWith('--limit=')) out.limit = parseInt(a.slice(8), 10);
  }
  return out;
}

// ---------- HTTP

// Concurrency + rate-limit (manual to keep zero ESM-only deps for Node 16 compat).
async function runAll(tasks) {
  let i = 0, running = 0;
  let lastWindowStart = Date.now();
  let inWindow = 0;
  return new Promise((resolve, reject) => {
    const next = () => {
      if (i >= tasks.length && running === 0) return resolve();
      while (running < CONCURRENCY && i < tasks.length) {
        const now = Date.now();
        if (now - lastWindowStart >= 1000) { lastWindowStart = now; inWindow = 0; }
        if (inWindow >= REQUESTS_PER_SECOND) {
          setTimeout(next, 1000 - (now - lastWindowStart));
          return;
        }
        inWindow++; running++;
        const task = tasks[i++];
        Promise.resolve()
          .then(task)
          .catch(err => { /* per-task errors handled inside */ })
          .finally(() => { running--; next(); });
      }
    };
    next();
  });
}

async function fetchText(url, attempt = 1) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'user-agent': 'BoykotScraper/1.0 (+admin@boykot.cl)',
        'accept': 'text/html,application/xhtml+xml,application/xml',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
    return await res.text();
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await sleep(500 * attempt);
      return fetchText(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchBinary(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'BoykotScraper/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ---------- Sitemap

async function loadSitemapIndex() {
  const xml = await fetchText(SITEMAP_INDEX);
  return extractLocs(xml).filter(u => u.endsWith('.xml'));
}

async function loadSitemap(url) {
  const xml = await fetchText(url);
  return extractLocs(xml);
}

function extractLocs(xml) {
  const out = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

function slugFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || 'index';
}

// ---------- Extraction

function extractProduct(html, url) {
  const $ = cheerio.load(html);
  const ld = parseJsonLdProduct($);
  const breadcrumbs = parseJsonLdBreadcrumbs($);

  const gallery = unique([
    ...$('.woocommerce-product-gallery__image a').map((_, el) => $(el).attr('href')).get(),
    ...$('.woocommerce-product-gallery img').map((_, el) => $(el).attr('src') || $(el).attr('data-src')).get(),
  ].filter(Boolean));

  const shortDesc = textOf($('.woocommerce-product-details__short-description'));
  const longDesc = textOf($('#tab-description, .woocommerce-Tabs-panel--description')) || ld?.description || '';

  // Boykot's theme hides .posted_in; Yoast's JSON-LD breadcrumb is also truncated.
  // The URL path itself is the most reliable source of the full category chain.
  let categories = $('.posted_in a').map((_, el) => $(el).text().trim()).get();
  if (categories.length === 0) {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    // /tienda/{cat}/{subcat}/.../{product-slug}/  → drop "tienda" and product slug
    if (parts[0] === 'tienda' && parts.length > 2) {
      categories = parts.slice(1, -1);
    } else if (breadcrumbs.length > 2) {
      categories = breadcrumbs.slice(1, -1).map(b => b.name).filter(Boolean);
    }
  }
  const tags = $('.tagged_as a').map((_, el) => $(el).text().trim()).get();

  // Variable products: Boykot's variations grid renders each option as
  // <h5 class="product-title">CODE</h5>, with "Sin stock" sibling text when OOS.
  const variants = [];
  $('h5.product-title').each((_, el) => {
    const label = $(el).text().trim();
    if (!label) return;
    const card = $(el).closest('li, .product, .elementor-widget');
    const oos = /sin stock|out of stock/i.test(card.text());
    variants.push({ label, in_stock: !oos });
  });
  $('.variations select option').each((_, el) => {
    const label = ($(el).attr('value') || '').trim();
    if (label && label !== 'Elige una opción' && !variants.find(v => v.label === label)) {
      variants.push({ label, in_stock: true });
    }
  });

  return {
    url,
    slug: slugFromUrl(url),
    name: ld?.name || $('h1.product_title').text().trim(),
    sku: ld?.sku ? String(ld.sku) : ($('.sku').first().text().trim() || null),
    price_clp: ld?.offers?.[0]?.price ? parseInt(ld.offers[0].price, 10) : null,
    currency: ld?.offers?.[0]?.priceCurrency || 'CLP',
    availability: ld?.offers?.[0]?.availability?.split('/').pop() || null,
    description: clean(longDesc),
    short_description: clean(shortDesc),
    primary_image: ld?.image || null,
    gallery,
    breadcrumbs,
    categories,
    tags,
    variants,
    scraped_at: new Date().toISOString(),
  };
}

function parseJsonLdProduct($) {
  for (const s of $('script[type="application/ld+json"]').toArray()) {
    const raw = $(s).contents().text();
    try {
      const data = JSON.parse(raw);
      const items = Array.isArray(data) ? data : (data['@graph'] || [data]);
      for (const item of items) {
        if (item['@type'] === 'Product') {
          if (item.offers && !Array.isArray(item.offers)) item.offers = [item.offers];
          return item;
        }
      }
    } catch (_) { /* malformed JSON-LD, skip */ }
  }
  return null;
}

function parseJsonLdBreadcrumbs($) {
  for (const s of $('script[type="application/ld+json"]').toArray()) {
    const raw = $(s).contents().text();
    try {
      const data = JSON.parse(raw);
      const items = data['@graph'] || (Array.isArray(data) ? data : [data]);
      for (const item of items) {
        if (item['@type'] === 'BreadcrumbList') {
          return (item.itemListElement || []).map(el => ({
            name: el.name,
            url: el.item || null,
          }));
        }
      }
    } catch (_) { /* skip */ }
  }
  return [];
}

function extractGenericPage(html, url) {
  const $ = cheerio.load(html);
  return {
    url,
    slug: slugFromUrl(url),
    title: $('h1').first().text().trim() || $('title').text().trim(),
    description: clean(textOf($('article, .entry-content, main')) || $('meta[name="description"]').attr('content') || ''),
    scraped_at: new Date().toISOString(),
  };
}

function textOf($el) {
  if (!$el || !$el.length) return '';
  return $el.text().replace(/\s+/g, ' ').trim();
}

function clean(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function unique(arr) {
  return Array.from(new Set(arr));
}

// ---------- BSale matching

let bsaleCatalog = null;
let skuIndex = null;
let nameIndex = null;

function loadCatalog() {
  if (bsaleCatalog) return;
  if (!fs.existsSync(CATALOG_PATH)) {
    console.warn('⚠ catalog.json not found — BSale matching disabled');
    bsaleCatalog = [];
    skuIndex = new Map();
    nameIndex = new Map();
    return;
  }
  bsaleCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  skuIndex = new Map();
  nameIndex = new Map();
  for (const p of bsaleCatalog) {
    if (p.variants) {
      for (const v of p.variants) {
        if (v.sku) skuIndex.set(String(v.sku), { product: p, variant: v });
      }
    }
    if (p.name) {
      const n = normalize(p.name);
      if (n) (nameIndex.get(n) || nameIndex.set(n, []).get(n)).push(p);
    }
  }
}

function normalize(s) {
  return (s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // strip accents
    .replace(/[^a-z0-9]/g, '');
}

function matchBsale(product) {
  loadCatalog();
  if (product.sku && skuIndex.has(product.sku)) {
    const m = skuIndex.get(product.sku);
    return { method: 'sku', product_id: m.product.product_id, variant_id: m.variant.variant_id, confidence: 'high' };
  }
  if (product.name) {
    const n = normalize(product.name);
    if (nameIndex.has(n)) {
      const matches = nameIndex.get(n);
      return { method: 'name_exact', product_id: matches[0].product_id, ambiguous: matches.length > 1, confidence: matches.length === 1 ? 'high' : 'medium' };
    }
    // substring: BSale name contained in scraped name (common when scraped includes brand prefix)
    for (const [key, products] of nameIndex.entries()) {
      if (key.length >= 5 && n.includes(key)) {
        return { method: 'name_substring', product_id: products[0].product_id, confidence: 'low' };
      }
    }
  }
  return null;
}

// ---------- IO

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function writeJson(filepath, data) {
  await ensureDir(path.dirname(filepath));
  await fsp.writeFile(filepath, JSON.stringify(data, null, 2));
}

async function appendFailed(url, err) {
  await ensureDir(OUT);
  await fsp.appendFile(
    path.join(OUT, '.failed.log'),
    `${new Date().toISOString()}\t${url}\t${err.message}\n`
  );
}

// ---------- Scrape phases

const PHASES = {
  products: {
    sitemapMatch: /product-sitemap\d*\.xml$/,
    outDir: 'products',
    extract: extractProduct,
    enrich: (data) => ({ ...data, bsale_match: matchBsale(data) }),
  },
  categories: {
    sitemapMatch: /product_cat-sitemap\.xml$/,
    outDir: 'categories',
    extract: extractGenericPage,
  },
  brands: {
    sitemapMatch: /product_brand-sitemap\.xml$/,
    outDir: 'brands',
    extract: extractGenericPage,
  },
  posts: {
    sitemapMatch: /post-sitemap\.xml$/,
    outDir: 'posts',
    extract: extractGenericPage,
  },
  pages: {
    sitemapMatch: /page-sitemap\.xml$/,
    outDir: 'pages',
    extract: extractGenericPage,
  },
};

async function scrapePhase(name) {
  const phase = PHASES[name];
  console.log(`\n=== ${name.toUpperCase()} ===`);

  const indexUrls = await loadSitemapIndex();
  const sitemaps = indexUrls.filter(u => phase.sitemapMatch.test(u));
  if (sitemaps.length === 0) {
    console.log(`  (no sitemap matched ${phase.sitemapMatch})`);
    return { phase: name, scraped: 0, skipped: 0, failed: 0 };
  }

  let urls = [];
  for (const sm of sitemaps) urls.push(...await loadSitemap(sm));
  urls = unique(urls).filter(u => u !== `${SITE}/tienda/`);
  if (args.limit) urls = urls.slice(0, args.limit);

  console.log(`  ${urls.length} URLs across ${sitemaps.length} sitemap(s)`);

  let scraped = 0, skipped = 0, failed = 0;
  const tasks = urls.map(url => async () => {
    const slug = slugFromUrl(url);
    const outFile = path.join(OUT, phase.outDir, `${slug}.json`);
    if (fs.existsSync(outFile)) { skipped++; return; }
    try {
      const html = await fetchText(url);
      let data = phase.extract(html, url);
      if (phase.enrich) data = phase.enrich(data);
      if (args.raw) {
        await ensureDir(path.join(OUT, 'raw'));
        await fsp.writeFile(path.join(OUT, 'raw', `${slug}.html`), html);
      }
      await writeJson(outFile, data);
      scraped++;
      if (scraped % 25 === 0) console.log(`  …${scraped} scraped (${skipped} skipped)`);
    } catch (err) {
      failed++;
      await appendFailed(url, err);
    }
  });

  await runAll(tasks);
  console.log(`  ✓ ${scraped} scraped, ${skipped} skipped, ${failed} failed`);
  return { phase: name, scraped, skipped, failed };
}

// ---------- Images

async function downloadImages() {
  console.log('\n=== IMAGES ===');
  const productsDir = path.join(OUT, 'products');
  if (!fs.existsSync(productsDir)) {
    console.log('  no scraped/products/ — run scrape first');
    return;
  }
  const files = (await fsp.readdir(productsDir)).filter(f => f.endsWith('.json'));
  console.log(`  ${files.length} products to process`);

  let downloaded = 0, skipped = 0, failed = 0;
  const tasks = [];

  for (const f of files) {
    const product = JSON.parse(await fsp.readFile(path.join(productsDir, f), 'utf8'));
    const slug = product.slug;
    const imgDir = path.join(OUT, 'images', slug);
    const urls = unique([product.primary_image, ...(product.gallery || [])].filter(Boolean));

    for (const url of urls) {
      tasks.push(async () => {
        const ext = (url.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
        const name = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
        const filepath = path.join(imgDir, `${name}.${ext}`);
        if (fs.existsSync(filepath)) { skipped++; return; }
        try {
          const buf = await fetchBinary(url);
          await ensureDir(imgDir);
          await fsp.writeFile(filepath, buf);
          downloaded++;
          if (downloaded % 50 === 0) console.log(`  …${downloaded} images`);
        } catch (err) {
          failed++;
          await appendFailed(url, err);
        }
      });
    }
  }

  await runAll(tasks);
  console.log(`  ✓ ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`);
}

// ---------- Main

async function main() {
  await ensureDir(OUT);

  if (args.images) {
    await downloadImages();
    return;
  }

  const phases = args.only ? [args.only] : Object.keys(PHASES);
  const summary = { started_at: new Date().toISOString(), phases: [] };

  for (const p of phases) {
    if (!PHASES[p]) {
      console.error(`unknown phase: ${p}`);
      continue;
    }
    const result = await scrapePhase(p);
    summary.phases.push(result);
  }

  summary.finished_at = new Date().toISOString();
  await writeJson(path.join(OUT, 'index.json'), summary);
  console.log('\nDone. Summary at scraped/index.json');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
