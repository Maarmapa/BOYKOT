#!/usr/bin/env node
/**
 * Upload scraped/images/ to Cloudflare R2 (S3-compatible).
 *
 * Env vars required:
 *   R2_ACCOUNT_ID            Cloudflare account id (numeric, in dashboard URL)
 *   R2_ACCESS_KEY_ID         R2 access key (Cloudflare → R2 → Manage API Tokens)
 *   R2_SECRET_ACCESS_KEY     R2 secret key
 *   R2_BUCKET                bucket name (e.g. "boykot-colors")
 *   R2_PUBLIC_BASE           optional, public CDN base for the bucket
 *
 * Usage:
 *   npm install @aws-sdk/client-s3  # one-time, into scripts deps
 *   node scripts/upload-to-r2.js                    # upload everything
 *   node scripts/upload-to-r2.js --prefix=copic     # upload only paths starting with "copic"
 *   node scripts/upload-to-r2.js --dry-run          # list what would upload, don't actually upload
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const IMAGES_DIR = path.resolve(__dirname, '..', 'scraped', 'images');

function req(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Env var ${name} is required`);
  return v;
}

function parseArgs(argv) {
  const out = { prefix: '', dryRun: false };
  for (const a of argv) {
    if (a === '--dry-run') out.dryRun = true;
    else if (a.startsWith('--prefix=')) out.prefix = a.slice(9);
  }
  return out;
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return ({
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  })[ext] || 'application/octet-stream';
}

async function walkAllFiles(root) {
  const out = [];
  async function rec(dir) {
    for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await rec(full);
      else if (entry.isFile()) out.push(full);
    }
  }
  await rec(root);
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`No images at ${IMAGES_DIR} — run \`node scripts/scrape-boykot.js --images\` first.`);
    process.exit(1);
  }

  const files = (await walkAllFiles(IMAGES_DIR)).filter(f => {
    const rel = path.relative(IMAGES_DIR, f);
    return !args.prefix || rel.startsWith(args.prefix);
  });
  console.log(`${files.length} files matched${args.prefix ? ` (prefix: ${args.prefix})` : ''}`);

  if (args.dryRun) {
    files.slice(0, 20).forEach(f => console.log('  would upload:', path.relative(IMAGES_DIR, f)));
    if (files.length > 20) console.log(`  ... +${files.length - 20} more`);
    return;
  }

  // Lazy import so this script can be inspected without the SDK installed.
  let S3Client, PutObjectCommand;
  try {
    ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
  } catch {
    console.error('Missing @aws-sdk/client-s3. Install with:\n  npm install @aws-sdk/client-s3');
    process.exit(1);
  }

  const accountId = req('R2_ACCOUNT_ID');
  const bucket = req('R2_BUCKET');
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: req('R2_ACCESS_KEY_ID'),
      secretAccessKey: req('R2_SECRET_ACCESS_KEY'),
    },
  });

  let uploaded = 0, skipped = 0, failed = 0;
  const t0 = Date.now();
  for (const file of files) {
    const rel = path.relative(IMAGES_DIR, file).split(path.sep).join('/');
    const body = await fsp.readFile(file);
    const md5 = crypto.createHash('md5').update(body).digest('base64');
    try {
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: rel,
        Body: body,
        ContentType: mimeFor(file),
        ContentMD5: md5,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
      uploaded++;
      if (uploaded % 50 === 0) {
        const rate = (uploaded / ((Date.now() - t0) / 1000)).toFixed(1);
        console.log(`  …${uploaded}/${files.length} (${rate}/s)`);
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ ${rel}: ${err.message}`);
    }
  }
  console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  if (process.env.R2_PUBLIC_BASE) {
    console.log(`Public sample: ${process.env.R2_PUBLIC_BASE}/${path.relative(IMAGES_DIR, files[0] || '')}`);
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
