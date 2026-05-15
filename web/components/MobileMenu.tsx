'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV = [
  { label: 'Marcadores', href: '/categoria/marcadores' },
  { label: 'Pintura', href: '/categoria/pintura' },
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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Menú"
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-9 h-9 text-gray-700 hover:text-gray-900"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href="/" onClick={() => setOpen(false)} className="font-bold text-xl">Boykot</Link>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
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
                {NAV.map(n => (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 border-b border-gray-50"
                    >
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-3 text-sm">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-3 border border-gray-200 rounded-md font-semibold text-gray-900"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/carrito"
                onClick={() => setOpen(false)}
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
