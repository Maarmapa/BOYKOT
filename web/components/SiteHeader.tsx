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
      <div className="bg-gray-900 text-white text-center text-xs py-2 px-4">
        Envío gratis en compras sobre $50.000 · Despacho a todo Chile
      </div>

      {/* Main bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4 sm:gap-6">
        <Link href="/" className="font-bold text-2xl tracking-tight text-gray-900">
          Boykot
        </Link>

        <SearchBar />

        <div className="hidden md:flex items-center gap-6">
          <AccountBadge />
        </div>
        <CartBadge />
        <MobileMenu />
      </div>

      <div className="hidden md:block">
        <MegaMenu />
      </div>
    </header>
  );
}
