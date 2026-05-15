import ColorCardGrid from '@/components/ColorCardGrid';
import { BRANDS } from '@/lib/colors/brands';
import { getSketchStock } from '@/lib/sketch-stock';

export const metadata = { title: 'Copic Sketch · Boykot' };

export default async function CopicSketchPage() {
  const brand = BRANDS['copic-sketch'];
  const stockMap = await getSketchStock();
  // Empty object means the boykot-api endpoint is unavailable (currently the case);
  // pass undefined so the grid renders without per-card stock badges instead of marking
  // every color as agotado.
  const stock = Object.keys(stockMap).length > 0 ? stockMap : undefined;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <nav className="text-sm text-gray-400 mb-2">
          Inicio / Tienda / Marcadores / Copic / Individual /{' '}
          <span className="text-gray-700">Copic Sketch</span>
        </nav>
        <header className="flex items-start justify-between mb-6 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{brand.productName}</h1>
            <div className="text-2xl font-semibold text-gray-800">
              ${brand.basePriceClp.toLocaleString('es-CL')}
            </div>
          </div>
          <img
            src="https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg"
            alt="Copic Sketch"
            className="w-24 h-24 object-cover rounded-lg border border-gray-100"
          />
        </header>
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">
          Selecciona color y cantidad para completar la compra
        </h2>
        <ColorCardGrid brand={brand} stockMap={stock} />
      </div>
    </main>
  );
}
