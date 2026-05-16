// Audit log helper. Llamar desde cualquier mutacion con info estructurada.

import 'server-only';
import { supabaseAdmin } from './supabase';

export type AuditActor = 'admin' | 'system' | 'cron' | 'webhook:mp' | 'webhook:bsale' | 'webhook:meta' | 'public' | string;

export async function audit(args: {
  actor: AuditActor;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip?: string;
  user_agent?: string;
}): Promise<void> {
  try {
    await supabaseAdmin().from('audit_log').insert({
      actor: args.actor,
      action: args.action,
      entity_type: args.entity_type,
      entity_id: args.entity_id || null,
      details: args.details || null,
      ip: args.ip || null,
      user_agent: args.user_agent || null,
    });
  } catch (e) {
    // Audit log fail no debe romper la operacion principal
    console.warn('[audit] failed to log', e);
  }
}
