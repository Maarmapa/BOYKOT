import { requireAdmin } from '../layout';
import AdminChrome from '@/components/admin/Chrome';
import SyncTools from './SyncTools';

export const dynamic = 'force-dynamic';

export default async function SyncPage() {
  await requireAdmin();
  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-2">Sync & Maintenance</h1>
      <p className="text-sm text-gray-500 mb-6">
        Operaciones que sincronizan datos con BSale o regeneran maps locales.
      </p>
      <SyncTools />
    </AdminChrome>
  );
}
