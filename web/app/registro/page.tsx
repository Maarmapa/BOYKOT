'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rut, setRut] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/perfil`,
        data: { nombre, rut },
      },
    });
    setLoading(false);
    if (error) {
      setMsg({ kind: 'err', text: error.message });
      return;
    }
    if (data.user && !data.session) {
      setMsg({ kind: 'ok', text: 'Revisá tu mail para confirmar la cuenta.' });
      return;
    }
    router.push('/perfil');
    router.refresh();
  }

  return (
    <main className="bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl text-gray-900 mb-2">Crear cuenta</h1>
        <p className="text-gray-600 mb-8">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-gray-900 underline underline-offset-4 hover:no-underline">
            Iniciá sesión
          </Link>
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              required
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1">
              RUT <span className="text-gray-400 font-normal">(opcional, para boleta/factura)</span>
            </label>
            <input
              id="rut"
              name="rut"
              type="text"
              placeholder="12.345.678-9"
              value={rut}
              onChange={e => setRut(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres.</p>
          </div>

          {msg && (
            <div
              className={`text-sm rounded-md px-3 py-2 ${msg.kind === 'err' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}
            >
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white font-semibold rounded-md hover:opacity-90 transition-opacity text-sm uppercase tracking-wider disabled:opacity-50"
            style={{ backgroundColor: '#0066ff' }}
          >
            {loading ? 'Creando…' : 'Crear cuenta'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al registrarte aceptás los{' '}
            <Link href="/como-comprar" className="underline underline-offset-2">
              términos y políticas
            </Link>
            .
          </p>
        </form>
      </div>
    </main>
  );
}
