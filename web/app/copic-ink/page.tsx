import ColorCardGrid from '@/components/ColorCardGrid';
import { BRANDS } from '@/lib/colors/brands';

export const metadata = { title: 'COPIC Ink · Boykot' };

export default function CopicInkPage() {
  const brand = BRANDS['copic-ink'];
  // TODO(stock): /api/sketch-stock is missing in boykot-api today; once a
  // /api/stock/product/2978 (or equivalent) endpoint exists, wire it here.

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <nav className="text-sm text-gray-400 mb-2">
          Inicio / Tienda / Marcadores / Copic / Tinta /{' '}
          <span className="text-gray-700">COPIC Ink</span>
        </nav>
        <header className="flex items-start justify-between mb-6 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{brand.productName}</h1>
            <div className="text-2xl font-semibold text-gray-800">
              ${brand.basePriceClp.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-gray-500 mt-2 max-w-md">
              Refill de alcohol concentrado, compatible con todos los marcadores Copic. Mismos
              358 códigos que Copic Sketch.
            </p>
          </div>
          <img
            src="https://www.boykot.cl/wp-content/uploads/2024/12/copic_ink_1-2a9a6ef5-c971-45a8-992d-94ce10085a43.jpg"
            alt="COPIC Ink"
            className="w-24 h-24 object-cover rounded-lg border border-gray-100"
          />
        </header>
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">
          Selecciona color y cantidad para completar la compra
        </h2>
        <ColorCardGrid brand={brand} />
      </div>
    </main>
  );
}
