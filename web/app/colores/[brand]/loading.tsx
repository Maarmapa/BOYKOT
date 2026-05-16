// Skeleton mientras la brand page busca stock en BSale (puede tardar
// ~200-500ms con snapshot warm, ~3-7s en cold start).
export default function BrandLoading() {
  return (
    <main className="min-h-screen bg-white animate-pulse">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* Breadcrumb */}
        <div className="h-3 w-48 bg-gray-100 rounded mb-6" />

        {/* Hero: foto izquierda + meta derecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="aspect-square bg-gray-100 rounded-lg" />
          <div className="space-y-3 py-4">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-10 w-3/4 bg-gray-200 rounded" />
            <div className="h-6 w-1/3 bg-gray-100 rounded mt-4" />
            <div className="h-4 w-full bg-gray-100 rounded mt-6" />
            <div className="h-4 w-5/6 bg-gray-100 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Color grid skeleton — 4 columnas en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mb-8">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex items-center py-1.5">
              <div className="flex-1 h-7 bg-gray-100" />
            </div>
          ))}
        </div>

        {/* CTA skeleton */}
        <div className="h-14 w-full bg-gray-200 rounded-md" />
      </div>
    </main>
  );
}
