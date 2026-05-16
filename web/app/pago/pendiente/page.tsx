import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PagoPendientePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Pago en revisión</h1>
        <p className="text-sm text-gray-600 mb-6">
          Tu pago está siendo procesado (común en transferencias y Khipu).
          Te avisamos por WhatsApp + email cuando se confirme — suele tardar
          minutos, máximo unas horas.
        </p>
        {order && (
          <Link href={`/pago/${order}`} className="text-sm text-blue-700 hover:underline">
            Ver detalle del pedido →
          </Link>
        )}
        <div className="mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
