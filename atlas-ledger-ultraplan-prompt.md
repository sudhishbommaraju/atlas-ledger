# Atlas Ledger Claude Ultraplan Prompt

You are an elite founding engineer, fintech infrastructure architect, product designer, and startup CTO. Your job is to design and scaffold a high-conviction v1 of **Atlas Ledger**, a real-time reconciliation and settlement exception engine for payout-heavy platforms that process money across multiple PSPs, bank accounts, and ERP systems.

Do not give a shallow startup summary. Think like a founder building the company, a staff engineer designing the system, and a product lead defining the first painful wedge. Be specific, opinionated, and practical. Push toward a real product architecture and implementation plan.

Do **not** finalize brand, pricing, legal language, or overfit to assumptions if something is uncertain. Where uncertainty exists, propose strong defaults and clearly mark them as assumptions.

## Core startup idea
Atlas Ledger is a financial state intelligence platform for payout-heavy marketplaces and embedded-payments platforms. These companies often run money through multiple PSPs such as Stripe and Adyen, receive settlement into bank accounts, and later reflect those movements in an ERP such as NetSuite. The core pain is that these systems disagree constantly. Teams do not know true balances, cannot explain settlement drift, reconcile manually, and find issues too late.

Atlas Ledger connects to those systems, normalizes all money-moving events into one internal model, creates expectations for what should happen next, matches actual downstream outcomes against those expectations, and turns breaks into structured, auditable exception workflows.

The product is not an ERP replacement, not a generic finance dashboard, not a treasury suite, and not “AI for accounting.” It is a deeply specialized reconciliation and settlement exception engine that can later expand into a broader infrastructure layer only after it wins trust.

## The core insight
Modern fintech stacks are distributed financial systems with inconsistent state. Customer payments, payouts, refunds, fees, reserves, settlement batches, bank deposits, and ERP postings each live in different systems, with different IDs, timestamps, formats, and semantics. The result is persistent state divergence.

Atlas Ledger exists to make the true lifecycle of money legible across those systems.

## Target ICP
Design the product first for one narrow ICP:

**Primary ICP:** payout-heavy marketplaces and platforms processing roughly $50M–$2B annually across multiple PSPs, with lean finance / payment ops teams.

Best subsegments:
- creator payout platforms
- gig economy / contractor payout platforms
- payroll fintechs with external payment complexity
- vertical SaaS with embedded payments and sub-merchant payouts

The ICP should usually have:
- Stripe and/or Adyen in use
- one or more operating bank accounts
- an ERP, likely NetSuite or equivalent
- daily or weekly payout obligations
- recurring reconciliation pain across PSP, bank, and ERP
- small enough teams that spreadsheets still exist, but large enough pain that spreadsheet workflows are breaking

Do not optimize for generic enterprises, generic SMBs, or all fintechs.

## The moat
The moat is not generic AI. The moat is **historical financial state intelligence + workflow lock-in**.

Specifically, Atlas Ledger should accumulate over time:
- canonical transaction lineage across PSP → bank → ERP
- settlement timing behavior and rail/provider-specific patterns
- recurring failure signatures
- exception resolution history
- customer-specific reconciliation rules and tolerance logic
- audit trails and operational dependencies

This means the architecture should be designed so that the product naturally captures:
- raw event history
- normalized event history
- matching attempts
- exception metadata
- manual resolution labels
- rule version history
- user actions / approvals / overrides

The system should get smarter from workflow usage, not depend on a magical dataset from day one.

## Product scope for v1
Do not overbuild. The v1 wedge should be:

A real-time reconciliation and settlement exception engine that:
- connects to Stripe
- connects to Adyen
- connects to bank transaction feeds or uploaded statements / CSVs
- connects to ERP data, likely via export or API
- detects:
  - settlement mismatches
  - missing payouts
  - stuck refunds
  - duplicate transactions
  - delayed settlement
  - amount/date/fee variances
- provides:
  - exception queue
  - transaction lineage view
  - rule/tolerance configuration
  - alerts/notifications
  - audit trail and resolution history

No generic ERP replacement. No treasury suite. No payment orchestration initially. No compliance theater. Those can be future expansion ideas only.

## What the product must do in detail
The product should be designed around these layers:

1. **Source ingestion layer**
   - Ingest raw data from Stripe, Adyen, bank files/feeds, and ERP records.
   - Handle both APIs and file-based ingestion.
   - Preserve raw payloads and source metadata.
   - Support idempotent ingestion and replay.

2. **Canonical normalization layer**
   - Convert all raw records into a canonical internal schema.
   - Include normalized entities for transactions, payouts, fees, reserves, refunds, chargebacks, bank movements, ERP postings.
   - Preserve source-specific IDs and relationship edges.

3. **Expectation engine**
   - From upstream events, create expected downstream events.
   - Example: if a payout batch is initiated, Atlas should expect a bank credit within a tolerance window and an ERP posting on an expected schedule.
   - This should be stateful and rule-driven.

4. **Matching engine**
   - Support deterministic matching first.
   - Handle one-to-one, one-to-many, many-to-one, many-to-many matching.
   - Apply tolerance rules for amount, date, fees, FX, reserves.
   - Create candidate matches and confidence scores for ambiguous cases.
   - Be conservative with auto-resolution.

5. **Exception engine**
   - Classify failures, not just “unmatched.”
   - Exception classes should include amount mismatch, date mismatch, missing downstream event, duplicate event, reserve variance, fee variance, ambiguous match, status conflict, missing metadata.
   - Rank by severity, amount, age, payout risk, and recurrence.

6. **Workflow / case management layer**
   - Every exception becomes a case.
   - Cases should support owners, statuses, notes, attachments/evidence, SLA timers, escalation, and structured resolution reasons.
   - This is where payment ops and finance teams work issues.

7. **Audit / evidence layer**
   - Track every ingestion, match, override, rule change, manual resolution, and approval.
   - Make it possible to generate close-ready and audit-ready evidence bundles.

8. **Intelligence feedback loop**
   - Every manual resolution should be recorded in structured form.
   - The system should later use this data for rule suggestions, candidate ranking, cause prediction, and anomaly clustering.
   - Do not design this as fully autonomous AI from day one.

## What I need from you
Produce a **full planning artifact** for building this product, including product design, frontend, backend, infrastructure, auth, CI/CD, and landing page.

I want you to think through:

### 1. Product spec
Create a clear, opinionated v1 product spec including:
- who the user is
- their workflow
- what the first five screens are
- what actions they can take
- what the success metrics are
- what the first customer says yes to

### 2. System architecture
Design the backend architecture in detail. Use **InsForge** as the backend platform if useful and possible.

Assume InsForge can provide:
- Postgres-based data layer
- authentication
- storage
- edge/serverless functions
- hosting/deployments
- AI gateway or model integrations if needed

Use this if it is the right fit, but do not force gimmicks. Architecture should remain credible for a fintech-grade internal tool.

I need:
- service/component breakdown
- data flow from ingestion to normalization to matching to exception creation
- background jobs / queue architecture
- what runs synchronously vs asynchronously
- cron/scheduler requirements
- webhook ingestion strategy
- file ingestion strategy
- failure handling strategy
- idempotency strategy
- audit logging strategy
- environment separation strategy

### 3. Database design
Design the schema at high detail.

I need proposed tables/entities for things like:
- organizations
- workspaces / accounts
- users / roles
- source integrations
- raw events
- normalized events
- expectations
- matching rules
- rule versions
- matches
- match candidates
- exception cases
- exception comments / actions
- audit logs
- notifications
- evidence bundles
- bank accounts
- PSP accounts
- ERP accounts / ledgers
- lineage edges

For each major table, describe:
- purpose
- important columns
- key indexes
- relationships
- security / access implications

### 4. Authentication and authorization
Use InsForge auth if appropriate. I need:
- auth strategy
- organization / tenant model
- RBAC design
- likely roles (admin, finance operator, reviewer, controller, auditor, engineer, read-only)
- session model
- invite flow
- SSO assumptions if relevant later
- secure handling of API keys / secrets

### 5. Integrations and APIs needed from my end
Be explicit about what **I** need to provide or gather.

List exactly what is needed for each source system:
- Stripe API keys / webhook config / relevant endpoints
- Adyen credentials / report access / webhook config / API scope assumptions
- bank data options: direct feed, Plaid-like provider, CSV/SFTP uploads, statement ingestion
- ERP integration assumptions: NetSuite API vs CSV import/export, journal access, cash account mapping
- email/slack notifications
- any secrets management or credential vaulting needs

For each integration, describe:
- minimum viable approach
- better long-term approach
- blockers / risks

### 6. Frontend application
Design the app UX and architecture.

I need:
- frontend stack recommendation
- information architecture
- route map
- component structure
- state management guidance
- data fetching approach
- handling of large tables / filters / drill-downs
- what the main views should look like
- what key charts / tables / cards are needed

Focus on the five core screens:
- reconciliation overview
- exception queue
- transaction lineage view
- rule/tolerance builder
- audit / close report

### 7. Landing page
Design a startup landing page for Atlas Ledger.

Need:
- messaging hierarchy
- hero headline options
- subheadline options
- proof / credibility sections
- product screenshots / demo sections
- “how it works” section
- ICP-focused copy
- CTA strategy
- minimalist but sharp B2B fintech design direction

The landing page should sound like a credible infrastructure company, not an AI wrapper.

### 8. CI/CD and dev workflow
Design a proper CI/CD and engineering workflow for a small startup shipping this.

Need:
- local dev setup
- staging vs production
- migrations flow
- test strategy
- unit/integration/e2e priorities
- seed data / fixtures strategy
- monitoring / observability
- deployment pipeline
- secret management
- auditability in CI/CD
- rollback strategy

Assume fintech-grade expectations, even if the first version is not fully enterprise certified.

### 9. Security and compliance posture
Do not overclaim compliance, but design responsibly.

Need:
- sensitive data handling principles
- encryption assumptions
- access control
- audit logging
- least privilege principles
- what should be avoided in v1
- what would be needed later for SOC 2 / stronger posture

### 10. Implementation plan
Give a real execution plan.

Need:
- recommended project structure
- milestones by week
- what a 2-week, 4-week, and 8-week version looks like
- what should be built first
- what can be stubbed or mocked
- what should be hardcoded in v1
- what should remain configurable
- what should explicitly wait until later

### 11. Crisp founder narrative
At the end, provide a short founder-quality narrative explaining:
- what Atlas Ledger is
- why it matters
- why now
- why the wedge is strong
- why this is hard to copy if executed deeply

## Constraints and instructions
- Be highly detailed.
- Prefer strong defaults over vague options.
- Separate what is needed for v1 vs later.
- Avoid generic startup filler.
- Avoid “AI for finance” fluff.
- Avoid recommending overengineered microservices unless truly necessary.
- Optimize for a small startup team building fast but credibly.
- If a decision is uncertain, state the assumption and proceed.
- Think in terms of painful workflows, not abstract platforms.
- Make the output something that a founder and engineer could actually build from.

## Desired output structure
Return your answer in the following structure:

1. Executive summary
2. Product thesis
3. ICP and user workflow
4. Detailed product spec
5. Core system architecture
6. Database schema proposal
7. Integrations and API requirements
8. Auth and RBAC
9. Frontend app architecture
10. Landing page spec
11. CI/CD and infra plan
12. Security and compliance posture
13. 2/4/8-week implementation plan
14. Key risks and open questions
15. Founder narrative

Be extremely concrete. If helpful, include tables, bullets, route trees, entity lists, lifecycle flows, and sample schemas. This should read like a serious internal planning memo for building Atlas Ledger from scratch.
