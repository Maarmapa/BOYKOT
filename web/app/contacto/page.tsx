import Link from 'next/link';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contacto · Boykot — Av. Providencia 2251, Santiago',
  description: 'Tienda física en Providencia, WhatsApp, email y formulario. Distribuidores oficiales Copic, Angelus, Holbein en Chile.',
};

export default function ContactPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero dark */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-gray-300">Contacto</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight font-bold">
            Hablemos
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            Visitanos en la tienda, escribinos o llamanos. Respondemos en horario hábil.
          </p>
        </div>
      </section>

      {/* Direct contact cards */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ContactCard
              emoji="💬"
              title="WhatsApp"
              desc="Lo más rápido para consultar stock"
              href="https://wa.me/56223350961"
              ext
              cta="+56 2 2335 0961"
            />
            <ContactCard
              emoji="📞"
              title="Teléfono"
              desc="Hablar con la tienda"
              href="tel:+56223350961"
              cta="+56 2 2335 0961"
            />
            <ContactCard
              emoji="✉"
              title="Email"
              desc="Para consultas detalladas"
              href="mailto:providencia@boykot.cl"
              cta="providencia@boykot.cl"
            />
            <ContactCard
              emoji="📷"
              title="Instagram"
              desc="DM también funciona"
              href="https://instagram.com/boykot.cl"
              ext
              cta="@boykot.cl"
            />
          </div>
        </div>
      </section>

      {/* Tienda física + horario + mapa */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                Tienda física
              </div>
              <h2 className="text-3xl sm:text-4xl text-gray-900 mb-4 leading-tight">
                Av. Providencia 2251, local 69
              </h2>
              <p className="text-gray-700 mb-5 leading-relaxed">
                Santiago, Chile.<br />
                A 1 cuadra del <strong>Metro Los Leones</strong>.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-5 mb-4">
                <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Horario</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-700">Lunes a Viernes</span>
                    <span className="text-gray-900 font-mono">10:00 – 18:00</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-gray-700">Sábado</span>
                    <span className="text-gray-900 font-mono">10:00 – 15:00</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-gray-700">Domingo</span>
                    <span className="text-gray-400 italic">Cerrado</span>
                  </div>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Av.+Providencia+2251,+Providencia,+Santiago"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                Ver en Google Maps →
              </a>
            </div>

            {/* Map embed */}
            <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.7!2d-70.6109!3d-33.4244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQXYuIFByb3ZpZGVuY2lhIDIyNTEsIFByb3ZpZGVuY2lhLCBTYW50aWFnbw!5e0!3m2!1ses!2scl!4v1716000000000!5m2!1ses!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación tienda Boykot"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
            ¿Preferís escribir?
          </div>
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-2">Formulario de contacto</h2>
          <p className="text-sm text-gray-600 mb-6">
            Respondemos en máximo 1 día hábil. Si es urgente, mejor WhatsApp.
          </p>
          <ContactForm />
        </div>
      </section>

      {/* B2B CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
          <h2 className="text-xl sm:text-2xl mb-2">¿Sos retail, escuela o estudio?</h2>
          <p className="text-gray-300 text-sm mb-5 max-w-xl mx-auto">
            Precios mayoristas, condiciones B2B y atención dedicada.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/b2b" className="inline-block bg-white text-gray-900 px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider hover:bg-gray-100">
              Programa B2B
            </Link>
            <Link href="/cotizador" className="inline-block border border-gray-700 text-white px-5 py-2.5 rounded-md font-semibold text-xs uppercase tracking-wider hover:bg-gray-800">
              Cotizador
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ContactCard({ emoji, title, desc, href, cta, ext = false }: { emoji: string; title: string; desc: string; href: string; cta: string; ext?: boolean }) {
  return (
    <a
      href={href}
      target={ext ? '_blank' : undefined}
      rel={ext ? 'noopener noreferrer' : undefined}
      className="block bg-white border border-gray-200 hover:border-gray-900 rounded-xl p-5 transition-all hover:shadow-md"
    >
      <div className="text-3xl mb-3">{emoji}</div>
      <div className="font-bold text-gray-900 mb-1">{title}</div>
      <div className="text-xs text-gray-500 mb-2">{desc}</div>
      <div className="text-xs font-semibold text-blue-600">{cta} →</div>
    </a>
  );
}
