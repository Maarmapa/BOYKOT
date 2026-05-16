import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import AdminBuscarClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminBuscarPage() {
  await requireAdmin();
  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-1">Buscar productos · DM helper</h1>
      <p className="text-sm text-gray-500 mb-6">
        Para responder rápido en Instagram/WhatsApp. Tipea SKU o nombre →
        ves stock real-time + 1 click copia el link al portapapeles.
      </p>
      <AdminBuscarClient />
    </AdminChrome>
  );
}
