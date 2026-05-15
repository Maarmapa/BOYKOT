// Meta / Facebook / Instagram Shop product feed.
// Set this URL as the data source in Meta Commerce Manager →
// Catalog → Data Sources → Add Feed → Scheduled Feed.
//
//   https://boykot.cl/products-feed.xml
//
// Meta refreshes the feed daily; we expose every color of every brand
// registered in lib/colors/brands.ts as one item.

import { NextResponse } from 'next/server';
import { BRANDS, BRAND_SLUGS } from '@/lib/colors/brands';

export const dynamic = 'force-static';
export const revalidate = 60 * 60; // re-generate hourly

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  }[c]!));
}

function priceTag(amountClp: number): string {
  return `${amountClp}.00 CLP`;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export async function GET() {
  const items: string[] = [];

  for (const slug of BRAND_SLUGS) {
    const brand = BRANDS[slug];
    for (const color of brand.colors) {
      const id = `${slug}--${color.code}`;
      const link = `${SITE}/colores/${slug}?code=${encodeURIComponent(color.code)}`;
      const image =
        color.imageUrl ||
        (color.driveId
          ? `https://drive.google.com/thumbnail?id=${color.driveId}&sz=w800`
          : brand.heroImage || '');
      if (!image) continue;

      const title = `${brand.productName} · ${color.code}${color.name ? ` ${color.name}` : ''}`;
      const description = brand.description
        ? brand.description
        : `Color ${color.code} de ${brand.productName}, distribuido por Boykot en Chile.`;
      const brandTag = brand.productName.split(' ')[0];

      items.push(
        '<item>' +
          `<g:id>${escapeXml(id)}</g:id>` +
          `<g:title>${escapeXml(title)}</g:title>` +
          `<g:description>${escapeXml(description.slice(0, 5000))}</g:description>` +
          `<g:link>${escapeXml(link)}</g:link>` +
          `<g:image_link>${escapeXml(image)}</g:image_link>` +
          `<g:availability>in stock</g:availability>` +
          `<g:price>${escapeXml(priceTag(brand.basePriceClp))}</g:price>` +
          `<g:brand>${escapeXml(brandTag)}</g:brand>` +
          `<g:condition>new</g:condition>` +
          `<g:identifier_exists>false</g:identifier_exists>` +
          `<g:google_product_category>Arts &amp; Entertainment &gt; Hobbies &amp; Creative Arts &gt; Arts &amp; Crafts</g:google_product_category>` +
        '</item>'
      );
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n' +
    '<channel>\n' +
    `<title>Boykot product feed</title>\n` +
    `<link>${SITE}</link>\n` +
    `<description>Catalog of every Boykot color SKU, sourced from the brand registry. Updated hourly via Next.js ISR.</description>\n` +
    items.join('\n') +
    '\n</channel>\n</rss>';

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
}
