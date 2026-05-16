import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones · Boykot',
  description: 'Términos y condiciones de uso de boykot.cl — Ley 19.496 sobre Protección de los Derechos de los Consumidores (SERNAC).',
};

export const dynamic = 'force-static';

export default function TerminosPage() {
  const LAST_UPDATED = '15 de mayo de 2026';

  return (
    <main className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-3">
          Información legal
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-gray-500 mb-10">Última actualización: {LAST_UPDATED}</p>

        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
          <Section title="1. Sobre Boykot">
            <p>
              Boykot es una tienda chilena de materiales de arte, ilustración y graffiti operada
              por <strong>Mario Maldonado Parra</strong> con tienda física en Av. Providencia 2251 local 69,
              Santiago, Chile. RUT comercial disponible al solicitarlo.
            </p>
            <p>
              Distribuidor oficial en Chile de <strong>Copic</strong>, <strong>Angelus</strong> y <strong>Holbein</strong>.
              Además comercializa Molotow, Createx, ZIG Kuretake, POSCA, Wicked Colors y otras marcas.
            </p>
          </Section>

          <Section title="2. Productos y precios">
            <p>
              Los productos exhibidos en boykot.cl están sujetos a stock disponible. El stock se sincroniza
              en tiempo real con nuestro ERP (BSale) pero pueden ocurrir desfases menores entre el sitio
              y la realidad de la bodega.
            </p>
            <p>
              Los precios están expresados en pesos chilenos (CLP) e incluyen IVA. Boykot se reserva el
              derecho de modificar precios sin aviso previo. Para órdenes ya confirmadas, prevalece el
              precio mostrado al momento del pago.
            </p>
          </Section>

          <Section title="3. Proceso de compra">
            <p>
              La compra se realiza vía <strong>WhatsApp + Mercado Pago</strong>. El cliente arma su pedido en el sitio,
              completa sus datos de contacto, y recibe un mensaje de WhatsApp pre-llenado y un link de pago
              Mercado Pago. Una vez confirmado el pago, el pedido entra en preparación.
            </p>
            <p>
              Boykot se reserva el derecho de no aceptar pedidos cuando: (a) los datos de contacto sean
              incompletos o falsos, (b) haya sospecha de fraude, (c) el producto esté agotado al momento
              de procesar el pedido.
            </p>
          </Section>

          <Section title="4. Despacho">
            <p>
              <strong>Despacho a domicilio:</strong> a todo Chile vía Chilexpress, Starken o operador similar.
              Tiempo estimado: 2-7 días hábiles según destino. El tracking se envía por WhatsApp y email apenas
              el pedido sale de bodega.
            </p>
            <p>
              <strong>Retiro en tienda:</strong> disponible en Av. Providencia 2251 local 69, Santiago.
              Horario: lunes a viernes 10:00-18:00, sábado 10:00-15:00. Te avisamos por WhatsApp cuando esté
              listo (típicamente 24-48 horas hábiles).
            </p>
            <p>
              <strong>Envío gratis</strong> en compras sobre $50.000 CLP.
            </p>
          </Section>

          <Section title="5. Métodos de pago">
            <p>
              Aceptamos <strong>tarjeta de crédito y débito</strong> (Webpay y Visa/Mastercard internacionales),
              <strong> Apple Pay, Google Pay, Khipu y transferencia bancaria</strong> — todo gestionado vía
              Mercado Pago Chile. La transacción se procesa en el sitio de Mercado Pago, no en boykot.cl —
              Boykot no almacena datos de tarjeta.
            </p>
          </Section>

          <Section title="6. Derecho de retracto (Ley 19.496)">
            <p>
              De acuerdo a la Ley 19.496 sobre Protección de los Derechos de los Consumidores, tenés
              <strong> 10 días corridos</strong> desde la recepción del producto para ejercer el derecho de retracto
              si la compra se realizó a distancia (online).
            </p>
            <p>El producto debe estar:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Sin uso, en su empaque original</li>
              <li>Con todos los accesorios y manuales</li>
              <li>Sin daños atribuibles al cliente</li>
            </ul>
            <p>
              <strong>Excepciones</strong> (no aplica retracto): productos personalizados, productos abiertos
              que por su naturaleza no puedan revenderse (ej. marcadores destapados, pinturas usadas).
            </p>
            <p>
              Para iniciar un retracto, escribinos por WhatsApp o a <a href="mailto:providencia@boykot.cl" className="text-blue-700 hover:underline">providencia@boykot.cl</a> con
              el número de pedido. El cliente cubre el costo del envío de devolución.
            </p>
          </Section>

          <Section title="7. Cambios y devoluciones">
            <p>
              Productos con defecto de fábrica se cambian sin costo dentro de los 6 meses de la compra,
              siempre que el problema sea de fabricación (no de uso). Garantía aplicable según fabricante.
            </p>
            <p>
              Cambios por talla, color o referencia incorrecta: aceptamos cambio hasta 10 días después de
              entregado siempre que el producto esté sin abrir. Cliente cubre costo de envío.
            </p>
          </Section>

          <Section title="8. Propiedad intelectual">
            <p>
              Todo el contenido del sitio (textos, imágenes, swatches de color, logos, código) es propiedad
              de Boykot o de sus proveedores oficiales (Copic, Angelus, Holbein, etc.). Está prohibida su
              reproducción sin autorización expresa.
            </p>
          </Section>

          <Section title="9. Modificaciones a estos términos">
            <p>
              Boykot puede modificar estos términos en cualquier momento. La versión vigente es siempre
              la publicada en esta página. Para órdenes en proceso, aplican los términos al momento de
              la compra.
            </p>
          </Section>

          <Section title="10. Contacto y jurisdicción">
            <p>
              Para reclamos, consultas o ejercer cualquier derecho:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Email: <a href="mailto:providencia@boykot.cl" className="text-blue-700 hover:underline">providencia@boykot.cl</a></li>
              <li>WhatsApp: ver footer del sitio</li>
              <li>Presencial: Av. Providencia 2251 local 69, Santiago</li>
            </ul>
            <p>
              Cualquier controversia se resuelve bajo legislación chilena. SERNAC es la autoridad
              competente en materia de consumo.
            </p>
          </Section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center text-sm">
          <Link href="/" className="text-gray-500 hover:text-gray-900">← Volver al inicio</Link>
          <Link href="/privacidad" className="text-blue-700 hover:underline">Política de Privacidad →</Link>
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
