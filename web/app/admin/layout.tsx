// Layout PASS-THROUGH. El chrome de admin lo agrega cada page protegida con
// <AdminChrome> en components/admin/Chrome.tsx — así /admin/login no
// hereda el header con navlinks.
import { isAdmin } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
