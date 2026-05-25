-- Tier 2 + Tier 3 schema additions
-- Extends remediation_actions, adds policies and payout_events tables

-- Extend remediation_actions with Tier 2+3 fields
ALTER TABLE remediation_actions
  ADD COLUMN IF NOT EXISTS payout_id text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'auto_executed'
    CHECK (status IN ('auto_executed', 'escalated', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS human_approver uuid,
  ADD COLUMN IF NOT EXISTS approval_timestamp timestamp,
  ADD COLUMN IF NOT EXISTS policy_used text,
  ADD COLUMN IF NOT EXISTS reversible boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS undo_instructions text,
  ADD COLUMN IF NOT EXISTS simulated boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS executed_at timestamp;

-- Update action_type constraint to include Tier 2+3 types
ALTER TABLE remediation_actions DROP CONSTRAINT IF EXISTS remediation_actions_action_type_check;
ALTER TABLE remediation_actions ADD CONSTRAINT remediation_actions_action_type_check
  CHECK (action_type IN (
    'freeze_payout', 'block_duplicate',
    'recompute_balance', 'reconstruct_sync', 'update_eligibility',
    'flag_stale', 'escalate'
  ));

-- Policies table: per-company automation policy config
CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  policy_name text NOT NULL CHECK (policy_name IN ('conservative', 'standard', 'aggressive', 'custom')),
  rules jsonb NOT NULL DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(company_id)
);

-- Payout events table: tracks payout lifecycle under Atlas control
CREATE TABLE IF NOT EXISTS payout_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  payout_id text UNIQUE NOT NULL,
  amount bigint NOT NULL,
  destination text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'frozen', 'blocked', 'eligible', 'executed')),
  safety_check_passed boolean DEFAULT false,
  atlas_action_id uuid REFERENCES remediation_actions(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);