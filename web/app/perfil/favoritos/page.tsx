import Link from 'next/link';
import type { Metadata } from 'next';
import FavoritosClient from './client';

export const metadata: Metadata = {
  title: 'Favoritos · Boykot',
  description: 'Productos guardados en tu lista de favoritos.',
};

export const dynamic = 'force-dynamic';

export default function FavoritosPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Dark hero */}
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav className="text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <Link href="/perfil" className="hover:text-white">Perfil</Link> /{' '}
            <span className="text-gray-300">Favoritos</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-2 leading-tight">Tus favoritos</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Productos que guardaste con el corazón. Se mantienen aunque cierres la sesión.
          </p>
        </div>
      </section>

      <FavoritosClient />
    </main>
  );
}
