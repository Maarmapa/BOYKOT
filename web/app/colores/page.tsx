import SketchPicker from '@/components/SketchPicker';
import data from '../../public/copic-colors.json';

export const metadata = { title: 'Copic Sketch · Boykot' };

export default function ColoresPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-12 py-8">
        <div className="mb-2 text-sm text-gray-400">
          Inicio / Tienda / Marcadores / Copic / Individual / <span className="text-gray-700">Copic Sketch</span>
        </div>
        <div className="flex items-start justify-between mb-6 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Copic Sketch</h1>
            <div className="text-2xl font-semibold text-gray-800">$4.300</div>
          </div>
          <img
            src="https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg"
            alt="Copic Sketch"
            className="w-24 h-24 object-cover rounded-lg border border-gray-100"
          />
        </div>
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">
          Selecciona color y cantidad para completar la compra
        </h2>
        <SketchPicker colors={data.colors as any} />
      </div>
    </main>
  );
}