// Skeleton para todas las /admin pages (dashboard, brands, orders, sync).
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-96 bg-gray-100 rounded mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-gray-100 flex items-center gap-4">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-4 w-48 bg-gray-100 rounded" />
              <div className="h-4 w-24 bg-gray-100 rounded ml-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
