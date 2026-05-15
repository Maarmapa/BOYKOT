import ColorCardGrid from '@/components/ColorCardGrid';
import { BRANDS } from '@/lib/colors/brands';

export const metadata = { title: 'Molotow Premium 400ml · Boykot' };

export default function MolotowPremiumPage() {
  const brand = BRANDS['molotow-premium'];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <nav className="text-sm text-gray-400 mb-2">
          Inicio / Tienda / Pintura / Sprays / Premium Molotow /{' '}
          <span className="text-gray-700">Molotow Premium 400ml</span>
        </nav>
        <header className="flex items-start justify-between mb-6 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{brand.productName}</h1>
            <div className="text-2xl font-semibold text-gray-800">
              ${brand.basePriceClp.toLocaleString('es-CL')}
            </div>
            <p className="text-xs text-gray-500 mt-2 max-w-md">
              Aerosol base nitro acrílica de alto rendimiento. 50 colores disponibles. Hecho
              en Alemania.
            </p>
          </div>
          <img
            src="https://www.boykot.cl/wp-content/uploads/2024/10/p00327000-ef9dadfd-968f-4c16-bd8d-ca991af72c30.jpg"
            alt="Molotow Premium 400ml"
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
