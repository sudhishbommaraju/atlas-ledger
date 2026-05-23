import { createServerClient } from '@/lib/insforge/server';
import { CanonicalState } from '@/lib/insforge/db';

export async function runDetectors(state: CanonicalState) {
  const insforge = createServerClient();
  const companyId = state.company_id;
  const now = Date.now();
  
  const driftEventsToInsert: any[] = [];
  
  // Helper to add events
  const addEvent = (type: string, severity: string, conf: number, systems: string[], desc: string, action: string, risk: number) => {
    driftEventsToInsert.push({
      company_id: companyId,
      detector_type: type,
      severity,
      confidence_score: conf,
      affected_systems: systems,
      description: desc,
      recommended_action: action,
      status: 'open',
      dollars_at_risk: risk,
      payouts_affected: 0,
      systems_impacted: systems
    });
  };

  // Detector 1 — Settlement mismatch
  if (state.stripe_balance > 0 && state.simulated_erp_balance > 0) {
    const diff = Math.abs(state.stripe_balance - state.simulated_erp_balance);
    const pct = diff / Math.max(state.stripe_balance, state.simulated_erp_balance);
    
    if (pct > 0.02) {
      const severity = pct > 0.10 ? 'critical' : 'high';
      addEvent(
        'settlement_mismatch',
        severity,
        0.95,
        ['Stripe', 'ERP'],
        `Stripe and ERP balances diverge by ${(pct * 100).toFixed(1)}%. Gap: $${(diff / 100).toFixed(2)}.`,
        'Freeze payouts against ERP balance until Stripe settlement confirms.',
        diff
      );
    }
  }

  // Detector 2 — Duplicate payout intent
  const ninetySecondsAgo = new Date(now - 90000).toISOString();
  const { data: recentPayouts } = await insforge.database
    .from('ingested_events')
    .select('*')
    .eq('company_id', companyId)
    .in('event_type', ['payout.created', 'payout.paid'])
    .gte('ingested_at', ninetySecondsAgo);
    
  if (recentPayouts && recentPayouts.length > 1) {
    const amounts = recentPayouts.map(p => p.amount);
    const duplicates = amounts.filter((item, index) => amounts.indexOf(item) !== index);
    if (duplicates.length > 0) {
      addEvent(
        'duplicate_payout',
        'critical',
        0.99,
        ['Stripe'],
        `Duplicate payout batch detected. Secondary execution blocked. $${(duplicates[0] / 100).toFixed(2)} protected.`,
        'Block secondary payout, flag for human review.',
        duplicates[0]
      );
    }
  }

  // Detector 3 — Stale balance
  if (state.balance_freshness_seconds > 300) {
    addEvent(
      'stale_balance',
      'high',
      0.88,
      ['Bank', 'Stripe', 'ERP'], // Simplification: we mark all potentially stale
      `Balance has not updated in over 5 minutes (stale for ${state.balance_freshness_seconds}s). Sync may be delayed.`,
      'Freeze payouts dependent on stale source, trigger re-poll.',
      0
    );
  }

  // Detector 4 — Reserve inconsistency
  if (state.safe_to_disburse < 0) {
    addEvent(
      'reserve_inconsistency',
      'high',
      0.99,
      ['Stripe', 'Internal Ledger'],
      'Safe to disburse has dropped below 0. Reserve level is lower than the computed safe retention threshold.',
      'Freeze disbursements and recalculate exposure limits.',
      Math.abs(state.safe_to_disburse)
    );
  }

  // Detector 5 — Broken sync window
  const tenMinsAgo = new Date(now - 600000).toISOString();
  const { data: pollingGaps } = await insforge.database
    .from('polling_log')
    .select('id')
    .eq('company_id', companyId)
    .eq('gap_detected', true)
    .gte('last_polled_at', tenMinsAgo);
    
  if (pollingGaps && pollingGaps.length > 0) {
    addEvent(
      'broken_sync',
      'medium',
      0.87,
      ['Stripe', 'Polling'],
      'Polling log shows gaps detected in the last 10 minutes. Canonical state integrity at risk.',
      'Reconstruct missing window, hold payouts until continuity restored.',
      0
    );
  }
  
  // Insert newly detected drift events (prevent duplicates by checking if similar open events exist)
  if (driftEventsToInsert.length > 0) {
    const { data: existingOpen } = await insforge.database
      .from('drift_events')
      .select('detector_type')
      .eq('company_id', companyId)
      .eq('status', 'open');
      
    const existingTypes = new Set(existingOpen?.map(e => e.detector_type) || []);
    
    const newToInsert = driftEventsToInsert.filter(e => !existingTypes.has(e.detector_type));
    
    if (newToInsert.length > 0) {
      await insforge.database.from('drift_events').insert(newToInsert);
    }
  }
}
