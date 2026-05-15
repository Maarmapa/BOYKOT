import Link from 'next/link';
import NewsletterSignup from './NewsletterSignup';

export default function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-4 gap-8">
        <div>
          <div className="font-bold text-xl mb-3">Boykot</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Nacida como tienda de Graffiti en 2010, Boykot se ha expandido hacia la
            ilustración y materiales de arte. Distribuidores oficiales de Copic,
            Angelus y Holbein en Chile.
          </p>
          <Link href="/sobre-boykot" className="text-xs text-gray-700 hover:text-gray-900 underline underline-offset-4 mt-3 inline-block">
            Conocé la historia →
          </Link>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-900 mb-3 uppercase tracking-wide">
            Tienda física
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            Av. Providencia 2251, local 69<br />
            Santiago — Metro Los Leones<br />
            +56 2 2335 0961<br />
            providencia@boykot.cl
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Lun a Vie 10:00 – 18:00 <br />
            Sáb 10:00 – 15:00
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-900 mb-3 uppercase tracking-wide">
            Redes
          </h4>
          <ul className="space-y-1.5 text-sm">
            <li><a href="https://instagram.com/boykot187" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">Instagram @boykot187</a></li>
            <li><a href="https://facebook.com/molotowchile" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">Facebook</a></li>
            <li><Link href="/colores" className="text-gray-600 hover:text-gray-900">Cartas de color</Link></li>
            <li><Link href="/marcas" className="text-gray-600 hover:text-gray-900">Marcas</Link></li>
            <li><Link href="/b2b" className="text-gray-600 hover:text-gray-900">B2B / Mayoristas</Link></li>
            <li><Link href="/contacto" className="text-gray-600 hover:text-gray-900">Contacto</Link></li>
            <li><Link href="/como-comprar" className="text-gray-600 hover:text-gray-900">Cómo comprar</Link></li>
          </ul>
        </div>
        <NewsletterSignup />
      </div>
      <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Boykot Graffiti y Materiales de Arte
      </div>
    </footer>
  );
}
