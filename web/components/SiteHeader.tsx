import Link from 'next/link';

const NAV = [
  {
    label: 'Marcadores',
    href: '/categoria/marcadores',
    sub: [
      { label: 'Copic', href: '/colores/copic-sketch' },
      { label: 'Copic Ciao', href: '/colores/copic-ciao' },
      { label: 'COPIC Ink', href: '/colores/copic-ink' },
      { label: 'Molotow', href: '/categoria/molotow-markers' },
      { label: 'POSCA', href: '/categoria/posca' },
      { label: 'Zig Kuretake', href: '/categoria/zig' },
    ],
  },
  {
    label: 'Lápices',
    href: '/categoria/lapices',
    sub: [
      { label: 'Lápices de colores', href: '/categoria/lapices-de-colores' },
      { label: 'Blackliner', href: '/categoria/blackliner' },
      { label: 'Prismacolor', href: '/categoria/prismacolor' },
      { label: 'Grafito', href: '/categoria/grafito' },
    ],
  },
  {
    label: 'Pintura',
    href: '/categoria/pintura',
    sub: [
      { label: 'Cuero (Angelus)', href: '/colores/angelus-standard-1oz' },
      { label: 'Acuarela Holbein', href: '/colores/holbein-acuarela-15ml' },
      { label: 'Óleo Holbein', href: '/colores/holbein-oleo-20ml' },
      { label: 'Gouache Holbein', href: '/colores/holbein-gouache-15ml' },
      { label: 'Aerosoles', href: '/colores/molotow-premium' },
      { label: 'Createx Airbrush', href: '/colores/createx-airbrush-60ml' },
    ],
  },
  {
    label: 'Materiales',
    href: '/categoria/materiales',
    sub: [
      { label: 'Pinceles', href: '/categoria/pinceles' },
      { label: 'Bastidores', href: '/categoria/bastidores' },
      { label: 'Pigmentos', href: '/colores/solar-color-dust-10gr' },
      { label: 'Airbrush', href: '/categoria/airbrush' },
    ],
  },
  { label: 'Cartas de color', href: '/colores' },
];

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

        <Link href="/carrito" className="text-sm text-gray-700 hover:text-gray-900 inline-flex items-center gap-1">
          <span className="hidden sm:inline">Carrito</span>
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="border-t border-gray-100">
        <ul className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-x-6 text-sm">
          {NAV.map(item => (
            <li key={item.label} className="relative group py-3">
              <Link
                href={item.href}
                className="font-medium text-gray-700 hover:text-gray-900"
              >
                {item.label}
              </Link>
              {item.sub && (
                <ul className="absolute top-full left-0 mt-0 bg-white border border-gray-200 rounded-md shadow-md min-w-[220px] py-2 hidden group-hover:block z-40">
                  {item.sub.map(s => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="block px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
