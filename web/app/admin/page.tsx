import { requireAdmin } from './layout';
import { BRANDS } from '@/lib/colors/brands';
import bsaleVariants from '@/data/bsale-variants-all.json';
import Link from 'next/link';
import AdminChrome from '@/components/admin/Chrome';
import { listPendingOrders } from '@/lib/pending-orders';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  // Cargar metrics en paralelo
  const sb = supabaseAdmin();
  const [
    orders,
    paidOrdersResult,
    quotesResult,
    creditsResult,
    reviewsPendingResult,
    wishlistsResult,
    backInStockResult,
    botConvsResult,
    lowStockResult,
  ] = await Promise.all([
    listPendingOrders(100),
    sb.from('pending_orders').select('total_clp').eq('payment_status', 'paid'),
    sb.from('quotes').select('id', { count: 'exact', head: true }),
    sb.from('boykot_credits_accounts').select('balance_clp'),
    sb.from('product_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('wishlists').select('id', { count: 'exact', head: true }),
    sb.from('back_in_stock_alerts').select('id', { count: 'exact', head: true }).eq('notified', false),
    sb.from('bot_conversations').select('id', { count: 'exact', head: true }),
    sb.from('bsale_stock_snapshot').select('variant_id, stock').lte('stock', 3).gte('stock', 0),
  ]);

  const variantsByBrand = (bsaleVariants as { by_brand: Record<string, Record<string, number>> }).by_brand;
  const brandSlugs = Object.keys(BRANDS);
  const totalBrands = brandSlugs.length;
  const totalVariantsMapped = Object.values(variantsByBrand).reduce((s, m) => s + Object.keys(m).length, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const paidOrders = (paidOrdersResult.data ?? []) as { total_clp: number }[];
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total_clp || 0), 0);
  const credits = (creditsResult.data ?? []) as { balance_clp: number }[];
  const totalCreditsBalance = credits.reduce((s, c) => s + c.balance_clp, 0);
  const lowStock = (lowStockResult.data ?? []) as { variant_id: number; stock: number }[];

  return (
    <AdminChrome>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-8">
        Panel de control Boykot. Datos en tiempo real BSale + Supabase.
      </p>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        <Stat label="Pedidos pendientes" value={pendingOrdersCount} note={`${orders.length} totales`} highlight={pendingOrdersCount > 0} href="/admin/orders" />
        <Stat label="Revenue (pagado)" value={`$${(totalRevenue / 1000).toFixed(0)}K`} note="Histórico CLP" />
        <Stat label="Cotizaciones" value={quotesResult.count ?? 0} note="Total emitidas" href="/admin/cotizaciones" />
        <Stat label="Reviews pendientes" value={reviewsPendingResult.count ?? 0} note="Sin moderar" highlight={(reviewsPendingResult.count ?? 0) > 0} href="/admin/reviews" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        <Stat label="Wishlists activas" value={wishlistsResult.count ?? 0} note="Productos guardados" />
        <Stat label="Back-in-stock" value={backInStockResult.count ?? 0} note="Notificaciones pendientes" highlight={(backInStockResult.count ?? 0) > 0} />
        <Stat label="Saldo Credits" value={`$${totalCreditsBalance.toLocaleString('es-CL')}`} note="Total en wallets" href="/admin/credits" />
        <Stat label="Bot conversations" value={botConvsResult.count ?? 0} note="IG + WhatsApp" href="/admin/bot" />
      </div>

      {/* Stock alerts */}
      {lowStock.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
          <h2 className="font-bold text-amber-900 mb-2">⚠ {lowStock.length} variantes con stock bajo</h2>
          <p className="text-xs text-amber-800 mb-3">
            Variantes con 0-3 unidades disponibles en BSale. Considerá reponer o marcar como agotadas.
          </p>
          <div className="flex flex-wrap gap-1 text-xs">
            {lowStock.slice(0, 30).map(s => (
              <span key={s.variant_id} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono">
                vid:{s.variant_id} ({s.stock})
              </span>
            ))}
            {lowStock.length > 30 && (
              <span className="text-amber-700 text-xs">... +{lowStock.length - 30} más</span>
            )}
          </div>
        </section>
      )}

      {/* Acciones rápidas */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-1">Acciones rápidas</h2>
        <p className="text-sm text-gray-500 mb-4">Operaciones comunes del día a día.</p>
        <div className="flex flex-wrap gap-2">
          <Action href="/admin/buscar" label="🔍 Buscar producto (DM helper)" />
          <Action href="/admin/orders" label="📦 Ver pedidos" />
          <Action href="/admin/bot" label="🤖 Hermes inbox" />
          <Action href="/admin/credits" label="💰 Credits" />
          <Action href="/admin/cotizaciones" label="📋 Cotizaciones" />
          <Action href="/admin/reviews" label="⭐ Reseñas" />
          <Action href="/admin/promociones" label="🎟 Promo codes" />
          <Action href="/admin/brands" label="🎨 Brands & stock" />
          <Action href="/api/health" external label="🩺 Health" />
          <Action href="/api/hermes/status" external label="🤖 Hermes status" />
        </div>
      </section>

      {/* Catálogo stats */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-1">Catálogo</h2>
        <p className="text-sm text-gray-500 mb-4">Estado de la integración con BSale.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Brand pages</div>
            <div className="text-xl font-bold">{totalBrands}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Variantes BSale</div>
            <div className="text-xl font-bold">{totalVariantsMapped.toLocaleString('es-CL')}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Snapshot stock</div>
            <div className="text-xl font-bold">2.8K vid</div>
          </div>
        </div>
      </section>
    </AdminChrome>
  );
}

function Stat({ label, value, note, highlight, href }: { label: string; value: number | string; note?: string; highlight?: boolean; href?: string }) {
  const inner = (
    <div className={`rounded-lg border p-3 sm:p-4 ${highlight ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-200'} ${href ? 'hover:border-gray-400 transition-colors' : ''}`}>
      <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-xl sm:text-2xl font-bold mt-1 ${highlight ? 'text-amber-900' : ''}`}>
        {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
      </div>
      {note && <div className="text-[10px] sm:text-xs text-gray-400 mt-1">{note}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Action({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return external ? (
    <a href={href} target="_blank" rel="noopener" className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-3 py-1.5">
      {label} ↗
    </a>
  ) : (
    <Link href={href} className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md px-3 py-1.5">
      {label}
    </Link>
  );
}
