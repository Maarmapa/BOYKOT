'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface MegaItem {
  label: string;
  href: string;
  image?: string;
  hint?: string;
}

interface MegaCategory {
  label: string;
  href: string;
  blurb?: string;
  featured?: MegaItem[];
  links?: Array<{ label: string; href: string }>;
}

interface NavLink {
  label: string;
  href: string;
}

type NavEntry = MegaCategory | NavLink;

const NAV: NavEntry[] = [
  {
    label: 'Marcadores',
    href: '/categoria/marcadores',
    blurb: 'Copic, Molotow, POSCA, ZIG. 700+ marcadores con stock real.',
    featured: [
      { label: 'Copic Sketch', href: '/colores/copic-sketch', hint: '358 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2021/07/74a327b3-97a6-4726-b1bb-012cde0ceb85-sketchpost.jpeg' },
      { label: 'Copic Ciao', href: '/colores/copic-ciao', hint: '180 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2021/07/ciao-product.jpg' },
      { label: 'COPIC Ink', href: '/colores/copic-ink', hint: '358 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2021/07/various-ink-product.jpg' },
      { label: 'POSCA', href: '/categoria/posca', hint: 'Acrílicos',
        image: 'https://www.boykot.cl/wp-content/uploads/2021/05/logoheader-2021.png' },
      { label: 'Molotow', href: '/categoria/molotow-markers', hint: 'One4All',
        image: 'https://www.boykot.cl/wp-content/uploads/2024/10/p00327000-ef9dadfd-968f-4c16-bd8d-ca991af72c30.jpg' },
      { label: 'ZIG Kuretake', href: '/colores/zig-calligraphy', hint: 'Calligraphy',
        image: 'https://www.boykot.cl/wp-content/uploads/2021/05/logoheader-2021.png' },
    ],
  },
  {
    label: 'Pintura',
    href: '/categoria/pintura',
    blurb: 'Cuero, acuarela, óleo, gouache, airbrush, aerosol.',
    featured: [
      { label: 'Angelus Cuero', href: '/colores/angelus-standard-1oz', hint: '88 colores',
        image: 'https://www.boykot.cl/wp-content/themes/boykot/images/angelus/standard/color/001.jpg' },
      { label: 'Holbein Acuarela', href: '/colores/holbein-acuarela-15ml', hint: '120 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2025/07/170908red_tex_new_fx-ec0ab6c9-e1dc-4f63-af58-b2e177b4ece3-4.jpg' },
      { label: 'Holbein Óleo', href: '/colores/holbein-oleo-20ml', hint: '120 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2025/07/170908red_tex_new_fx-ec0ab6c9-e1dc-4f63-af58-b2e177b4ece3-4.jpg' },
      { label: 'Molotow Premium', href: '/colores/molotow-premium', hint: 'Aerosol 400ml',
        image: 'https://www.boykot.cl/wp-content/uploads/2024/10/p00327000-ef9dadfd-968f-4c16-bd8d-ca991af72c30.jpg' },
      { label: 'Createx Airbrush', href: '/colores/createx-airbrush-60ml', hint: '80 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2024/09/airbrush_demo_01_60-22e7c419-0ea1-4d54-9b07-01fc7470781b.jpg' },
      { label: 'Gouache Holbein', href: '/colores/holbein-gouache-15ml', hint: '105 colores',
        image: 'https://www.boykot.cl/wp-content/uploads/2025/07/170908red_tex_new_fx-ec0ab6c9-e1dc-4f63-af58-b2e177b4ece3-4.jpg' },
    ],
  },
  {
    label: 'Lápices',
    href: '/categoria/lapices',
    blurb: 'Colores, grafito, blackliners y técnicos.',
    links: [
      { label: 'Lápices de colores', href: '/categoria/lapices-de-colores' },
      { label: 'Prismacolor', href: '/categoria/prismacolor' },
      { label: 'Blackliner', href: '/categoria/blackliner' },
      { label: 'Grafito', href: '/categoria/grafito' },
    ],
  },
  {
    label: 'Materiales',
    href: '/categoria/materiales',
    blurb: 'Soportes, herramientas, accesorios.',
    links: [
      { label: 'Pinceles', href: '/categoria/pinceles' },
      { label: 'Bastidores', href: '/categoria/bastidores' },
      { label: 'Pigmentos', href: '/colores/solar-color-dust-10gr' },
      { label: 'Airbrush equipos', href: '/categoria/airbrush' },
    ],
  },
  { label: 'Cartas de color', href: '/colores' },
  { label: 'Marcas', href: '/marcas' },
];

function isCategory(item: NavEntry): item is MegaCategory {
  return (item as MegaCategory).featured !== undefined || (item as MegaCategory).links !== undefined;
}

export default function MegaMenu() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cerrar cuando clickeás fuera del menu
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenIdx(null);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIdx(null);
    }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="border-t border-gray-100 relative">
      <ul className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-x-6 text-sm">
        {NAV.map((item, i) => {
          const hasMega = isCategory(item);
          if (!hasMega) {
            return (
              <li key={item.label} className="py-3">
                <Link
                  href={item.href}
                  className="font-medium text-gray-700 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          const isOpen = openIdx === i;
          return (
            <li key={item.label} className="py-3">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={`font-medium inline-flex items-center gap-1 ${
                  isOpen ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item.label}
                <span className={`text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Mega panel */}
      {openIdx !== null && isCategory(NAV[openIdx]) && (
        <div className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Left intro */}
            <div className="md:col-span-1">
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                {(NAV[openIdx] as MegaCategory).label}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {(NAV[openIdx] as MegaCategory).blurb}
              </p>
              <Link
                href={NAV[openIdx].href}
                className="text-sm font-semibold text-gray-900 hover:underline underline-offset-4"
                onClick={() => setOpenIdx(null)}
              >
                Ver categoría completa →
              </Link>
            </div>

            {/* Right grid */}
            <div className="md:col-span-3">
              {(NAV[openIdx] as MegaCategory).featured && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {(NAV[openIdx] as MegaCategory).featured!.map(f => (
                    <Link
                      key={f.href}
                      href={f.href}
                      onClick={() => setOpenIdx(null)}
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      {f.image && (
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                          <img src={f.image} alt={f.label} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">{f.label}</div>
                        {f.hint && <div className="text-xs text-gray-500 truncate">{f.hint}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {(NAV[openIdx] as MegaCategory).links && (
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-y-1 text-sm">
                  {(NAV[openIdx] as MegaCategory).links!.map(l => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        onClick={() => setOpenIdx(null)}
                        className="block py-1 text-gray-700 hover:text-gray-900"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
