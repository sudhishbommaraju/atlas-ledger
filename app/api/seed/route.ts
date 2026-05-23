import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/insforge/server';

export async function POST(req: Request) {
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
      
    if (insertErr || !newCompany) return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    companyId = newCompany[0].id;
  } else {
    companyId = companies[0].id;
  }
  
  const { data: stateData } = await insforge.database
    .from('canonical_state')
    .select('id')
    .eq('company_id', companyId);
    
  if (!stateData || stateData.length === 0) {
    await insforge.database.from('canonical_state').insert({
      company_id: companyId,
      settled_balance: 84000000,
      pending_balance: 732000,
      safe_to_disburse: 82132000,
      reserve_amount: 2968000,
      last_updated: new Date().toISOString(),
      stripe_balance: 84732000,
      simulated_erp_balance: 92318000,
      simulated_bank_balance: 85100000,
      balance_freshness_seconds: 120,
      state_confidence_score: 0.71
    });
  } else {
    await insforge.database.from('canonical_state').update({
      stripe_balance: 84732000,
      simulated_erp_balance: 92318000,
      simulated_bank_balance: 85100000,
      safe_to_disburse: 82132000,
      state_confidence_score: 0.71,
      last_updated: new Date().toISOString()
    }).eq('company_id', companyId);
  }
  
  const { data: driftData } = await insforge.database
    .from('drift_events')
    .select('id')
    .eq('company_id', companyId)
    .eq('status', 'open');
    
  if (!driftData || driftData.length === 0) {
    await insforge.database.from('drift_events').insert([
      {
        company_id: companyId,
        detector_type: 'settlement_mismatch',
        severity: 'high',
        confidence_score: 0.95,
        affected_systems: ['Stripe', 'ERP'],
        description: 'Stripe payout batch #8842 does not match ERP expected settlement amount.',
        recommended_action: 'Hold payout and verify batch details.',
        status: 'open',
        dollars_at_risk: 1540000,
        payouts_affected: 12,
        systems_impacted: ['Stripe', 'ERP']
      },
      {
        company_id: companyId,
        detector_type: 'stale_balance',
        severity: 'medium',
        confidence_score: 0.88,
        affected_systems: ['Bank'],
        description: 'Bank balance has not updated in over 24 hours. Sync may be delayed.',
        recommended_action: 'Manually trigger bank feed sync or flag as stale.',
        status: 'open',
        dollars_at_risk: 0,
        payouts_affected: 0,
        systems_impacted: ['Bank']
      },
      {
        company_id: companyId,
        detector_type: 'reserve_inconsistency',
        severity: 'critical',
        confidence_score: 0.99,
        affected_systems: ['Stripe', 'Internal Ledger'],
        description: 'Stripe reserve level is lower than the computed safe retention threshold.',
        recommended_action: 'Freeze disbursements and recalculate exposure limits.',
        status: 'open',
        dollars_at_risk: 2968000,
        payouts_affected: 450,
        systems_impacted: ['Stripe', 'Internal Ledger']
      }
    ]);
  }
  
  return NextResponse.json({ success: true, companyId });
}
