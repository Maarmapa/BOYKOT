import Link from 'next/link';
import CartBadge from './CartBadge';
import AccountBadge from './AccountBadge';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';

// Layout copia exacta de copic.jp/en/:
// - Barra blanca 60px arriba (logo + utilidades + search)
// - Barra oscura 38px abajo (nav items con mega-dropdown blanco)
// - Mobile: solo barra blanca + hamburger (la oscura se oculta)

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top promo bar (mantengo el de Boykot, copic no lo tiene) */}
      <div className="bg-gray-900 text-white text-center text-[11px] sm:text-xs py-1.5 px-4">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      {/* Barra 1 — BLANCA, 60px exactos. Logo + search + utilidades */}
      <div className="h-[60px] border-b border-gray-100 bg-white">
        <div className="max-w-[1600px] h-full mx-auto px-3 sm:px-6 flex items-center gap-2 sm:gap-4 lg:gap-6">
          <Link
            href="/"
            className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900 whitespace-nowrap"
          >
            Boykot
          </Link>

          {/* Search: oculto en mobile chico */}
          <div className="hidden sm:flex flex-1 min-w-0 max-w-md">
            <SearchBar />
          </div>

          {/* Account: solo desde lg+ */}
          <div className="hidden lg:flex items-center ml-auto">
            <AccountBadge />
          </div>

          <CartBadge />

          {/* Hamburger: visible hasta lg- */}
          <MobileMenu />
        </div>
      </div>

      {/* Barra 2 — OSCURA, 38px. Solo desktop (lg+). Contiene mega-menu */}
      <div className="hidden lg:block">
        <MegaMenu />
      </div>

      {/* Search en mobile (debajo del header) */}
      <div className="sm:hidden px-3 py-2 border-t border-gray-100">
        <SearchBar />
      </div>
    </header>
  );
}
