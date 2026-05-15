'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/perfil';
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null);

  async function onPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMsg({ kind: 'err', text: error.message });
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (error) {
      setMsg({ kind: 'err', text: error.message });
      return;
    }
    setMsg({ kind: 'ok', text: 'Revisá tu mail. Te enviamos un link para entrar.' });
  }

  return (
    <main className="bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl text-gray-900 mb-2">Iniciá sesión</h1>
        <p className="text-gray-600 mb-8">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-gray-900 underline underline-offset-4 hover:no-underline">
            Crear una
          </Link>
        </p>

        <div className="flex gap-1 mb-6 text-xs font-semibold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={`px-3 py-1.5 rounded-md ${mode === 'password' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Email + Contraseña
          </button>
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={`px-3 py-1.5 rounded-md ${mode === 'magic' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={mode === 'password' ? onPassword : onMagic} className="space-y-4">
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

          {mode === 'password' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>
          )}

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
            {loading ? 'Procesando…' : mode === 'password' ? 'Entrar' : 'Enviar link'}
          </button>
        </form>
      </div>
    </main>
  );
}
