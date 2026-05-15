import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser/Server anon client — gated by RLS. Reads user-scoped rows.
let _anon: SupabaseClient | null = null;
export function supabaseAnon(): SupabaseClient {
  if (_anon) return _anon;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY missing');
  _anon = createClient(url, key, { auth: { persistSession: false } });
  return _anon;
}

// Server-only client — bypasses RLS. Use ONLY in route handlers, server actions, crons.
// Never import this into a client component.
let _admin: SupabaseClient | null = null;
export function supabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing');
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}
