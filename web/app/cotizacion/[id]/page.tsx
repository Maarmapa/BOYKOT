import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getQuoteByShortId } from '@/lib/quotes';
import PrintActions from './print-actions';

export const dynamic = 'force-dynamic';

interface Params {
  id: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  const q = await getQuoteByShortId(id);
  if (!q) return { title: 'Cotización no encontrada · Boykot' };
  return {
    title: `Cotización ${q.short_id} · Boykot`,
    description: q.customer_project
      ? `Cotización para ${q.customer_project}, total $${q.total_clp.toLocaleString('es-CL')}`
      : `Cotización Boykot, total $${q.total_clp.toLocaleString('es-CL')}`,
    robots: { index: false, follow: false }, // no indexar las cotizaciones individuales
  };
}

export default async function QuotePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const q = await getQuoteByShortId(id);
  if (!q) notFound();

  const issued = new Date(q.created_at);
  const validUntil = new Date(q.valid_until);

  return (
    <main className="bg-white min-h-screen print:bg-white">
      <PrintActions shortId={q.short_id} />

      {/* Quote sheet — diseñado para print con @media print clean */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 print:py-0 print:px-0 print:max-w-none">

        {/* Header con logo + datos Boykot */}
        <header className="flex items-start justify-between mb-10 pb-6 border-b-2 border-gray-900">
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900">Boykot</div>
            <div className="text-xs text-gray-500 mt-1 leading-tight">
              Tienda de arte, ilustración y graffiti<br />
              Distribuidores oficiales Copic · Angelus · Holbein<br />
              Av. Providencia 2251, local 69, Santiago<br />
              +56 2 2335 0961 · providencia@boykot.cl
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Cotización</div>
            <div className="text-2xl font-mono font-bold">{q.short_id}</div>
            <div className="text-xs text-gray-500 mt-2">
              <div>Emitida: {issued.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div>Válida hasta: <strong>{validUntil.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
            </div>
          </div>
        </header>

        {/* Datos cliente */}
        <section className="mb-8">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Cliente</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              {q.customer_name && <div className="font-semibold text-gray-900">{q.customer_name}</div>}
              {q.customer_company && <div className="text-gray-700">{q.customer_company}</div>}
              {q.customer_rut && <div className="text-gray-600 text-xs">RUT: {q.customer_rut}</div>}
            </div>
            <div className="text-gray-600 text-xs">
              {q.customer_email && <div>{q.customer_email}</div>}
              {q.customer_phone && <div>{q.customer_phone}</div>}
              {q.customer_project && (
                <div className="mt-1"><span className="text-gray-400">Proyecto:</span> {q.customer_project}</div>
              )}
            </div>
          </div>
        </section>

        {/* Items table */}
        <section className="mb-8">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wider">#</th>
                <th className="text-left px-3 py-2 text-xs uppercase tracking-wider">Producto</th>
                <th className="text-right px-3 py-2 text-xs uppercase tracking-wider">Cant.</th>
                <th className="text-right px-3 py-2 text-xs uppercase tracking-wider">P. Unit</th>
                <th className="text-right px-3 py-2 text-xs uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody>
              {q.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-gray-900">{item.product_name}</div>
                    <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-0.5">
                      {item.product_brand && <span>{item.product_brand}</span>}
                      {item.product_sku && <span className="font-mono">SKU: {item.product_sku}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium">{item.qty}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm">
                    ${item.unit_price_clp.toLocaleString('es-CL')}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-sm font-bold">
                    ${item.line_total_clp.toLocaleString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totales */}
        <section className="flex justify-end mb-10">
          <div className="w-full sm:w-80 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-mono">${q.subtotal_clp.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">IVA 19%</span>
              <span className="font-mono">${q.iva_clp.toLocaleString('es-CL')}</span>
            </div>
            <div className="flex justify-between py-2 mt-1 border-t-2 border-gray-900 text-base font-bold">
              <span>Total CLP</span>
              <span className="font-mono">${q.total_clp.toLocaleString('es-CL')}</span>
            </div>
          </div>
        </section>

        {/* Notas */}
        {q.customer_notes && (
          <section className="mb-8 bg-gray-50 border-l-4 border-gray-300 p-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Notas del cliente</div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.customer_notes}</p>
          </section>
        )}

        {/* Condiciones */}
        <section className="mb-8 text-xs text-gray-600 leading-relaxed">
          <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Condiciones</div>
          <ul className="space-y-1">
            <li>• Precios incluyen IVA 19%. Stock sujeto a disponibilidad al momento del pedido.</li>
            <li>• Vigencia: 30 días corridos desde emisión.</li>
            <li>• Despacho 24-48 hrs hábiles a todo Chile (Starken/Chilexpress) o retiro en tienda Providencia 2251.</li>
            <li>• Pago: transferencia, Mercado Pago (incluye Webpay+Khipu+tarjetas), o factura para clientes B2B.</li>
            <li>• Para confirmar pedido reenviar esta cotización a <strong>providencia@boykot.cl</strong> o WhatsApp <strong>+56 2 2335 0961</strong>.</li>
          </ul>
        </section>

        {/* Footer print */}
        <footer className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200 print:fixed print:bottom-4 print:left-0 print:right-0">
          Boykot · boykot.cl · Cotización {q.short_id} · Generada {issued.toLocaleString('es-CL')}
        </footer>
      </div>
    </main>
  );
}
