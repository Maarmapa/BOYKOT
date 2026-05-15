import Link from 'next/link';

export const metadata = { title: 'B2B Mayoristas · Boykot' };

const PERKS = [
  {
    title: 'Lista de precios mayorista',
    detail:
      'Acceso automático a la lista de precios B2B asignada a tu RUT. Stock real-time desde BSale.',
  },
  {
    title: 'Factura electrónica automática',
    detail: 'Generada al confirmar el pedido y enviada a tu email.',
  },
  {
    title: 'Sin pedido mínimo',
    detail: 'Compra desde 1 unidad. Despacho a todo Chile.',
  },
  {
    title: 'Historial de pedidos',
    detail: 'Tus pedidos anteriores siempre disponibles para repetir compras.',
  },
];

export default function B2BPage() {
  return (
    <main className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-gray-700">Inicio</Link> /{' '}
          <span className="text-gray-700">B2B Mayoristas</span>
        </nav>

        <header className="mb-10">
          <div className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-2">
            Boykot Mayorista
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Portal B2B para distribuidores y tiendas
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Distribuidores oficiales de Copic, Angelus, Holbein, Molotow y más en Chile.
            Si tu negocio es una tienda, escuela, taller o distribuidor, accedé a precios mayorista
            con factura electrónica automática.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {PERKS.map(p => (
            <div key={p.title} className="border border-gray-100 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </section>

        <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Solicitar acceso B2B
          </h2>
          <p className="text-sm text-gray-600 mb-4 max-w-xl">
            Completá el formulario y te enviamos tus credenciales en menos de 24 horas hábiles.
            Necesitamos: RUT de tu empresa, giro/iniciación de actividades, dirección de despacho.
          </p>
          <form
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            onSubmit={e => {
              e.preventDefault();
              alert('El portal B2B está en construcción. Mientras tanto, escribinos a providencia@boykot.cl con el asunto B2B y tus datos.');
            }}
          >
            <input type="text" name="company" placeholder="Razón social" required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
            <input type="text" name="rut" placeholder="RUT empresa" required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
            <input type="text" name="giro" placeholder="Giro / actividad económica"
              className="sm:col-span-2 border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
            <input type="email" name="email" placeholder="Email" required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
            <input type="tel" name="phone" placeholder="Teléfono" required
              className="border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400" />
            <textarea name="notes" placeholder="Volumen estimado / qué productos te interesan"
              className="sm:col-span-2 border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-400 min-h-[90px]" />
            <button type="submit"
              className="sm:col-span-2 mt-2 text-white py-2.5 rounded-md font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0066ff' }}>
              Solicitar acceso
            </button>
          </form>
        </section>

        <p className="text-xs text-gray-400 mt-8">
          Ya somos partners de DibuChile SpA, DRISTORE Import, municipalidades, colegios y talleres
          en Chile. El portal técnico (login + dashboard + factura automática) está en construcción.
        </p>
      </div>
    </main>
  );
}
