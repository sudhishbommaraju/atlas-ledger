import { createServerClient } from '@/lib/insforge/server';
import { CanonicalState, IngestedEvent } from '@/lib/insforge/db';
import { runDetectors } from '@/lib/detectors';

export async function recomputeState(companyId: string): Promise<CanonicalState | null> {
  const insforge = createServerClient();
  
  const { data: states, error: stateErr } = await insforge.database
    .from('canonical_state')
    .select('*')
    .eq('company_id', companyId)
    .limit(1);
    
  if (stateErr || !states || states.length === 0) {
    console.error('Failed to fetch state for recomputation:', stateErr);
    return null;
  }
  
  const state = states[0] as CanonicalState;
  
  const { data: events, error: eventsErr } = await insforge.database
    .from('ingested_events')
    .select('*')
    .eq('company_id', companyId);
    
  if (eventsErr || !events) {
    console.error('Failed to fetch events:', eventsErr);
    return null;
  }
  
  let stripe_balance = 0;
  let simulated_erp_balance = 0;
  let simulated_bank_balance = 0;
  
  let latest_stripe = 0;
  let latest_erp = 0;
  let latest_bank = 0;

  events.forEach((evt: any) => {
    const t = new Date(evt.ingested_at).getTime();
    if (evt.source === 'stripe') {
      stripe_balance += evt.amount;
      if (t > latest_stripe) latest_stripe = t;
    }
    if (evt.source === 'erp_simulated') {
      simulated_erp_balance += evt.amount;
      if (t > latest_erp) latest_erp = t;
    }
    if (evt.source === 'bank_simulated') {
      simulated_bank_balance += evt.amount;
      if (t > latest_bank) latest_bank = t;
    }
  });
  
  if (events.length === 0) {
    stripe_balance = state.stripe_balance;
    simulated_erp_balance = state.simulated_erp_balance;
    simulated_bank_balance = state.simulated_bank_balance;
  }
  
  const safe_to_disburse = Math.min(stripe_balance, simulated_bank_balance) - state.reserve_amount;
  
  const maxVal = Math.max(stripe_balance, simulated_erp_balance, simulated_bank_balance);
  const minVal = Math.min(stripe_balance, simulated_erp_balance, simulated_bank_balance);
  let confidence_score = 1.0;
  
  if (maxVal > 0) {
    const divergence = (maxVal - minVal) / maxVal;
    if (divergence <= 0.02) {
      confidence_score = 1.0;
    } else {
      confidence_score = Math.max(0, 1.0 - (divergence * 2));
    }
  } else if (maxVal === 0 && minVal === 0) {
     confidence_score = 1.0;
  }
  
  const now = Date.now();
  let maxFreshness = 0;
  if (latest_stripe > 0) maxFreshness = Math.max(maxFreshness, (now - latest_stripe) / 1000);
  if (latest_erp > 0) maxFreshness = Math.max(maxFreshness, (now - latest_erp) / 1000);
  if (latest_bank > 0) maxFreshness = Math.max(maxFreshness, (now - latest_bank) / 1000);
  if (maxFreshness === 0) maxFreshness = state.balance_freshness_seconds;

  const { data: updated, error: updateErr } = await insforge.database
    .from('canonical_state')
    .update({
      stripe_balance,
      simulated_erp_balance,
      simulated_bank_balance,
      safe_to_disburse,
      state_confidence_score: Number(confidence_score.toFixed(2)),
      balance_freshness_seconds: Math.floor(maxFreshness),
      last_updated: new Date().toISOString()
    })
    .eq('id', state.id)
    .select();
    
  if (updateErr || !updated) {
    console.error('Failed to update canonical state:', updateErr);
    return state;
  }
  
  const updatedState = updated[0] as CanonicalState;
  
  // Trigger Detectors
  await runDetectors(updatedState);
  
  return updatedState;
}
