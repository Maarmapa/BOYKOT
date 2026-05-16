import Link from 'next/link';
import type { Metadata } from 'next';
import GiftCardForm from './form';

export const metadata: Metadata = {
  title: 'Gift Cards · Boykot — Regalá saldo para arte',
  description:
    'Compras una gift card Boykot, la regalás a un artista, ilustrador o grafitero. Se canjea por saldo en su wallet Boykot Credits. Validez 1 año.',
};

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000];

export default function GiftCardPage() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <nav className="text-xs text-white/80 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <span className="text-white">Gift Card</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight font-bold">
            🎁 Regalá Boykot
          </h1>
          <p className="text-lg sm:text-xl text-white/95 max-w-2xl leading-relaxed">
            Una gift card con saldo en CLP que el otro canjea por lo que quiera.
            Sin equivocarse de color. Sin tirar a la basura. Sin envío que no llega.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <GiftCardForm presetAmounts={PRESET_AMOUNTS} />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Step n="1" title="Comprás" desc="Elegís monto + a quién regalárselo. Pagás como cualquier pedido." />
            <Step n="2" title="Te llega el código" desc="GC-XXXX-XXXX-XXXX por email. Se lo mandás al destinatario por WhatsApp/IG." />
            <Step n="3" title="Lo canjea" desc="El otro entra a /regalo/canjear, pone el código → saldo en su wallet Boykot Credits para usar en lo que quiera." />
          </div>
          <div className="mt-8 text-sm text-gray-600 leading-relaxed">
            <strong>Validez</strong>: 1 año desde la compra. <strong>No reembolsable</strong> en efectivo.
            Se aplica como Boykot Credits — el destinatario puede usarlo en cualquier compra.
          </div>
        </div>
      </section>

      {/* Canjear CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-center">
          <h2 className="text-xl sm:text-2xl mb-3">¿Recibiste una gift card?</h2>
          <Link
            href="/regalo/canjear"
            className="inline-block bg-amber-400 hover:bg-amber-300 text-gray-900 px-7 py-3 rounded-md font-semibold text-sm uppercase tracking-wider"
          >
            Canjear código →
          </Link>
        </div>
      </section>
    </main>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-rose-500 mb-2">{n}</div>
      <div className="font-bold text-gray-900 mb-1">{title}</div>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
