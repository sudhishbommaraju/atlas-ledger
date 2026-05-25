-- ============================================================
-- Migration: rls-and-indexes
-- Fix 17 InsForge advisor issues:
--   - Enable RLS + FORCE on 8 tables
--   - Grant BYPASSRLS to project_admin so server client retains full access
--   - Add permissive bypass policies for project_admin on all 8 tables
--   - Create 9 indexes on FK columns
-- ============================================================

-- ── 0. Grant RLS bypass to the InsForge admin role ───────────
--    This means the server client (which uses the admin/service key)
--    is never blocked by row-level security policies.

ALTER ROLE project_admin BYPASSRLS;

-- ── 1. Enable RLS + FORCE ROW LEVEL SECURITY ─────────────────

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.canonical_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canonical_state FORCE ROW LEVEL SECURITY;

ALTER TABLE public.ingested_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingested_events FORCE ROW LEVEL SECURITY;

ALTER TABLE public.drift_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drift_events FORCE ROW LEVEL SECURITY;

ALTER TABLE public.polling_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_log FORCE ROW LEVEL SECURITY;

ALTER TABLE public.remediation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remediation_actions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.payout_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_events FORCE ROW LEVEL SECURITY;

-- ── 2. Permissive bypass policies for project_admin ───────────
--    Defense-in-depth: even without BYPASSRLS, these policies
--    explicitly allow all operations from the admin role.

CREATE POLICY "admin_all" ON public.companies
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.canonical_state
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.ingested_events
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.drift_events
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.polling_log
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.remediation_actions
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.policies
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

CREATE POLICY "admin_all" ON public.payout_events
  AS PERMISSIVE FOR ALL TO project_admin USING (true) WITH CHECK (true);

-- ── 3. FK indexes ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_canonical_state_company_id
  ON public.canonical_state(company_id);

CREATE INDEX IF NOT EXISTS idx_ingested_events_company_id
  ON public.ingested_events(company_id);

CREATE INDEX IF NOT EXISTS idx_drift_events_company_id
  ON public.drift_events(company_id);

CREATE INDEX IF NOT EXISTS idx_remediation_actions_company_id
  ON public.remediation_actions(company_id);

CREATE INDEX IF NOT EXISTS idx_remediation_actions_drift_event_id
  ON public.remediation_actions(drift_event_id);

CREATE INDEX IF NOT EXISTS idx_polling_log_company_id
  ON public.polling_log(company_id);

CREATE INDEX IF NOT EXISTS idx_policies_company_id
  ON public.policies(company_id);

CREATE INDEX IF NOT EXISTS idx_payout_events_atlas_action_id
  ON public.payout_events(atlas_action_id);

CREATE INDEX IF NOT EXISTS idx_payout_events_company_id
  ON public.payout_events(company_id);
