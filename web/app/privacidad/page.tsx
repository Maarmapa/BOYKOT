import Link from 'next/link';

export const metadata = {
  title: 'Política de Privacidad · Boykot',
  description: 'Política de privacidad de boykot.cl — Ley 19.628 sobre Protección de la Vida Privada (Chile).',
};

export const dynamic = 'force-static';

export default function PrivacidadPage() {
  const LAST_UPDATED = '15 de mayo de 2026';

  return (
    <main className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
          Información legal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-10">Última actualización: {LAST_UPDATED}</p>

        <div className="text-gray-700 leading-relaxed space-y-6">
          <Section title="1. Quiénes somos">
            <p>
              Boykot (boykot.cl) es operado por <strong>Mario Maldonado Parra</strong> con tienda física en
              Av. Providencia 2251 local 69, Santiago, Chile. Esta política describe qué datos personales
              recopilamos, cómo los usamos y los derechos que tenés sobre ellos, conforme a la Ley
              N° 19.628 sobre Protección de la Vida Privada (Chile).
            </p>
          </Section>

          <Section title="2. Qué datos recopilamos">
            <p>Cuando hacés una compra o usás nuestro sitio, podemos recopilar:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Datos de contacto:</strong> nombre completo, email, teléfono.</li>
              <li><strong>Datos de despacho:</strong> dirección, comuna, ciudad.</li>
              <li><strong>Datos fiscales:</strong> RUT (opcional, para boleta o factura).</li>
              <li><strong>Datos de la compra:</strong> productos, montos, fecha, ID de pago.</li>
              <li><strong>Datos técnicos:</strong> IP, navegador, dispositivo, páginas visitadas (vía Vercel Analytics, sin cookies).</li>
              <li><strong>Datos de pago:</strong> NO almacenamos números de tarjeta. Los procesa Mercado Pago.</li>
            </ul>
          </Section>

          <Section title="3. Para qué usamos tus datos">
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Procesar tu pedido:</strong> preparación, despacho, comunicación de status.</li>
              <li><strong>Atención y soporte:</strong> responder consultas, gestionar devoluciones.</li>
              <li><strong>Facturación:</strong> emitir boleta o factura electrónica (vía BSale + SII).</li>
              <li><strong>Marketing:</strong> si optaste por nuestro newsletter, enviarte ofertas, lanzamientos y eventos.</li>
              <li><strong>Mejora del sitio:</strong> análisis agregado de tráfico para optimizar UX.</li>
              <li><strong>Cumplimiento legal:</strong> respuesta a requerimientos de autoridades.</li>
            </ul>
          </Section>

          <Section title="4. Con quién compartimos tus datos">
            <p>
              Compartimos datos únicamente con los proveedores estrictamente necesarios para operar
              el servicio:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Mercado Pago Chile</strong> — para procesar pagos. Su política: <a href="https://www.mercadopago.cl/privacidad" target="_blank" rel="noopener" className="text-blue-700 hover:underline">mercadopago.cl/privacidad</a></li>
              <li><strong>BSale</strong> — nuestro ERP para gestión de pedidos y emisión de documentos tributarios.</li>
              <li><strong>Couriers (Chilexpress, Starken)</strong> — para despacho.</li>
              <li><strong>Brevo (Sendinblue)</strong> — para envío de emails transaccionales.</li>
              <li><strong>Vercel</strong> — hosting del sitio y analítica básica.</li>
              <li><strong>Supabase</strong> — base de datos.</li>
              <li><strong>WhatsApp Business</strong> — comunicación con el cliente.</li>
            </ul>
            <p>
              <strong>No vendemos ni cedemos datos</strong> a terceros con fines de marketing externo.
            </p>
          </Section>

          <Section title="5. Cookies y tecnologías similares">
            <p>
              Boykot usa <strong>cookies estrictamente funcionales</strong> (carrito, sesión, idioma) y
              <strong> analítica sin cookies</strong> vía Vercel Analytics (no rastrea individuos).
            </p>
            <p>
              NO usamos cookies de publicidad de terceros, NO compartimos data con redes sociales para
              retargeting sin tu consentimiento expreso.
            </p>
          </Section>

          <Section title="6. Tus derechos (Ley 19.628)">
            <p>
              Tenés derecho a:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Acceso:</strong> saber qué datos tuyos tenemos.</li>
              <li><strong>Rectificación:</strong> corregir datos erróneos o desactualizados.</li>
              <li><strong>Cancelación:</strong> eliminar tus datos (sujeto a obligaciones legales de retención).</li>
              <li><strong>Oposición:</strong> dejar de recibir comunicaciones de marketing (botón "unsubscribe" en cada email).</li>
            </ul>
            <p>
              Para ejercer estos derechos: <a href="mailto:providencia@boykot.cl" className="text-blue-700 hover:underline">providencia@boykot.cl</a> con asunto "Datos personales".
              Respondemos en máximo 15 días hábiles.
            </p>
          </Section>

          <Section title="7. Seguridad de los datos">
            <p>
              Tomamos medidas razonables para proteger tus datos: cifrado HTTPS, autenticación en proveedores
              cloud (Vercel, Supabase, Mercado Pago), control de acceso interno, monitoreo de seguridad.
            </p>
            <p>
              Si ocurre una violación de datos que pueda afectar tus derechos, te notificaremos por email
              dentro de las 72 horas siguientes a que tomemos conocimiento del hecho.
            </p>
          </Section>

          <Section title="8. Retención de datos">
            <p>
              Mantenemos tus datos mientras tengas relación comercial con Boykot. Después de 5 años sin
              actividad, los datos personales no esenciales se anonimizan. Datos fiscales (RUT, montos)
              se retienen según exigencia SII (6 años mínimo).
            </p>
          </Section>

          <Section title="9. Menores de edad">
            <p>
              El sitio está dirigido a mayores de 18 años. Si sos menor, necesitás autorización de tu
              representante legal para comprar.
            </p>
          </Section>

          <Section title="10. Modificaciones">
            <p>
              Esta política puede actualizarse. Si hay cambios sustantivos, te avisamos por email o aviso
              en el sitio. La versión vigente siempre es la publicada acá.
            </p>
          </Section>

          <Section title="11. Contacto">
            <p>
              Cualquier duda sobre esta política:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Email: <a href="mailto:providencia@boykot.cl" className="text-blue-700 hover:underline">providencia@boykot.cl</a></li>
              <li>Presencial: Av. Providencia 2251 local 69, Santiago, Chile</li>
              <li>Autoridad: Consejo para la Transparencia (Chile) — <a href="https://www.consejotransparencia.cl" target="_blank" rel="noopener" className="text-blue-700 hover:underline">consejotransparencia.cl</a></li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center text-sm">
          <Link href="/terminos" className="text-blue-700 hover:underline">← Términos y Condiciones</Link>
          <Link href="/" className="text-gray-500 hover:text-gray-900">Volver al inicio →</Link>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-3 mt-8">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
