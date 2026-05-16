// Boykot Credits / Wallet helpers — capa 3 del payments roadmap.

import 'server-only';
import { supabaseAdmin } from './supabase';

export type CreditsTxType = 'topup' | 'purchase' | 'bonus' | 'refund' | 'adjust';
export type CreditsTier = 'basic' | 'plus' | 'club';

export interface CreditsAccount {
  id: number;
  customer_email: string;
  customer_name: string | null;
  balance_clp: number;
  total_topup_clp: number;
  total_spent_clp: number;
  tier: CreditsTier;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditsTransaction {
  id: number;
  account_id: number;
  type: CreditsTxType;
  amount_clp: number;
  balance_after_clp: number;
  reference: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

/** Get account by email (returns null if no movements yet) */
export async function getCreditsAccount(email: string): Promise<CreditsAccount | null> {
  const { data } = await supabaseAdmin()
    .from('boykot_credits_accounts')
    .select('*')
    .eq('customer_email', email.toLowerCase())
    .maybeSingle();
  return data as CreditsAccount | null;
}

/** List all accounts (admin view) */
export async function listCreditsAccounts(limit = 100): Promise<CreditsAccount[]> {
  const { data } = await supabaseAdmin()
    .from('boykot_credits_accounts')
    .select('*')
    .order('balance_clp', { ascending: false })
    .limit(limit);
  return (data ?? []) as CreditsAccount[];
}

/** Apply a transaction (creates account if missing, updates balance, appends ledger). Atomic via RPC. */
export async function applyCreditsTransaction(args: {
  email: string;
  amountClp: number; // positive = entrada, negative = salida
  type: CreditsTxType;
  reference?: string;
  note?: string;
  createdBy?: string;
}): Promise<{ accountId: number; newBalance: number }> {
  const { data, error } = await supabaseAdmin().rpc('boykot_credits_apply', {
    p_customer_email: args.email.toLowerCase(),
    p_amount_clp: args.amountClp,
    p_type: args.type,
    p_reference: args.reference ?? null,
    p_note: args.note ?? null,
    p_created_by: args.createdBy ?? 'system',
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return { accountId: row.account_id, newBalance: row.new_balance };
}

export async function listTransactions(accountId: number, limit = 50): Promise<CreditsTransaction[]> {
  const { data } = await supabaseAdmin()
    .from('boykot_credits_transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as CreditsTransaction[];
}

/** Stats globales para dashboard admin */
export async function getCreditsStats(): Promise<{
  totalAccounts: number;
  totalBalance: number;
  totalTopup: number;
  totalSpent: number;
  byTier: Record<CreditsTier, number>;
}> {
  const { data } = await supabaseAdmin()
    .from('boykot_credits_accounts')
    .select('balance_clp, total_topup_clp, total_spent_clp, tier');
  const rows = (data ?? []) as Pick<CreditsAccount, 'balance_clp' | 'total_topup_clp' | 'total_spent_clp' | 'tier'>[];

  const stats = {
    totalAccounts: rows.length,
    totalBalance: 0,
    totalTopup: 0,
    totalSpent: 0,
    byTier: { basic: 0, plus: 0, club: 0 } as Record<CreditsTier, number>,
  };
  for (const r of rows) {
    stats.totalBalance += r.balance_clp;
    stats.totalTopup += r.total_topup_clp;
    stats.totalSpent += r.total_spent_clp;
    stats.byTier[r.tier] = (stats.byTier[r.tier] ?? 0) + 1;
  }
  return stats;
}
