CREATE TABLE IF NOT EXISTS companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    stripe_account_id text,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS canonical_state (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    settled_balance bigint NOT NULL,
    pending_balance bigint NOT NULL,
    safe_to_disburse bigint NOT NULL,
    reserve_amount bigint NOT NULL,
    last_updated timestamp NOT NULL,
    stripe_balance bigint NOT NULL,
    simulated_erp_balance bigint NOT NULL,
    simulated_bank_balance bigint NOT NULL,
    balance_freshness_seconds integer NOT NULL,
    state_confidence_score numeric NOT NULL
);

CREATE TABLE IF NOT EXISTS ingested_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    source text CHECK (source IN ('stripe', 'bank_simulated', 'erp_simulated')),
    event_type text NOT NULL,
    event_id text NOT NULL,
    amount bigint NOT NULL,
    currency text NOT NULL,
    raw_payload jsonb NOT NULL,
    ingested_at timestamp DEFAULT now(),
    processed boolean DEFAULT false,
    UNIQUE(company_id, source, event_id)
);

CREATE TABLE IF NOT EXISTS drift_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    detector_type text CHECK (detector_type IN ('settlement_mismatch', 'duplicate_payout', 'stale_balance', 'reserve_inconsistency', 'broken_sync')),
    severity text CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    confidence_score numeric NOT NULL,
    affected_systems text[] NOT NULL,
    description text NOT NULL,
    recommended_action text NOT NULL,
    status text CHECK (status IN ('open', 'escalated', 'auto_resolved', 'human_resolved')),
    detected_at timestamp DEFAULT now(),
    resolved_at timestamp,
    resolution_notes text,
    dollars_at_risk bigint DEFAULT 0,
    payouts_affected integer DEFAULT 0,
    systems_impacted text[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS remediation_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    drift_event_id uuid REFERENCES drift_events(id) ON DELETE CASCADE,
    action_type text CHECK (action_type IN ('freeze_payout', 'block_duplicate', 'recompute_balance', 'flag_stale', 'escalate')),
    triggered_by text CHECK (triggered_by IN ('atlas_auto', 'human_approved')),
    confidence_score numeric NOT NULL,
    before_state jsonb NOT NULL,
    after_state jsonb NOT NULL,
    audit_log text NOT NULL,
    created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS polling_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
    source text NOT NULL,
    last_polled_at timestamp DEFAULT now(),
    events_found integer DEFAULT 0,
    gap_detected boolean DEFAULT false,
    gap_description text
);
