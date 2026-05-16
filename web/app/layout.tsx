import type { Metadata } from 'next';
import { Geist, Geist_Mono, Bricolage_Grotesque } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ChatWidget from '@/components/ChatWidget';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
// Display font for headlines — geometric, editorial, variable grade.
// Similar feel to Affinity / Piñata branding.
const display = Bricolage_Grotesque({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boykot.cl';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Boykot — Arte y Graffiti · Distribuidor Oficial Copic, Angelus, Holbein en Chile',
    template: '%s · Boykot',
  },
  description:
    'Tienda de materiales de arte, ilustración y graffiti. Distribuidores oficiales Copic, Angelus, Holbein, Molotow en Chile. Stock real, despacho a todo el país.',
  keywords: ['Copic Chile', 'Angelus Chile', 'Holbein Chile', 'Molotow Chile', 'materiales arte', 'graffiti Chile', 'marcadores Copic', 'pintura cuero', 'acuarela artística', 'aerógrafo', 'cartas de color'],
  authors: [{ name: 'Boykot' }],
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: 'Boykot',
    title: 'Boykot — Arte y Graffiti',
    description: 'Distribuidor Oficial Copic, Angelus, Holbein en Chile.',
  },
};

// JSON-LD: 3 schemas en un graph para máximo entendimiento de Google.
// 1. Store — la tienda física + comercio
// 2. Organization — entidad legal/empresa con contactPoint
// 3. WebSite — habilita "Sitelinks Search Box" en SERP (search action)
const orgSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Store',
      '@id': `${SITE}#store`,
      name: 'Boykot',
      url: SITE,
      logo: `${SITE}/icon.png`,
      image: `${SITE}/icon.png`,
      description: 'Tienda de materiales de arte, ilustración y graffiti. Distribuidores oficiales Copic, Angelus, Holbein en Chile.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Providencia 2251, local 69',
        addressLocality: 'Providencia',
        addressRegion: 'Santiago Metropolitana',
        postalCode: '7500000',
        addressCountry: 'CL',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -33.4244,
        longitude: -70.6109,
      },
      telephone: '+56-2-2335-0961',
      email: 'providencia@boykot.cl',
      sameAs: [
        'https://instagram.com/boykot.cl',
        'https://facebook.com/molotowchile',
      ],
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '15:00' },
      ],
      priceRange: '$$',
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}#organization`,
      name: 'Boykot',
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/icon.png`,
      },
      foundingDate: '2010',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+56-2-2335-0961',
          contactType: 'customer service',
          areaServed: 'CL',
          availableLanguage: ['Spanish', 'English'],
        },
        {
          '@type': 'ContactPoint',
          telephone: '+56-2-2335-0961',
          contactType: 'sales',
          areaServed: 'CL',
          availableLanguage: ['Spanish'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}#website`,
      url: SITE,
      name: 'Boykot',
      description: 'Materiales de arte, ilustración y graffiti — Chile',
      publisher: { '@id': `${SITE}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE}/buscar?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'es-CL',
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
