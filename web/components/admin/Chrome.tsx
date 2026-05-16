import Link from 'next/link';

export default function AdminChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-bold text-lg tracking-tight">
              Boykot <span className="text-gray-400">/ Admin</span>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/admin/buscar" className="text-gray-600 hover:text-gray-900 font-semibold">Buscar (DM)</Link>
              <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900">Pedidos</Link>
              <Link href="/admin/cotizaciones" className="text-gray-600 hover:text-gray-900">Cotizaciones</Link>
              <Link href="/admin/customers" className="text-gray-600 hover:text-gray-900">Clientes</Link>
              <Link href="/admin/bot" className="text-gray-600 hover:text-gray-900">Hermes</Link>
              <Link href="/admin/analytics" className="text-gray-600 hover:text-gray-900">Analytics</Link>
              <Link href="/admin/credits" className="text-gray-600 hover:text-gray-900">Credits</Link>
              <Link href="/admin/reviews" className="text-gray-600 hover:text-gray-900">Reviews</Link>
              <Link href="/admin/promociones" className="text-gray-600 hover:text-gray-900">Promo</Link>
              <Link href="/admin/brands" className="text-gray-600 hover:text-gray-900">Brands</Link>
              <Link href="/admin/sync" className="text-gray-600 hover:text-gray-900 text-xs">Sync</Link>
              <Link href="/admin/audit" className="text-gray-600 hover:text-gray-900 text-xs">Audit</Link>
            </nav>
          </div>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="text-xs text-gray-500 hover:text-gray-900">Salir</button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
