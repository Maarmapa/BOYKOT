import Link from 'next/link';
import CartBadge from './CartBadge';
import AccountBadge from './AccountBadge';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
      {/* Top promo bar */}
      <div className="bg-gray-900 text-white text-center text-[11px] sm:text-xs py-2 px-4">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      {/* Main bar — responsive */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 lg:gap-6">
        <Link
          href="/"
          className="font-bold text-xl sm:text-2xl tracking-tight text-gray-900 whitespace-nowrap"
        >
          Boykot
        </Link>

        {/* Search: oculto en mobile chico, visible desde sm+ */}
        <div className="hidden sm:flex flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Account: solo desde lg+ */}
        <div className="hidden lg:flex items-center">
          <AccountBadge />
        </div>

        <CartBadge />

        {/* Hamburger: visible hasta lg- (incluyendo tablet) */}
        <MobileMenu />
      </div>

      {/* Search en mobile (debajo del header bar) */}
      <div className="sm:hidden px-3 pb-3">
        <SearchBar />
      </div>

      {/* Mega-menu: solo desde lg+ donde hay espacio para 6 items + dropdowns */}
      <div className="hidden lg:block">
        <MegaMenu />
      </div>
    </header>
  );
}
