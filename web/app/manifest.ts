import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Boykot — Arte y Graffiti',
    short_name: 'Boykot',
    description:
      'Distribuidor oficial Copic, Angelus, Holbein en Chile. Cartas de color con stock en tiempo real. Despacho 24-48hrs.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0066ff',
    orientation: 'portrait',
    lang: 'es-CL',
    categories: ['shopping', 'art', 'lifestyle', 'business'],
    icons: [
      { src: '/favicon.ico', sizes: '32x32 48x48', type: 'image/x-icon' },
    ],
    // Atajos rapidos en home screen al instalar PWA
    shortcuts: [
      {
        name: 'Tienda',
        short_name: 'Tienda',
        url: '/tienda',
        description: 'Catálogo completo',
      },
      {
        name: 'Marcas',
        short_name: 'Marcas',
        url: '/marcas',
        description: 'Copic, Angelus, Holbein, Molotow',
      },
      {
        name: 'Cotizar B2B',
        short_name: 'Cotizar',
        url: '/cotizador',
        description: 'Cotización PDF en 30 segundos',
      },
      {
        name: 'Mi cuenta',
        short_name: 'Cuenta',
        url: '/perfil',
        description: 'Pedidos + favoritos',
      },
    ],
    prefer_related_applications: false,
  };
}
