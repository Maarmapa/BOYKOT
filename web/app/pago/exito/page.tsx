import Link from 'next/link';
import { fetchPayment } from '@/lib/mercadopago';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Fallback al webhook: cuando el cliente regresa de MP, MP nos pasa el
// payment_id en la query. Lo usamos para fetchear el pago directo de
// MP API y confirmar la orden. Si el webhook llegó primero, no hacemos
// nada (ya está confirmada). Si no llegó, ESTE es el path que confirma.
async function confirmPaymentIfPending(orderId: string, paymentId: string, status?: string) {
  try {
    const { data: order } = await supabaseAdmin()
      .from('pending_orders')
      .select('payment_status')
      .eq('short_id', orderId)
      .maybeSingle();
    if (!order || order.payment_status === 'paid') return;

    if (status === 'approved') {
      const payment = await fetchPayment(paymentId).catch(() => null);
      const isPaid = payment?.status === 'approved' || payment?.status === 'authorized';
      if (isPaid) {
        await supabaseAdmin()
          .from('pending_orders')
          .update({
            payment_status: 'paid',
            payment_reference: paymentId,
            paid_at: payment?.date_approved || new Date().toISOString(),
            status: 'confirmed',
            updated_at: new Date().toISOString(),
          })
          .eq('short_id', orderId);
      }
    }
  } catch (e) {
    console.error('[pago/exito] confirmPayment failed:', (e as Error).message);
  }
}

export default async function PagoExitoPage({ searchParams }: { searchParams: Promise<{ order?: string; payment_id?: string; status?: string; collection_status?: string }> }) {
  const params = await searchParams;
  const { order, payment_id, status, collection_status } = params;

  // Confirmar el pago contra MP API (failsafe si webhook no llegó).
  if (order && payment_id) {
    await confirmPaymentIfPending(order, payment_id, status || collection_status);
  }

  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🎨</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Gracias por tu compra!</h1>
        <p className="text-base text-gray-700 mb-2">
          Tu pago fue confirmado.
        </p>
        {order && (
          <p className="text-xs text-gray-500 font-mono mb-6">N° de pedido: <strong>{order}</strong></p>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-900 mb-2"><strong>¿Y ahora qué?</strong></p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Preparamos tu pedido en máximo 24-48h hábiles</li>
            <li>Te escribimos por WhatsApp cuando esté listo</li>
            <li>Si elegiste despacho, te mandamos el código de seguimiento apenas salga</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          {order && (
            <Link href={`/pago/${order}`} className="text-sm text-blue-700 hover:underline">
              Ver detalle del pedido →
            </Link>
          )}
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
