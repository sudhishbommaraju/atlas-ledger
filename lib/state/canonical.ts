import { createServerClient } from '@/lib/insforge/server';
import { CanonicalState, IngestedEvent } from '@/lib/insforge/db';

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
  
  events.forEach((evt: any) => {
    if (evt.source === 'stripe') stripe_balance += evt.amount;
    if (evt.source === 'erp_simulated') simulated_erp_balance += evt.amount;
    if (evt.source === 'bank_simulated') simulated_bank_balance += evt.amount;
  });
  
  if (events.length === 0) {
    stripe_balance = state.stripe_balance;
    simulated_erp_balance = state.simulated_erp_balance;
    simulated_bank_balance = state.simulated_bank_balance;
  }
  
  const safe_to_disburse = Math.min(stripe_balance, simulated_bank_balance) - state.reserve_amount;
  
  const avg = (stripe_balance + simulated_erp_balance + simulated_bank_balance) / 3;
  let confidence_score = state.state_confidence_score;
  
  if (avg > 0) {
    const max_diff = Math.max(
      Math.abs(stripe_balance - simulated_erp_balance),
      Math.abs(simulated_erp_balance - simulated_bank_balance),
      Math.abs(stripe_balance - simulated_bank_balance)
    );
    confidence_score = Math.max(0, 1.0 - (max_diff / avg));
  }
  
  const { data: updated, error: updateErr } = await insforge.database
    .from('canonical_state')
    .update({
      stripe_balance,
      simulated_erp_balance,
      simulated_bank_balance,
      safe_to_disburse,
      state_confidence_score: Number(confidence_score.toFixed(2)),
      last_updated: new Date().toISOString()
    })
    .eq('id', state.id)
    .select();
    
  if (updateErr || !updated) {
    console.error('Failed to update canonical state:', updateErr);
    return state;
  }
  
  return updated[0] as CanonicalState;
}
