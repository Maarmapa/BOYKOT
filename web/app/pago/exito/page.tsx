import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PagoExitoPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">¡Pago recibido!</h1>
        <p className="text-sm text-gray-600 mb-2">
          Tu pago fue confirmado.
        </p>
        {order && (
          <p className="text-xs text-gray-500 font-mono mb-6">Pedido {order}</p>
        )}
        <p className="text-sm text-gray-700 mb-8">
          Preparamos tu pedido y te avisamos por WhatsApp en 24-48h hábiles.
          Si tenés despacho, te mandamos el tracking apenas salga.
        </p>
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
