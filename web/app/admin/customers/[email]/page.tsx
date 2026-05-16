import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../../layout';
import AdminChrome from '@/components/admin/Chrome';
import { supabaseAdmin } from '@/lib/supabase';
import { getCreditsAccount, listTransactions } from '@/lib/credits';

export const dynamic = 'force-dynamic';

interface Params {
  email: string;
}

export default async function CustomerDetailPage({ params }: { params: Promise<Params> }) {
  await requireAdmin();
  const { email: emailRaw } = await params;
  const email = decodeURIComponent(emailRaw).toLowerCase();

  const sb = supabaseAdmin();

  // Cargar paralelo: orders, wishlist, quotes, credits, reviews, gift cards
  const [
    ordersResult,
    wishlistResult,
    quotesResult,
    creditsAccount,
    reviewsResult,
    giftCardsBoughtResult,
    giftCardsReceivedResult,
    referralResult,
  ] = await Promise.all([
    sb.from('pending_orders').select('*').eq('customer_email', email).order('created_at', { ascending: false }),
    sb.from('wishlists').select('*').limit(20), // wishlist es por session_id no email, mostrar generico
    sb.from('quotes').select('*').eq('customer_email', email).order('created_at', { ascending: false }),
    getCreditsAccount(email),
    sb.from('product_reviews').select('*').eq('customer_email', email),
    sb.from('gift_cards').select('*').eq('buyer_email', email),
    sb.from('gift_cards').select('*').or(`recipient_email.eq.${email},redeemed_by_email.eq.${email}`),
    sb.from('referrals').select('*').eq('referrer_email', email).maybeSingle(),
  ]);

  const orders = ordersResult.data ?? [];
  if (orders.length === 0 && !creditsAccount) {
    // Si no hay ni 1 dato, customer no existe
    notFound();
  }

  const transactions = creditsAccount ? await listTransactions(creditsAccount.id, 20) : [];

  const totalPaid = orders
    .filter((o): o is { total_clp: number; status: string; payment_status: string | null } =>
      'total_clp' in o && (o as { payment_status: string }).payment_status === 'paid' || (o as { status: string }).status === 'completed')
    .reduce((s, o) => s + ((o as { total_clp: number }).total_clp || 0), 0);

  const firstOrder = orders[orders.length - 1] as { customer_name?: string; created_at: string } | undefined;

  return (
    <AdminChrome>
      <Link href="/admin/customers" className="text-sm text-gray-500 hover:text-gray-900">
        ← Volver a clientes
      </Link>
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{firstOrder?.customer_name || email}</h1>
        <p className="text-sm text-gray-500 font-mono">{email}</p>
        {firstOrder?.created_at && (
          <p className="text-xs text-gray-400 mt-1">
            Primer pedido: {new Date(firstOrder.created_at).toLocaleDateString('es-CL')}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Pedidos" value={orders.length} />
        <Stat label="Total pagado" value={`$${totalPaid.toLocaleString('es-CL')}`} />
        <Stat label="Saldo Credits" value={creditsAccount ? `$${creditsAccount.balance_clp.toLocaleString('es-CL')}` : '—'} note={creditsAccount?.tier ? `tier ${creditsAccount.tier}` : undefined} />
        <Stat label="Cotizaciones" value={(quotesResult.data ?? []).length} />
      </div>

      {/* Pedidos */}
      <Section title={`Pedidos (${orders.length})`}>
        {orders.length === 0 ? (
          <Empty msg="Sin pedidos aún." />
        ) : (
          <ul className="space-y-2">
            {(orders as Array<{ id: number; short_id: string; status: string; total_clp: number; created_at: string; payment_status: string | null }>).slice(0, 10).map(o => (
              <li key={o.id} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                <Link href={`/admin/orders/${o.short_id}`} className="font-mono text-sm font-bold text-blue-600 hover:underline">
                  {o.short_id}
                </Link>
                <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('es-CL')}</div>
                <div className="text-sm font-bold">${o.total_clp.toLocaleString('es-CL')}</div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Cotizaciones */}
      <Section title={`Cotizaciones (${(quotesResult.data ?? []).length})`}>
        {(quotesResult.data ?? []).length === 0 ? (
          <Empty msg="Sin cotizaciones." />
        ) : (
          <ul className="space-y-1 text-sm">
            {(quotesResult.data ?? []).slice(0, 5).map((q: { id: number; short_id: string; total_clp: number; status: string; created_at: string }) => (
              <li key={q.id} className="flex items-center justify-between bg-white border border-gray-200 rounded p-2.5">
                <span className="font-mono">{q.short_id}</span>
                <span className="font-bold">${q.total_clp.toLocaleString('es-CL')}</span>
                <span className="text-xs text-gray-500">{q.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Credits transactions */}
      <Section title={`Boykot Credits (${creditsAccount?.balance_clp.toLocaleString('es-CL') || '0'} CLP)`}>
        {transactions.length === 0 ? (
          <Empty msg="Sin transacciones de credits." />
        ) : (
          <table className="w-full text-sm bg-white border border-gray-200 rounded-lg">
            <tbody>
              {transactions.slice(0, 10).map(tx => (
                <tr key={tx.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString('es-CL')}</td>
                  <td className="px-3 py-2 text-xs uppercase tracking-wider text-gray-600">{tx.type}</td>
                  <td className="px-3 py-2 text-sm text-gray-700 truncate max-w-xs">{tx.note || tx.reference || '—'}</td>
                  <td className={`px-3 py-2 text-right font-mono font-bold ${tx.amount_clp > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {tx.amount_clp > 0 ? '+' : ''}${tx.amount_clp.toLocaleString('es-CL')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      {/* Reviews + Gift cards + Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniSection title="Reviews">
          {(reviewsResult.data ?? []).length === 0 ? <Empty msg="Sin reseñas" /> : (
            <ul className="text-xs space-y-1">
              {(reviewsResult.data ?? []).slice(0, 5).map((r: { id: number; product_slug: string; rating: number }) => (
                <li key={r.id} className="flex justify-between">
                  <span className="truncate">{r.product_slug}</span>
                  <span className="text-amber-500 flex-shrink-0">{'★'.repeat(r.rating)}</span>
                </li>
              ))}
            </ul>
          )}
        </MiniSection>

        <MiniSection title="Gift cards compradas">
          {(giftCardsBoughtResult.data ?? []).length === 0 ? <Empty msg="Sin compras" /> : (
            <ul className="text-xs space-y-1">
              {(giftCardsBoughtResult.data ?? []).slice(0, 5).map((g: { id: number; code: string; amount_clp: number; status: string }) => (
                <li key={g.id} className="flex justify-between">
                  <span className="font-mono">{g.code}</span>
                  <span>${g.amount_clp.toLocaleString('es-CL')}</span>
                </li>
              ))}
            </ul>
          )}
        </MiniSection>

        <MiniSection title="Referral">
          {!referralResult.data ? <Empty msg="Sin código aún" /> : (
            <div className="text-xs">
              <div className="font-mono font-bold">{(referralResult.data as { code: string }).code}</div>
              <div className="text-gray-500 mt-1">
                {(referralResult.data as { total_uses: number; total_earned_clp: number }).total_uses} usos ·
                ${(referralResult.data as { total_earned_clp: number }).total_earned_clp.toLocaleString('es-CL')} ganados
              </div>
            </div>
          )}
        </MiniSection>
      </div>
    </AdminChrome>
  );
}

function Stat({ label, value, note }: { label: string; value: number | string; note?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
      </div>
      {note && <div className="text-[10px] text-gray-400 mt-1">{note}</div>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-3">{title}</h2>
      {children}
    </section>
  );
}

function MiniSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">{title}</div>
      {children}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-xs text-gray-400 italic py-2">{msg}</div>;
}
