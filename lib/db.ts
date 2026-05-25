/**
 * Server-only database helpers.
 * Use these in API routes or Server Components only — never in 'use client' files.
 */
import { createServerClient } from '@/lib/insforge/server';

export async function getFirstCompanyId(): Promise<string | null> {
  const insforge = createServerClient();
  const { data } = await insforge.database
    .from('companies')
    .select('id')
    .limit(1);
  return data?.[0]?.id ?? null;
}

export async function getDriftEvents(company_id: string) {
  const insforge = createServerClient();
  const { data, error } = await insforge.database
    .from('drift_events')
    .select('*')
    .eq('company_id', company_id)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCanonicalState(company_id: string) {
  const insforge = createServerClient();
  const { data, error } = await insforge.database
    .from('canonical_state')
    .select('*')
    .eq('company_id', company_id)
    .order('last_updated', { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}

export async function getRemediationActions(company_id: string) {
  const insforge = createServerClient();
  const { data, error } = await insforge.database
    .from('remediation_actions')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
