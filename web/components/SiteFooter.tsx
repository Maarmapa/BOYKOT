import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

// Marcas con logo blanco para mostrar en el footer (sección "robusto").
// Logos vienen del CDN natekla mientras esperamos los oficiales del user.
const FOOTER_BRANDS = [
  { name: 'Copic', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/copic-chile.webp', href: '/marca/copic' },
  { name: 'Angelus', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/Boton_Angelus.webp', href: '/marca/angelus' },
  { name: 'Holbein', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/holbein-chile.webp', href: '/marca/holbein' },
  { name: 'Molotow', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/molotow-chile.webp', href: '/marca/molotow' },
  { name: 'ZIG Kuretake', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/zig-kuretake-chile.webp', href: '/colores/zig-calligraphy' },
  { name: 'POSCA', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/krack-chile.webp', href: '/colores/uni-posca-5m' },
  { name: 'Createx', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/copic-chile.webp', href: '/colores/createx-airbrush-60ml' },
  { name: 'Acrilex', logo: 'https://natekla.es/boytok/wp-content/uploads/2026/04/krack-chile.webp', href: '/marcas' },
];

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* Top grid — 4 columnas en desktop, 1-2 en mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Col 1 — Sobre Boykot */}
          <div>
            <div className="font-bold text-2xl mb-4 tracking-tight">Boykot</div>
            <p className="text-sm text-gray-300 leading-relaxed mb-4">
              Tienda de materiales de arte, ilustración y graffiti fundada en 2010.
              Distribuidores oficiales <strong className="text-white">Copic</strong>,
              <strong className="text-white"> Angelus</strong> y
              <strong className="text-white"> Holbein</strong> en Chile.
            </p>
            <Link
              href="/sobre-boykot"
              className="text-xs text-gray-400 hover:text-white underline underline-offset-4 inline-block"
            >
              Conocé la historia →
            </Link>
          </div>

          {/* Col 2 — Tienda */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-gray-400 mb-4">
              Tienda
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-white">Inicio</Link></li>
              <li><Link href="/tienda" className="text-gray-300 hover:text-white">Productos</Link></li>
              <li><Link href="/colores" className="text-gray-300 hover:text-white">Cartas de color</Link></li>
              <li><Link href="/marcas" className="text-gray-300 hover:text-white">Marcas</Link></li>
              <li><Link href="/promociones" className="text-gray-300 hover:text-white">Promociones</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link href="/cotizador" className="text-gray-300 hover:text-white">Cotizador B2B</Link></li>
              <li><Link href="/regalos" className="text-gray-300 hover:text-white">Regalos</Link></li>
              <li><Link href="/community" className="text-gray-300 hover:text-white">Comunidad</Link></li>
              <li><Link href="/b2b" className="text-gray-300 hover:text-white">B2B / Mayoristas</Link></li>
              <li><Link href="/como-comprar" className="text-gray-300 hover:text-white">Cómo comprar</Link></li>
              <li><Link href="/contacto" className="text-gray-300 hover:text-white">Contacto</Link></li>
            </ul>
          </div>

          {/* Col 3 — Tienda física + horarios */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-gray-400 mb-4">
              Tienda física
            </h4>
            <address className="not-italic text-sm text-gray-300 leading-relaxed mb-4">
              Av. Providencia 2251, local 69<br />
              Santiago — Metro Los Leones<br />
              <a href="tel:+56223350961" className="hover:text-white">+56 2 2335 0961</a><br />
              <a href="mailto:providencia@boykot.cl" className="hover:text-white">providencia@boykot.cl</a>
            </address>
            <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
              Horarios
            </h4>
            <p className="text-sm text-gray-300">
              Lun a Vie · 10:00 – 18:00<br />
              Sábado · 10:00 – 15:00
            </p>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-gray-400 mb-4">
              Newsletter
            </h4>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              Nuevos colores, restock y eventos. Sin spam, sin compromisos.
            </p>
            <div className="footer-newsletter-wrapper">
              <NewsletterSignup />
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">
                Redes
              </h4>
              <div className="flex gap-3">
                <a href="https://instagram.com/boykot.cl" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-white hover:text-gray-900 rounded-full transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.05.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.05.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.05-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.05-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.87 5.87 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.74 1.46 1.38 2.13.67.63 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.75 2.13-1.38.63-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
                </a>
                <a href="https://facebook.com/molotowchile" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-white hover:text-gray-900 rounded-full transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99h-2.54V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z"/></svg>
                </a>
                <a href="https://wa.me/56223350961" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 flex items-center justify-center bg-gray-800 hover:bg-white hover:text-gray-900 rounded-full transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.7-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5-.1-.1-.6-1.4-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.8-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.7 2.7 4.2 3.7 1.5.6 2.1.7 2.8.6.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.2.8.8-3.1-.2-.3C3.9 14.7 3.5 13.4 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8.5-8.5 8.5z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de brand logos — robusto, visual */}
        <div className="border-t border-gray-800 pt-10 pb-2">
          <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-gray-400 mb-6 text-center">
            Marcas que distribuimos en Chile
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {FOOTER_BRANDS.map(b => (
              <Link
                key={b.name}
                href={b.href}
                className="group block aspect-square bg-white rounded-lg overflow-hidden hover:scale-105 transition-transform"
                title={b.name}
              >
                <img
                  src={b.logo}
                  alt={b.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div>
            © {new Date().getFullYear()} Boykot Graffiti y Materiales de Arte · RUT 76.XXX.XXX-X
          </div>
          <div className="flex gap-5">
            <Link href="/terminos" className="hover:text-white">Términos</Link>
            <Link href="/privacidad" className="hover:text-white">Privacidad</Link>
            <Link href="/contacto" className="hover:text-white">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
