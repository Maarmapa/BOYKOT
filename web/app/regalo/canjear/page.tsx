import Link from 'next/link';
import RedeemForm from './form';

export const metadata = {
  title: 'Canjear gift card · Boykot',
  description: 'Canjea tu código GC-XXXX-XXXX-XXXX por saldo Boykot Credits.',
};

export default function CanjearPage() {
  return (
    <main className="bg-white min-h-screen">
      <section className="bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <nav className="text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-white">Inicio</Link> /{' '}
            <Link href="/regalo" className="hover:text-white">Gift Card</Link> /{' '}
            <span className="text-gray-300">Canjear</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl mb-3 leading-tight">Canjear gift card</h1>
          <p className="text-base text-gray-400">
            Pegá el código GC-XXXX-XXXX-XXXX que recibiste. El saldo se agrega a tu wallet Boykot Credits.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <RedeemForm />
      </section>
    </main>
  );
}
