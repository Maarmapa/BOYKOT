// Dynamic OG image per producto. Next.js OG Image Generation.
// Genera 1200x630 JPEG con producto + marca + precio.
//
// URL generada automaticamente: /producto/[slug]/opengraph-image
// Next la inyecta como <meta og:image> en /producto/[slug]

import { ImageResponse } from 'next/og';
import { getProduct } from '@/lib/products';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';
export const alt = 'Producto Boykot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: 80,
        }}
      >
        {/* Left: text */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 60 }}>
          <div>
            <div style={{ fontSize: 28, color: '#0066ff', fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>
              Boykot
            </div>
            {p.brand && (
              <div style={{ fontSize: 22, color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>
                {p.brand}
              </div>
            )}
            <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, marginBottom: 24, display: 'flex' }}>
              {p.name.slice(0, 70)}
            </div>
            {p.short && (
              <div style={{ fontSize: 22, color: '#d1d5db', lineHeight: 1.4, display: 'flex' }}>
                {p.short.slice(0, 120)}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {p.price && (
              <div style={{ fontSize: 44, fontWeight: 700, color: '#fff' }}>
                ${p.price.toLocaleString('es-CL')}
                <span style={{ fontSize: 18, color: '#9ca3af', marginLeft: 8 }}>CLP</span>
              </div>
            )}
            <div style={{ fontSize: 18, color: '#9ca3af' }}>
              boykot.cl
            </div>
          </div>
        </div>

        {/* Right: product image */}
        {p.image && (
          <div
            style={{
              width: 440,
              height: 440,
              alignSelf: 'center',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#fff',
              display: 'flex',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
