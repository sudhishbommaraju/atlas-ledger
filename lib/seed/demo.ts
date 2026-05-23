import { createServerClient } from '@/lib/insforge/server';

export async function seedDemoData() {
  const insforge = createServerClient();
  
  const { data: companies, error: companyErr } = await insforge.database
    .from('companies')
    .select('id')
    .eq('name', 'Meridian Marketplace')
    .limit(1);
    
  let companyId = '';
  
  if (!companies || companies.length === 0) {
    const { data: newCompany, error: insertErr } = await insforge.database
      .from('companies')
      .insert({
        name: 'Meridian Marketplace',
        stripe_account_id: 'acct_1MeridianMarketplace'
      })
      .select('id');
      
    if (insertErr || !newCompany) throw new Error('Failed to create company');
    companyId = newCompany[0].id;
  } else {
    companyId = companies[0].id;
  }
  
  const { data: stateData } = await insforge.database
    .from('canonical_state')
    .select('id')
    .eq('company_id', companyId);
    
  const statePayload = {
      stripe_balance: 84732000,
      simulated_erp_balance: 92318000,
      simulated_bank_balance: 85100000,
      safe_to_disburse: 82132000,
      state_confidence_score: 0.71,
      settled_balance: 84000000,
      pending_balance: 732000,
      reserve_amount: 2968000,
      balance_freshness_seconds: 120,
      last_updated: new Date().toISOString()
  };

  if (!stateData || stateData.length === 0) {
    await insforge.database.from('canonical_state').insert({
      company_id: companyId,
      ...statePayload
    });
  } else {
    await insforge.database.from('canonical_state').update(statePayload).eq('company_id', companyId);
  }
  
  await insforge.database.from('drift_events').delete().eq('company_id', companyId).eq('status', 'open');

  await insforge.database.from('drift_events').insert([
    {
      company_id: companyId,
      detector_type: 'settlement_mismatch',
      severity: 'high',
      confidence_score: 0.94,
      affected_systems: ['Stripe', 'ERP'],
      description: 'Stripe settlement incomplete — ERP has marked $75,860 unavailable funds as available. Payouts against this balance are unsafe.',
      recommended_action: 'Freeze payouts against ERP balance until Stripe settlement confirms.',
      status: 'open',
      dollars_at_risk: 7586000,
      payouts_affected: 12,
      systems_impacted: ['Stripe', 'ERP']
    },
    {
      company_id: companyId,
      detector_type: 'duplicate_payout',
      severity: 'critical',
      confidence_score: 0.99,
      affected_systems: ['Stripe'],
      description: 'Duplicate payout batch detected. Secondary execution blocked. $12,450 protected.',
      recommended_action: 'Block secondary payout, flag for human review.',
      status: 'open',
      dollars_at_risk: 1245000,
      payouts_affected: 1,
      systems_impacted: ['Stripe']
    },
    {
      company_id: companyId,
      detector_type: 'broken_sync',
      severity: 'medium',
      confidence_score: 0.87,
      affected_systems: ['Stripe', 'Polling'],
      description: 'Webhook outage caused 3-hour event gap. 47 transactions unconfirmed. Canonical state integrity at risk.',
      recommended_action: 'Reconstruct missing window, hold payouts until continuity restored.',
      status: 'open',
      dollars_at_risk: 0,
      payouts_affected: 47,
      systems_impacted: ['Stripe', 'Polling']
    }
  ]);
  
  return { success: true, companyId };
}
