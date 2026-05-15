#!/usr/bin/env node
/**
 * Scrape de páginas estáticas de boykot.cl (NO productos — eso ya está hecho).
 *
 * Tira el sitemap → filtra pages relevantes → baja cada URL → guarda
 * estructura limpia (title, hero, sections, body) en scraped/pages/{slug}.json.
 *
 * Diseñado para no scrapear lo que ya tengo en /products. Solo brand
 * landings, tienda, IC, sneakers, curaciones temáticas y legales.
 */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const cheerio = require('cheerio');
const fetch = globalThis.fetch || require('node-fetch');

const OUT = path.join(__dirname, '..', 'scraped', 'pages');
fs.mkdirSync(OUT, { recursive: true });

const SITEMAP = 'https://www.boykot.cl/page-sitemap.xml';
const CONCURRENCY = 3;
const REQ_DELAY = 350;

// URLs que YA tengo cubiertas en el sitio nuevo (no scrapear)
const SKIP = new Set([
  '/', '/cart/', '/checkout/', '/my-account/', '/my-account/ordenes/',
  '/contacto/', '/marcas/', '/como-comprar-en-boykot/',
  '/prueba/', // página de test, no nos sirve
  '/communication-preferences/', // tecnico
]);

// Mapeo URL → slug local (para nombrar archivos)
function slugFor(urlPath) {
  return urlPath.replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'home';
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'BoykotRebuild/1.0 (scraping for legitimate own-site migration)',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function getPageUrls() {
  const xml = await fetchText(SITEMAP);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  return urls
    .filter(u => u.startsWith('https://www.boykot.cl/'))
    .filter(u => !u.includes('/wp-content/'))
    .map(u => new URL(u).pathname);
}

function extractContent(html, url) {
  const $ = cheerio.load(html);

  // Title (priorizar OG, sino h1, sino <title>)
  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text().trim() ||
    $('title').text().trim();

  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

  const heroImage = $('meta[property="og:image"]').attr('content') || null;

  // Estraigo el contenido principal — primero busco main, sino #content, sino body
  const main =
    $('main').first().length ? $('main').first() :
    $('#main').first().length ? $('#main').first() :
    $('#content').first().length ? $('#content').first() :
    $('body').first();

  // Saco navs, footers, sidebars, popups, scripts
  main.find('nav, footer, aside, script, style, .menu, #menu, .widget, [role="dialog"]').remove();

  // Extraigo h2/h3 + sus secciones
  const sections = [];
  main.find('h2, h3').each((_, el) => {
    const $el = $(el);
    const heading = $el.text().trim();
    if (!heading) return;
    const level = $el.is('h2') ? 2 : 3;
    // El contenido es todo hasta el próximo h2/h3
    const $next = $el.nextUntil('h2, h3');
    const body = $next
      .map((_, n) => $(n).text().trim())
      .get()
      .filter(Boolean)
      .join('\n\n');
    const images = $next
      .find('img')
      .map((_, img) => $(img).attr('src'))
      .get()
      .filter(Boolean)
      .slice(0, 6);
    const links = $next
      .find('a')
      .map((_, a) => {
        const href = $(a).attr('href');
        const text = $(a).text().trim();
        if (!href || !text) return null;
        return { href, text };
      })
      .get()
      .filter(Boolean)
      .slice(0, 20);
    sections.push({ level, heading, body, images, links });
  });

  // Texto general (caso fallback cuando no hay h2/h3 estructurados)
  const paragraphs = main
    .find('p')
    .slice(0, 20)
    .map((_, p) => $(p).text().trim())
    .get()
    .filter(t => t.length > 30);

  // Links a productos
  const productLinks = $('a[href*="/tienda/"], a[href*="/copic-chile/"], a[href*="/pinturas-angelus/"]')
    .map((_, a) => {
      const href = $(a).attr('href');
      const text = $(a).text().trim() || $(a).find('img').attr('alt');
      if (!href || !text) return null;
      return { href, text: String(text).trim() };
    })
    .get()
    .filter(Boolean)
    .slice(0, 50);

  // Imágenes principales del contenido (no del UI)
  const images = main
    .find('img')
    .slice(0, 20)
    .map((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src');
      const alt = $(img).attr('alt') || '';
      if (!src || src.includes('logo')) return null;
      return { src, alt };
    })
    .get()
    .filter(Boolean);

  return {
    url,
    title,
    description,
    heroImage,
    sections,
    paragraphs,
    productLinks,
    images,
    scraped_at: new Date().toISOString(),
  };
}

async function processUrl(urlPath) {
  if (SKIP.has(urlPath)) return { skipped: true, urlPath };
  const slug = slugFor(urlPath);
  const out = path.join(OUT, `${slug}.json`);
  if (fs.existsSync(out)) {
    return { cached: true, urlPath, slug };
  }
  try {
    const html = await fetchText(`https://www.boykot.cl${urlPath}`);
    const data = extractContent(html, urlPath);
    await fsp.writeFile(out, JSON.stringify(data, null, 2));
    return { ok: true, urlPath, slug, title: data.title };
  } catch (e) {
    return { error: e.message, urlPath };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('Fetching sitemap…');
  const urls = await getPageUrls();
  console.log(`Found ${urls.length} pages. Starting scrape (skip ${SKIP.size} already-covered)…\n`);

  const results = { ok: 0, cached: 0, skipped: 0, errors: [] };

  // Pool simple de concurrencia
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      const r = await processUrl(url);
      if (r.ok) { results.ok++; console.log(`✓ ${url}  →  ${r.title?.slice(0, 60) || ''}`); }
      else if (r.cached) { results.cached++; }
      else if (r.skipped) { results.skipped++; }
      else { results.errors.push(r); console.log(`✗ ${url}  (${r.error})`); }
      await sleep(REQ_DELAY);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log(`\nDone. Ok: ${results.ok}, Cached: ${results.cached}, Skipped: ${results.skipped}, Errors: ${results.errors.length}`);
  if (results.errors.length) {
    console.log('Errors:');
    results.errors.forEach(e => console.log(`  ${e.urlPath}: ${e.error}`));
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
