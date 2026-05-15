'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  {
    label: 'Marcadores',
    href: '/categoria/marcadores',
    children: [
      { label: 'Copic Sketch', href: '/colores/copic-sketch' },
      { label: 'Copic Ciao', href: '/colores/copic-ciao' },
      { label: 'Copic Ink', href: '/colores/copic-ink' },
      { label: 'POSCA', href: '/categoria/posca' },
      { label: 'Molotow', href: '/categoria/molotow-markers' },
      { label: 'ZIG Kuretake', href: '/colores/zig-calligraphy' },
    ],
  },
  {
    label: 'Pintura',
    href: '/categoria/pintura',
    children: [
      { label: 'Angelus Cuero', href: '/colores/angelus-standard-1oz' },
      { label: 'Holbein Acuarela', href: '/colores/holbein-acuarela-15ml' },
      { label: 'Holbein Óleo', href: '/colores/holbein-oleo-20ml' },
      { label: 'Molotow Premium', href: '/colores/molotow-premium' },
      { label: 'Createx Airbrush', href: '/colores/createx-airbrush-60ml' },
    ],
  },
  { label: 'Lápices', href: '/categoria/lapices' },
  { label: 'Materiales', href: '/categoria/materiales' },
  { label: 'Cartas de color', href: '/colores' },
  { label: 'Marcas', href: '/marcas' },
  { label: 'B2B / Mayoristas', href: '/b2b' },
  { label: 'Sobre Boykot', href: '/sobre-boykot' },
  { label: 'Contacto', href: '/contacto' },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function close() {
    setOpen(false);
    setExpanded(null);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Menú"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center w-9 h-9 text-gray-700 hover:text-gray-900 flex-shrink-0"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <aside className="absolute top-0 right-0 bottom-0 w-[88%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href="/" onClick={close} className="font-bold text-xl">Boykot</Link>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={close}
                className="w-9 h-9 inline-flex items-center justify-center text-gray-500 hover:text-gray-900"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              <ul>
                {NAV.map(n => {
                  const isOpen = expanded === n.label;
                  return (
                    <li key={n.label} className="border-b border-gray-50">
                      <div className="flex items-stretch">
                        <Link
                          href={n.href}
                          onClick={close}
                          className="flex-1 px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
                        >
                          {n.label}
                        </Link>
                        {n.children && (
                          <button
                            type="button"
                            aria-label={isOpen ? 'Cerrar submenú' : 'Abrir submenú'}
                            onClick={() => setExpanded(isOpen ? null : n.label)}
                            className="w-12 flex items-center justify-center text-gray-400 hover:text-gray-900 border-l border-gray-50"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {n.children && isOpen && (
                        <ul className="bg-gray-50">
                          {n.children.map(c => (
                            <li key={c.href}>
                              <Link
                                href={c.href}
                                onClick={close}
                                className="block px-8 py-2.5 text-sm text-gray-700 hover:bg-white hover:text-gray-900"
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-3 text-sm">
              <Link
                href="/login"
                onClick={close}
                className="block w-full text-center py-3 border border-gray-200 rounded-md font-semibold text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/carrito"
                onClick={close}
                className="block w-full text-center py-3 text-white font-semibold rounded-md"
                style={{ backgroundColor: '#0066ff' }}
              >
                Ver carrito
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
