'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { BRANDS } from '@/lib/colors/brands';

function brandImage(slug: string): string | undefined {
  return BRANDS[slug]?.heroImage;
}

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
        image: brandImage('copic-sketch') },
      { label: 'Copic Ciao', href: '/colores/copic-ciao', hint: '180 colores',
        image: brandImage('copic-ciao') ?? brandImage('copic-sketch') },
      { label: 'COPIC Ink', href: '/colores/copic-ink', hint: '358 colores',
        image: brandImage('copic-ink') },
      { label: 'POSCA', href: '/categoria/posca', hint: 'Acrílicos',
        image: brandImage('uni-posca-5m') },
      { label: 'Molotow', href: '/categoria/molotow-markers', hint: 'One4All',
        image: brandImage('molotow-premium') },
      { label: 'ZIG Kuretake', href: '/colores/zig-calligraphy', hint: 'Calligraphy',
        image: brandImage('zig-calligraphy') },
    ],
  },
  {
    label: 'Pintura',
    href: '/categoria/pintura',
    blurb: 'Cuero, acuarela, óleo, gouache, airbrush, aerosol.',
    featured: [
      { label: 'Angelus Cuero', href: '/colores/angelus-standard-1oz', hint: '88 colores',
        image: brandImage('angelus-standard-1oz') },
      { label: 'Holbein Acuarela', href: '/colores/holbein-acuarela-15ml', hint: '120 colores',
        image: brandImage('holbein-acuarela-15ml') },
      { label: 'Holbein Óleo', href: '/colores/holbein-oleo-20ml', hint: '120 colores',
        image: brandImage('holbein-oleo-20ml') },
      { label: 'Molotow Premium', href: '/colores/molotow-premium', hint: 'Aerosol 400ml',
        image: brandImage('molotow-premium') },
      { label: 'Createx Airbrush', href: '/colores/createx-airbrush-60ml', hint: '80 colores',
        image: brandImage('createx-airbrush-60ml') },
      { label: 'Gouache Holbein', href: '/colores/holbein-gouache-15ml', hint: '105 colores',
        image: brandImage('holbein-gouache-15ml') },
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

const OPEN_DELAY = 80;    // hover entra rápido
const CLOSE_DELAY = 220;  // hover sale con gracia → permite cruzar el gap

export default function MegaMenu() {
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [navigating, setNavigating] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimers = useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }, []);

  const scheduleOpen = useCallback((idx: number) => {
    cancelTimers();
    openTimer.current = setTimeout(() => setOpenIdx(idx), OPEN_DELAY);
  }, [cancelTimers]);

  const scheduleClose = useCallback(() => {
    cancelTimers();
    closeTimer.current = setTimeout(() => setOpenIdx(null), CLOSE_DELAY);
  }, [cancelTimers]);

  // Prefetch agresivo de las páginas del mega-panel cuando se abre,
  // así en conexión lenta ya están cacheadas al momento del click.
  useEffect(() => {
    if (openIdx === null) return;
    const entry = NAV[openIdx];
    if (!isCategory(entry)) return;
    router.prefetch(entry.href);
    entry.featured?.forEach(f => router.prefetch(f.href));
    entry.links?.forEach(l => router.prefetch(l.href));
  }, [openIdx, router]);

  // Cleanup timers al desmontar
  useEffect(() => cancelTimers, [cancelTimers]);

  // Esc cierra
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        cancelTimers();
        setOpenIdx(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancelTimers]);

  // Click outside (por si abrió por click, mantener cerrado)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        cancelTimers();
        setOpenIdx(null);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [cancelTimers]);

  // Click en link interno: feedback visual instantáneo + cierra el panel
  const onNavigate = useCallback((href: string) => {
    setNavigating(href);
    setOpenIdx(null);
    cancelTimers();
  }, [cancelTimers]);

  // Si cambia la ruta (loading terminó), limpio el "navigating"
  useEffect(() => {
    if (!navigating) return;
    const t = setTimeout(() => setNavigating(null), 4000);
    return () => clearTimeout(t);
  }, [navigating]);

  return (
    <div
      ref={containerRef}
      className="border-t border-gray-100 relative"
      onMouseLeave={scheduleClose}
    >
      <ul className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap gap-x-6 text-sm">
        {NAV.map((item, i) => {
          const hasMega = isCategory(item);
          if (!hasMega) {
            return (
              <li key={item.label} className="py-3" onMouseEnter={scheduleClose}>
                <Link
                  href={item.href}
                  prefetch
                  onClick={() => onNavigate(item.href)}
                  className="font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          const isOpen = openIdx === i;
          return (
            <li
              key={item.label}
              className="py-3"
              onMouseEnter={() => scheduleOpen(i)}
            >
              <button
                type="button"
                onClick={() => {
                  cancelTimers();
                  setOpenIdx(isOpen ? null : i);
                }}
                onFocus={() => scheduleOpen(i)}
                aria-expanded={isOpen}
                aria-haspopup="true"
                className={`font-medium inline-flex items-center gap-1 transition-colors ${
                  isOpen ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item.label}
                <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Bridge invisible: cubre el gap entre la nav y el panel para que el
          hover no se "rompa" cuando el cursor pasa por ese pixel. */}
      {openIdx !== null && (
        <div
          className="absolute left-0 right-0 top-full h-2 z-30"
          onMouseEnter={cancelTimers}
        />
      )}

      {/* Mega panel */}
      {openIdx !== null && isCategory(NAV[openIdx]) && (
        <div
          className="absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-xl z-40 animate-mega-in"
          onMouseEnter={cancelTimers}
          onMouseLeave={scheduleClose}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="text-xs font-semibold tracking-[0.18em] text-gray-500 uppercase mb-2">
                {(NAV[openIdx] as MegaCategory).label}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {(NAV[openIdx] as MegaCategory).blurb}
              </p>
              <Link
                href={NAV[openIdx].href}
                prefetch
                onClick={() => onNavigate(NAV[openIdx].href)}
                className="text-sm font-semibold text-gray-900 hover:underline underline-offset-4"
              >
                Ver categoría completa →
              </Link>
            </div>

            <div className="md:col-span-3">
              {(NAV[openIdx] as MegaCategory).featured && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {(NAV[openIdx] as MegaCategory).featured!.map(f => {
                    const isLoading = navigating === f.href;
                    return (
                      <Link
                        key={f.href}
                        href={f.href}
                        prefetch
                        onClick={() => onNavigate(f.href)}
                        onMouseEnter={() => router.prefetch(f.href)}
                        className={`group flex items-center gap-3 p-2 rounded-lg transition-all ${
                          isLoading
                            ? 'bg-gray-100 opacity-70'
                            : 'hover:bg-gray-50 hover:translate-x-0.5'
                        }`}
                        aria-busy={isLoading}
                      >
                        {f.image && (
                          <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-50 flex-shrink-0 relative">
                            <img
                              src={f.image}
                              alt={f.label}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {isLoading && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-black">
                            {f.label}
                          </div>
                          {f.hint && <div className="text-xs text-gray-500 truncate">{f.hint}</div>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {(NAV[openIdx] as MegaCategory).links && (
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-y-1 text-sm">
                  {(NAV[openIdx] as MegaCategory).links!.map(l => {
                    const isLoading = navigating === l.href;
                    return (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          prefetch
                          onClick={() => onNavigate(l.href)}
                          onMouseEnter={() => router.prefetch(l.href)}
                          className={`block py-1 transition-colors ${
                            isLoading
                              ? 'text-gray-400'
                              : 'text-gray-700 hover:text-gray-900 hover:translate-x-0.5'
                          }`}
                          aria-busy={isLoading}
                        >
                          {l.label}
                          {isLoading && <span className="ml-1.5 inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin align-[-2px]" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
