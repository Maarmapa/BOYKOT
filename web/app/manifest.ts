import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Boykot — Arte y Graffiti',
    short_name: 'Boykot',
    description:
      'Distribuidor oficial de Copic, Angelus y Holbein en Chile. Cartas de color completas con stock en tiempo real.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0066ff',
    orientation: 'portrait',
    lang: 'es-CL',
    categories: ['shopping', 'art', 'lifestyle'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  };
}
