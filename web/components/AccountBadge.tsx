import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';

// Server component — reads the Supabase user from cookies. Shows "Iniciar sesión"
// or "Mi cuenta" depending on auth state.
export default async function AccountBadge() {
  let userEmail: string | null = null;
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    userEmail = data.user?.email ?? null;
  } catch {
    // env missing in dev — render guest state
  }

  if (!userEmail) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-gray-700 hover:text-gray-900 whitespace-nowrap"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <Link
      href="/perfil"
      className="text-sm font-medium text-gray-900 hover:underline underline-offset-4 whitespace-nowrap"
      title={userEmail}
    >
      Mi cuenta
    </Link>
  );
}
