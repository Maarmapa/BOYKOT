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
            <nav className="flex gap-6 text-sm">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
              <Link href="/admin/brands" className="text-gray-600 hover:text-gray-900">Brands & Stock</Link>
              <Link href="/admin/sync" className="text-gray-600 hover:text-gray-900">Sync</Link>
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
