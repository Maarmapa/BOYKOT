import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PagoErrorPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <main className="min-h-[60vh] bg-white">
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">El pago no se completó</h1>
        <p className="text-sm text-gray-600 mb-6">
          No te preocupes — tu pedido sigue guardado. Podés reintentar el pago
          o escribirnos por WhatsApp para coordinar transferencia.
        </p>
        <div className="flex flex-col gap-3">
          {order && (
            <Link
              href={`/pago/${order}`}
              className="block w-full text-white py-3 rounded-md font-semibold hover:opacity-90"
              style={{ backgroundColor: '#0066ff' }}
            >
              Reintentar pago
            </Link>
          )}
          <a
            href="https://wa.me/56223350961"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-white py-3 rounded-md font-semibold hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            Escribir por WhatsApp
          </a>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 mt-2">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
