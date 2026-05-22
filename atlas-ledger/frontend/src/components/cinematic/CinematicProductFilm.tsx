import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CheckCircle2, BookText, AlertTriangle, PlayCircle,
  RefreshCw, Wifi, Clock, FileText, ArrowRight, Users, Send,
  GitBranch, Shield, Activity, ChevronRight, Zap, Database,
} from "lucide-react";

const SCENES = [
  { id: 0, label: "Ingest", title: "Financial data flows in" },
  { id: 1, label: "Reconcile", title: "Reconciliation engine" },
  { id: 2, label: "Disburse", title: "Disbursable funds" },
  { id: 3, label: "Prepare", title: "Payout preparation" },
  { id: 4, label: "Approve", title: "Approval workflows" },
  { id: 5, label: "Execute", title: "Payout execution" },
  { id: 6, label: "Ledger", title: "Operational ledger" },
] as const;

const SCENE_MS = 4800;

const ease = [0.16, 1, 0.3, 1] as const;

function ProductChrome({ children, url }: { children: React.ReactNode; url: string }) {
  return (
    <motion.div
      className="product-chrome w-full h-full flex flex-col"
      initial={{ opacity: 0, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <motion.div
        className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-dark)" }}
      >
        <motion.div className="flex gap-1.5">
          {["#3a3f4a", "#3a3f4a", "#3a3f4a"].map((c, i) => (
            <span key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </motion.div>
        <div
          className="ml-3 flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-medium ui-mono"
          style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-on-dark-muted)", border: "1px solid var(--border-dark)" }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--safe)" }}
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          {url}
        </div>
        <motion.div className="ml-auto flex items-center gap-3 text-[10px]" style={{ color: "var(--text-on-dark-muted)" }}>
          <span className="flex items-center gap-1"><RefreshCw size={10} /> Live sync</span>
          <span className="flex items-center gap-1"><Wifi size={10} /> 6 sources</span>
        </motion.div>
      </motion.div>
      <div className="flex flex-1 min-h-0">{children}</div>
    </motion.div>
  );
}

function Sidebar({ active }: { active: string }) {
  const items = [
    { icon: LayoutDashboard, label: "Command", key: "command" },
    { icon: CheckCircle2, label: "Readiness", key: "readiness" },
    { icon: GitBranch, label: "Lineage", key: "lineage" },
    { icon: AlertTriangle, label: "Exceptions", key: "exceptions" },
    { icon: PlayCircle, label: "Simulations", key: "sim" },
    { icon: BookText, label: "Ledger", key: "ledger" },
  ];
  return (
    <aside
      className="w-[148px] flex-shrink-0 py-4 px-2 flex flex-col"
      style={{ background: "rgba(0,0,0,0.2)", borderRight: "1px solid var(--border-dark)" }}
    >
      <motion.div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M7 2L12.5 11.5H1.5L7 2Z" stroke="var(--accent)" strokeWidth="1.2" />
          </svg>
        </div>
        <span className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--text-on-dark)" }}>Atlas</span>
      </motion.div>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2 px-2.5 py-2 rounded-md text-[10px] font-medium"
            style={
              active === item.key
                ? { background: "rgba(184,155,94,0.1)", color: "var(--accent-2)", border: "1px solid rgba(184,155,94,0.15)" }
                : { color: "var(--text-on-dark-muted)" }
            }
          >
            <item.icon size={12} /> {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ─── Scene 0: Incoming data ─────────────────────────────────── */
function SceneIngest() {
  const sources = [
    { name: "Stripe settlements", type: "API", status: "syncing" },
    { name: "Adyen payout batch", type: "File", status: "done" },
    { name: "Chase bank credits", type: "Bank", status: "syncing" },
    { name: "ERP GL export", type: "ERP", status: "queued" },
    { name: "Refund ledger", type: "Internal", status: "done" },
    { name: "Reserve adjustment", type: "Policy", status: "syncing" },
  ];
  return (
    <ProductChrome url="app.atlasledger.com / ingestion">
      <Sidebar active="command" />
      <main className="flex-1 p-5 flex flex-col gap-4 relative overflow-hidden">
        <div>
          <h3 className="text-[15px] font-medium mb-0.5" style={{ color: "var(--text-on-dark)" }}>Ingestion hub</h3>
          <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>6 financial systems · real-time sync</p>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {sources.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease }}
              className="p-3 rounded-lg flex items-start gap-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-dark)" }}
            >
              <FileText size={14} style={{ color: "var(--accent)", marginTop: 2 }} />
              <div className="flex-1 min-w-0">
                <motion.div className="text-[11px] font-medium truncate" style={{ color: "var(--text-on-dark)" }}>{s.name}</motion.div>
                <motion.div className="text-[9px] ui-mono mt-0.5" style={{ color: "var(--text-on-dark-muted)" }}>{s.type}</motion.div>
              </div>
              <motion.span
                className="text-[8px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: s.status === "done" ? "var(--safe-bg)" : "var(--accent-dim)",
                  color: s.status === "done" ? "var(--safe)" : "var(--accent-2)",
                }}
                animate={s.status === "syncing" ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {s.status}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-4 right-4 px-3 py-2 rounded-lg flex items-center gap-2 text-[10px]"
          style={{ background: "rgba(184,155,94,0.08)", border: "1px solid var(--accent-border)", color: "var(--accent-2)" }}
        >
          <Database size={12} /> Drag files or connect APIs
        </motion.div>
      </main>
    </ProductChrome>
  );
}

/* ─── Scene 1: Reconciliation ────────────────────────────────── */
function SceneReconcile() {
  const lines = [
    { t: "08:14:01", msg: "Bank credit matched — Chase $480K", ok: true },
    { t: "08:14:02", msg: "Settlement verified — Stripe batch #8842", ok: true },
    { t: "08:14:03", msg: "Refund exposure increased — $12K pending", ok: false, warn: true },
    { t: "08:14:04", msg: "Missing payout funding — Adyen reserve", ok: false, warn: true },
    { t: "08:14:05", msg: "Lineage path complete — 14 hops verified", ok: true },
  ];
  return (
    <ProductChrome url="app.atlasledger.com / reconciliation">
      <Sidebar active="lineage" />
      <main className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[15px] font-medium" style={{ color: "var(--text-on-dark)" }}>Reconciliation engine</h3>
            <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>Matching · verification · exceptions</p>
          </div>
          <span className="text-[10px] px-2 py-1 rounded ui-mono" style={{ background: "var(--partial-bg)", color: "var(--partial)", border: "1px solid var(--partial-border)" }}>
            87% matched
          </span>
        </div>
        <div className="flex-1 grid grid-cols-[1fr_120px] gap-3 min-h-0">
          <div className="rounded-lg p-3 relative overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-dark)" }}>
            <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
              <motion.path
                d="M20 80 Q120 20 200 60 T380 40"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="6 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease }}
              />
              <motion.path
                d="M20 120 Q150 100 280 90 T400 70"
                fill="none"
                stroke="var(--safe)"
                strokeWidth="1"
                strokeDasharray="6 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, delay: 0.3, ease }}
              />
            </svg>
            <div className="relative z-10 text-[9px] uppercase tracking-widest mb-2" style={{ color: "var(--text-on-dark-muted)" }}>Transaction lineage</div>
            {["Stripe → Bank", "Adyen → Reserve", "ERP → GL"].map((n, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.2 }}
                className="text-[10px] py-1.5 flex items-center gap-2"
                style={{ color: "var(--text-on-dark-muted)" }}
              >
                <ChevronRight size={10} style={{ color: "var(--accent)" }} /> {n}
              </motion.div>
            ))}
          </div>
          <motion.div
            className="rounded-lg p-2 flex flex-col justify-center items-center"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <RefreshCw size={18} className="animate-spin" style={{ color: "var(--accent)", animationDuration: "3s" }} />
            <span className="text-[9px] mt-2 font-medium" style={{ color: "var(--accent-2)" }}>Reconciling</span>
          </motion.div>
        </div>
        <motion.div className="rounded-lg p-2.5 space-y-1.5 max-h-[120px] overflow-hidden" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-dark)" }}>
          {lines.map((l, i) => (
            <motion.div
              key={l.t}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.35, duration: 0.4 }}
              className="flex gap-2 text-[10px] ui-mono"
            >
              <span style={{ color: "var(--text-on-dark-muted)" }}>{l.t}</span>
              <span style={{ color: l.ok ? "var(--safe)" : l.warn ? "var(--partial)" : "var(--blocked)" }}>{l.msg}</span>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </ProductChrome>
  );
}

/* ─── Scene 2: Disbursable funds ───────────────────────────── */
function SceneDisburse() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const rows = [
    { label: "Paper balance", value: "$2.41M", dim: false },
    { label: "Blocked — reserves", value: "−$280K", dim: true },
    { label: "Blocked — refunds", value: "−$120K", dim: true },
    { label: "Blocked — chargebacks", value: "−$48K", dim: true },
    { label: "Settlement timing", value: "−$32K", dim: true },
  ];

  return (
    <ProductChrome url="app.atlasledger.com / disbursement">
      <Sidebar active="readiness" />
      <main className="flex-1 p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-on-dark)" }}>Disbursable funds engine</h3>
          <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>What is actually safe to move</p>
        </div>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 0 ? 1 : 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex justify-between items-center py-2 px-3 rounded-lg"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-dark)" }}
            >
              <span className="text-[11px]" style={{ color: r.dim ? "var(--text-on-dark-muted)" : "var(--text-on-dark)" }}>{r.label}</span>
              <span className="text-[12px] ui-mono font-medium" style={{ color: r.dim ? "var(--blocked)" : "var(--text-on-dark)" }}>{r.value}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="mt-auto p-4 rounded-lg"
          style={{ background: "var(--safe-bg)", border: "1px solid var(--safe-border)" }}
          animate={{ scale: phase >= 2 ? [1, 1.01, 1] : 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--safe)" }}>Payoutable balance</div>
          <motion.div
            className="text-[28px] ui-mono font-medium tracking-tight"
            style={{ color: "var(--safe)" }}
            key={phase}
          >
            {phase < 2 ? "$2.41M" : "$1.93M"}
          </motion.div>
          {phase >= 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: "var(--text-on-dark-muted)" }}>
              <ArrowRight size={10} style={{ color: "var(--accent)" }} />
              <span>$480K held across reserves & exceptions</span>
            </motion.div>
          )}
        </motion.div>
      </main>
    </ProductChrome>
  );
}

/* ─── Scene 3: Payout preparation ──────────────────────────── */
function ScenePrepare() {
  const batches = [
    { entity: "US Marketplace", payees: 142, amount: "$840K", currency: "USD", score: 94 },
    { entity: "EU Partners", payees: 67, amount: "$520K", currency: "EUR", score: 88 },
    { entity: "APAC Sellers", payees: 31, amount: "$570K", currency: "USD", score: 72 },
  ];
  return (
    <ProductChrome url="app.atlasledger.com / payout-runs">
      <Sidebar active="readiness" />
      <main className="flex-1 p-5 flex flex-col gap-3">
        <motion.div>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-on-dark)" }}>Payout run builder</h3>
          <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>Batches · rules · routing · thresholds</p>
        </motion.div>
        {batches.map((b, i) => (
          <motion.div
            key={b.entity}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5, ease }}
            className="p-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-dark)" }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-[12px] font-medium" style={{ color: "var(--text-on-dark)" }}>{b.entity}</span>
              <span className="text-[10px] ui-mono px-1.5 py-0.5 rounded" style={{ background: "var(--accent-dim)", color: "var(--accent-2)" }}>{b.currency}</span>
            </div>
            <div className="flex justify-between text-[10px] mb-2" style={{ color: "var(--text-on-dark-muted)" }}>
              <span>{b.payees} payees</span>
              <span className="ui-mono font-medium" style={{ color: "var(--text-on-dark)" }}>{b.amount}</span>
            </div>
            <motion.div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: b.score > 85 ? "var(--safe)" : "var(--partial)" }}
                initial={{ width: 0 }}
                animate={{ width: `${b.score}%` }}
                transition={{ delay: 0.5 + i * 0.2, duration: 0.8, ease }}
              />
            </motion.div>
            <div className="text-[9px] mt-1" style={{ color: "var(--text-on-dark-muted)" }}>Readiness {b.score}%</div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-[10px] flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-dark)", color: "var(--text-on-dark-muted)" }}
        >
          <Shield size={11} style={{ color: "var(--accent)" }} /> Reserve policy applied · 3 entity rules matched
        </motion.div>
      </main>
    </ProductChrome>
  );
}

/* ─── Scene 4: Approvals ─────────────────────────────────────── */
function SceneApprove() {
  const approvals = [
    { role: "Finance Ops", status: "Approved", user: "M. Chen", time: "09:12" },
    { role: "Treasury", status: "Pending", user: "—", time: "—" },
    { role: "Reserve override", status: "Required", user: "Policy", time: "—" },
    { role: "Partial payout", status: "Approved", user: "A. Okonkwo", time: "09:18" },
  ];
  return (
    <ProductChrome url="app.atlasledger.com / approvals">
      <Sidebar active="command" />
      <main className="flex-1 p-5 flex flex-col gap-3">
        <motion.div>
          <h3 className="text-[15px] font-medium" style={{ color: "var(--text-on-dark)" }}>Maker-checker workflows</h3>
          <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>Collaborative payout authorization</p>
        </motion.div>
        {approvals.map((a, i) => (
          <motion.div
            key={a.role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.45, ease }}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-dark)" }}
          >
            <Users size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium" style={{ color: "var(--text-on-dark)" }}>{a.role}</div>
              <motion.div className="text-[10px]" style={{ color: "var(--text-on-dark-muted)" }}>{a.user} {a.time !== "—" && `· ${a.time}`}</motion.div>
            </div>
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-2 py-1 rounded"
              style={{
                background: a.status === "Approved" ? "var(--safe-bg)" : a.status === "Pending" ? "var(--partial-bg)" : "var(--blocked-bg)",
                color: a.status === "Approved" ? "var(--safe)" : a.status === "Pending" ? "var(--partial)" : "var(--blocked)",
                border: `1px solid ${a.status === "Approved" ? "var(--safe-border)" : a.status === "Pending" ? "var(--partial-border)" : "var(--blocked-border)"}`,
              }}
            >
              {a.status}
            </span>
          </motion.div>
        ))}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto w-full py-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-2"
          style={{ background: "var(--accent-dim)", color: "var(--accent-2)", border: "1px solid var(--accent-border)" }}
        >
          Route to Treasury <ChevronRight size={12} />
        </motion.button>
      </main>
    </ProductChrome>
  );
}

/* ─── Scene 5: Execution ─────────────────────────────────────── */
function SceneExecute() {
  const rails = [
    { rail: "ACH — US batch #4412", status: "Executing", pct: 78 },
    { rail: "Wire — EU settlement", status: "Queued", pct: 0 },
    { rail: "PSP disbursement — Stripe", status: "Complete", pct: 100 },
    { rail: "Bank instruction — Chase", status: "Executing", pct: 45 },
  ];
  return (
    <ProductChrome url="app.atlasledger.com / execution">
      <Sidebar active="ledger" />
      <main className="flex-1 p-5 flex flex-col gap-3">
        <motion.div className="flex justify-between">
          <motion.div>
            <h3 className="text-[15px] font-medium" style={{ color: "var(--text-on-dark)" }}>Payout execution</h3>
            <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>Rails · batches · orchestration</p>
          </motion.div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
            <Zap size={16} style={{ color: "var(--accent)" }} />
          </motion.div>
        </motion.div>
        {rails.map((r, i) => (
          <motion.div
            key={r.rail}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.12 }}
            className="p-3 rounded-lg"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-dark)" }}
          >
            <div className="flex justify-between mb-2">
              <span className="text-[11px] flex items-center gap-1.5" style={{ color: "var(--text-on-dark)" }}>
                <Send size={11} style={{ color: "var(--accent)" }} /> {r.rail}
              </span>
              <span
                className="text-[9px] uppercase font-semibold"
                style={{ color: r.status === "Complete" ? "var(--safe)" : r.status === "Executing" ? "var(--accent-2)" : "var(--text-on-dark-muted)" }}
              >
                {r.status}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full"
                style={{ background: r.pct === 100 ? "var(--safe)" : "var(--accent)" }}
                initial={{ width: 0 }}
                animate={{ width: `${r.pct}%` }}
                transition={{ delay: 0.3 + i * 0.15, duration: 1, ease }}
              />
            </div>
          </motion.div>
        ))}
        <motion.div
          className="mt-auto p-3 rounded-lg ui-mono text-[11px]"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-dark)", color: "var(--safe)" }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          $1.93M in flight across 4 rails
        </motion.div>
      </main>
    </ProductChrome>
  );
}

/* ─── Scene 6: Live ledger ───────────────────────────────────── */
function SceneLedger() {
  const entries = [
    { id: "PAY-8842", status: "Completed", amount: "$840K", type: "safe" },
    { id: "PAY-8843", status: "Failed", amount: "$12K", type: "blocked" },
    { id: "PAY-8844", status: "Retry queued", amount: "$48K", type: "partial" },
    { id: "REC-1201", status: "Drift detected", amount: "$8K", type: "partial" },
    { id: "BLK-0091", status: "Funds held", amount: "$480K", type: "blocked" },
  ];
  const statusColor = (t: string) =>
    t === "safe" ? "var(--safe)" : t === "partial" ? "var(--partial)" : "var(--blocked)";

  return (
    <ProductChrome url="app.atlasledger.com / operational-ledger">
      <Sidebar active="ledger" />
      <main className="flex-1 p-5 flex flex-col gap-3 min-h-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[15px] font-medium" style={{ color: "var(--text-on-dark)" }}>Operational ledger</h3>
            <p className="text-[11px]" style={{ color: "var(--text-on-dark-muted)" }}>Live · auditable · operational</p>
          </div>
          <Activity size={14} style={{ color: "var(--safe)" }} className="animate-pulse-soft" />
        </div>
        <div className="flex-1 overflow-hidden rounded-lg" style={{ border: "1px solid var(--border-dark)" }}>
          <div className="grid grid-cols-[80px_1fr_70px_80px] gap-2 px-3 py-2 text-[9px] uppercase tracking-wider" style={{ background: "rgba(0,0,0,0.3)", color: "var(--text-on-dark-muted)" }}>
            <span>ID</span><span>Status</span><span>Amount</span><span>State</span>
          </div>
          {entries.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="grid grid-cols-[80px_1fr_70px_80px] gap-2 px-3 py-2.5 text-[10px] items-center"
              style={{ borderTop: "1px solid var(--border-dark)" }}
            >
              <span className="ui-mono" style={{ color: "var(--text-on-dark-muted)" }}>{e.id}</span>
              <span style={{ color: "var(--text-on-dark)" }}>{e.status}</span>
              <span className="ui-mono" style={{ color: "var(--text-on-dark)" }}>{e.amount}</span>
              <span className="w-1.5 h-1.5 rounded-full justify-self-end" style={{ background: statusColor(e.type) }} />
            </motion.div>
          ))}
        </div>
        <motion.div
          className="flex gap-4 text-[10px] pt-1"
          style={{ color: "var(--text-on-dark-muted)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span><CheckCircle2 size={10} className="inline mr-1" style={{ color: "var(--safe)" }} /> 3 completed</span>
          <span><AlertTriangle size={10} className="inline mr-1" style={{ color: "var(--partial)" }} /> 2 pending</span>
          <span><Clock size={10} className="inline mr-1" /> Live audit stream</span>
        </motion.div>
      </main>
    </ProductChrome>
  );
}

const SCENE_COMPONENTS = [
  SceneIngest,
  SceneReconcile,
  SceneDisburse,
  ScenePrepare,
  SceneApprove,
  SceneExecute,
  SceneLedger,
];

export default function CinematicProductFilm() {
  const [scene, setScene] = useState(0);
  const [progress, setProgress] = useState(0);

  const advance = useCallback(() => {
    setScene((s) => (s + 1) % SCENES.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / SCENE_MS) * 100, 100));
      if (elapsed >= SCENE_MS) advance();
    }, 50);
    return () => clearInterval(tick);
  }, [scene, advance]);

  const SceneComponent = SCENE_COMPONENTS[scene];
  const meta = SCENES[scene];

  return (
    <section id="product-film" className="relative py-20 lg:py-28 overflow-hidden" style={{ zIndex: 1 }}>
      <motion.div className="divider absolute top-0 left-0 right-0" />

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-12 lg:mb-16 max-w-2xl mx-auto"
        >
          <span className="section-label mb-5">End-to-end operations</span>
          <h2
            className="text-[32px] sm:text-[40px] lg:text-[48px] font-medium mb-5"
            style={{ letterSpacing: "-0.04em", color: "var(--text-primary)" }}
          >
            Payout operations,<br />
            <span className="text-gradient">orchestrated in one system.</span>
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            From fragmented financial data to executed payouts and a live operational ledger —
            Atlas Ledger runs the full workflow with institutional precision.
          </p>
        </motion.div>

        {/* Scene title + progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="flex items-center gap-3"
            >
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded"
                style={{ background: "var(--accent-dim)", color: "var(--accent-deep)", border: "1px solid var(--accent-border)" }}
              >
                {meta.label}
              </span>
              <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {meta.title}
              </span>
            </motion.div>
          </AnimatePresence>

          <motion.div className="flex gap-1.5">
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setScene(s.id); setProgress(0); }}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: scene === s.id ? 32 : 12,
                  background: scene === s.id ? "var(--accent)" : "var(--border-2)",
                  opacity: scene === s.id ? 1 : 0.6,
                }}
                aria-label={`Scene ${s.label}`}
              />
            ))}
          </motion.div>
        </div>

        {/* Film frame */}
        <motion.div
          className="relative rounded-[20px] overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #12151c 0%, var(--void) 50%, #0a0c10 100%)",
            boxShadow: "var(--shadow-product)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease }}
        >
          {/* Subtle scan line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-[0.03]">
            <div className="absolute inset-x-0 h-px bg-white" style={{ animation: "scan-line 4s ease-in-out infinite" }} />
          </div>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-30" style={{ background: "rgba(255,255,255,0.04)" }}>
            <motion.div
              className="h-full"
              style={{ background: "var(--accent)", width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>

          <div className="relative aspect-[16/10] sm:aspect-[16/9] min-h-[420px] max-h-[720px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={scene}
                className="absolute inset-0 p-3 sm:p-5"
                initial={{ opacity: 0, scale: 0.99, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.01, filter: "blur(4px)" }}
                transition={{ duration: 0.55, ease }}
              >
                <SceneComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom vignette */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(13,16,22,0.9), transparent)" }}
          />
        </motion.div>

        {/* Capability strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
        >
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setScene(s.id); setProgress(0); }}
              className="text-left px-3 py-2.5 rounded-lg transition-all duration-200"
              style={{
                background: scene === s.id ? "var(--surface)" : "transparent",
                border: `1px solid ${scene === s.id ? "var(--border-2)" : "var(--border)"}`,
                color: scene === s.id ? "var(--text-primary)" : "var(--text-tertiary)",
              }}
            >
              <div className="text-[9px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: scene === s.id ? "var(--accent-deep)" : "inherit" }}>
                {String(s.id + 1).padStart(2, "0")}
              </div>
              <motion.div className="text-[11px] font-medium">{s.label}</motion.div>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
