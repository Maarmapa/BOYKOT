import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

export const metadata = { title: 'Contacto · Boykot' };

export default function ContactPage() {
  return (
    <main className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <span className="text-gray-700">Contacto</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Contacto</h1>
          <p className="text-gray-600 max-w-2xl">
            Visitanos en la tienda, escribinos o llamanos. Distribuidores oficiales de Copic, Angelus y Holbein en Chile.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="border border-gray-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tienda física</h2>
              <p className="text-gray-900 font-semibold mb-1">Av. Providencia 2251, local 69</p>
              <p className="text-sm text-gray-600">Santiago · Metro Los Leones</p>
            </div>

            <div className="border border-gray-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Horarios</h2>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Lunes a Viernes</span><span className="text-gray-900">10:00 – 18:00</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Sábado</span><span className="text-gray-900">10:00 – 15:00</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Domingo</span><span className="text-gray-400">Cerrado</span></div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contacto directo</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="tel:+56223350961" className="text-gray-900 hover:underline">+56 2 2335 0961</a>
                </li>
                <li>
                  <a href="mailto:providencia@boykot.cl" className="text-gray-900 hover:underline">providencia@boykot.cl</a>
                </li>
                <li>
                  <a
                    href="https://wa.me/56223350961"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-green-700 hover:underline"
                  >
                    WhatsApp →
                  </a>
                </li>
              </ul>
            </div>

            <div className="border border-gray-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Redes</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="https://instagram.com/boykot187" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">Instagram @boykot187</a></li>
                <li><a href="https://facebook.com/molotowchile" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:underline">Facebook</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Escribinos</h2>
            <ContactForm />
            <p className="text-xs text-gray-400 mt-3">
              Respondemos en máximo 1 día hábil. Si es urgente, WhatsApp.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
