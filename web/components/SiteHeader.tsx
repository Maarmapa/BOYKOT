import Link from 'next/link';
import CartBadge from './CartBadge';
import AccountBadge from './AccountBadge';
import MegaMenu from './MegaMenu';

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
      {/* Top promo bar */}
      <div className="bg-gray-900 text-white text-center text-xs py-2 px-4">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      {/* Main bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-6">
        <Link href="/" className="font-bold text-2xl tracking-tight text-gray-900">
          Boykot
        </Link>

        <div className="flex-1 max-w-md">
          <label htmlFor="site-search" className="sr-only">Buscar productos</label>
          <input
            id="site-search"
            name="q"
            type="search"
            autoComplete="off"
            placeholder="Buscar productos..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <AccountBadge />
        <CartBadge />
      </div>

      <MegaMenu />
    </header>
  );
}
