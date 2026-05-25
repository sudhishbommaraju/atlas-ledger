import { PolicyRules } from '@/lib/insforge/db';

export const POLICY_PRESETS: Record<string, PolicyRules> = {
  conservative: {
    freeze_payout:      { auto_threshold: 1.01, escalate_threshold: 0.80 },
    block_duplicate:    { auto_threshold: 1.01, escalate_threshold: 0.80 },
    recompute_balance:  { auto_threshold: 1.01, escalate_threshold: 0.80 },
    reconstruct_sync:   { auto_threshold: 1.01, escalate_threshold: 0.80 },
    update_eligibility: { auto_threshold: 1.01, escalate_threshold: 0.80 },
  },
  standard: {
    freeze_payout:      { auto_threshold: 0.95, escalate_threshold: 0.80 },
    block_duplicate:    { auto_threshold: 0.95, escalate_threshold: 0.80 },
    recompute_balance:  { auto_threshold: 0.95, escalate_threshold: 0.80 },
    reconstruct_sync:   { auto_threshold: 0.95, escalate_threshold: 0.80 },
    update_eligibility: { auto_threshold: 0.95, escalate_threshold: 0.80 },
  },
  aggressive: {
    freeze_payout:      { auto_threshold: 0.85, escalate_threshold: 0.70 },
    block_duplicate:    { auto_threshold: 0.85, escalate_threshold: 0.70 },
    recompute_balance:  { auto_threshold: 0.85, escalate_threshold: 0.70 },
    reconstruct_sync:   { auto_threshold: 0.85, escalate_threshold: 0.70 },
    update_eligibility: { auto_threshold: 0.85, escalate_threshold: 0.70 },
  },
};

export type PolicyDecision = 'auto_execute' | 'escalate' | 'page_human';

export function getPolicyDecision(
  actionType: keyof PolicyRules,
  confidence: number,
  rules: PolicyRules
): PolicyDecision {
  const r = rules[actionType];
  if (confidence >= r.auto_threshold) return 'auto_execute';
  if (confidence >= r.escalate_threshold) return 'escalate';
  return 'page_human';
}
