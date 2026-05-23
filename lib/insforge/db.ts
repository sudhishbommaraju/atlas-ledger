export interface Company {
  id: string;
  name: string;
  stripe_account_id?: string;
  created_at: string;
}

export interface CanonicalState {
  id: string;
  company_id: string;
  settled_balance: number;
  pending_balance: number;
  safe_to_disburse: number;
  reserve_amount: number;
  last_updated: string;
  stripe_balance: number;
  simulated_erp_balance: number;
  simulated_bank_balance: number;
  balance_freshness_seconds: number;
  state_confidence_score: number;
}

export interface IngestedEvent {
  id: string;
  company_id: string;
  source: 'stripe' | 'bank_simulated' | 'erp_simulated';
  event_type: string;
  event_id: string;
  amount: number;
  currency: string;
  raw_payload: any;
  ingested_at: string;
  processed: boolean;
}

export interface DriftEvent {
  id: string;
  company_id: string;
  detector_type: 'settlement_mismatch' | 'duplicate_payout' | 'stale_balance' | 'reserve_inconsistency' | 'broken_sync';
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence_score: number;
  affected_systems: string[];
  description: string;
  recommended_action: string;
  status: 'open' | 'escalated' | 'auto_resolved' | 'human_resolved';
  detected_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  dollars_at_risk: number;
  payouts_affected: number;
  systems_impacted: string[];
}

export interface RemediationAction {
  id: string;
  company_id: string;
  drift_event_id: string;
  action_type: 'freeze_payout' | 'block_duplicate' | 'recompute_balance' | 'flag_stale' | 'escalate';
  triggered_by: 'atlas_auto' | 'human_approved';
  confidence_score: number;
  before_state: any;
  after_state: any;
  audit_log: string;
  created_at: string;
}

export interface PollingLog {
  id: string;
  company_id: string;
  source: string;
  last_polled_at: string;
  events_found: number;
  gap_detected: boolean;
  gap_description?: string;
}
