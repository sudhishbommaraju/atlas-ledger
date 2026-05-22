import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  LayoutDashboard, CheckCircle2, BookText, AlertTriangle, PlayCircle,
  RefreshCw, Wifi, Clock, FileText, ArrowDownToLine, Wand2, FileBarChart2,
  Send, Users, Activity,   MousePointer2,
} from "lucide-react";
import { LOOP_MS, getWorkflowSnapshot, type WorkflowSnapshot } from "./timeline";

const FILES = [
  { name: "stripe_settlement.csv", source: "Stripe", rot: -8, offset: 0 },
  { name: "adyen_batch.json", source: "Adyen", rot: -3, offset: 1 },
  { name: "chase_bank_credit.csv", source: "Chase", rot: 2, offset: 2 },
  { name: "refund_export.csv", source: "PSP", rot: 5, offset: 3 },
  { name: "payout_obligations.xlsx", source: "Finance", rot: 8, offset: 4 },
];

const REPORTS = [
  "Payout readiness report",
  "Reconciliation summary",
  "Exception summary",
  "Blocked funds analysis",
  "Payout recommendation",
];

const APPROVALS = [
  { role: "Finance Ops", status: "Approved" },
  { role: "Treasury", status: "Approved" },
  { role: "Reserve policy", status: "Override applied" },
];

const ease = [0.16, 1, 0.3, 1] as const;

function useWorkflowTime() {
  const progress = useMotionValue(0);
  const [snap, setSnap] = useState<WorkflowSnapshot>(() => getWorkflowSnapshot(0));

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: LOOP_MS / 1000,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
    });
    const unsub = progress.on("change", (v) => setSnap(getWorkflowSnapshot(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [progress]);

  return { progress, snap };
}

function FileStack({ snap }: { snap: WorkflowSnapshot }) {
  if (!snap.filesVisible && !snap.cursor.dragging) return null;

  return (
  <>
      {FILES.map((f, i) => {
        const isTop = i === FILES.length - 1;
        const following = isTop && snap.draggedFileOffset;

        return (
          <motion.div
            key={f.name}
            className="absolute z-30 pointer-events-none"
            style={{
              left: following ? `${snap.draggedFileOffset!.x}%` : `${6 + i * 2}%`,
              top: following ? `${snap.draggedFileOffset!.y}%` : `${52 + i * 3}%`,
              transform: following
                ? "translate(-50%, -50%) rotate(6deg) scale(0.92)"
                : `rotate(${f.rot}deg)`,
              opacity: following ? 1 : snap.filesVisible ? 1 - i * 0.12 : 0,
              zIndex: following ? 60 : 20 + i,
            }}
            animate={{
              opacity: following ? 1 : snap.filesVisible ? 1 - i * 0.1 : 0,
              y: snap.filesVisible && !following ? [0, -3, 0] : 0,
            }}
            transition={{
              opacity: { duration: 0.4 },
              y: { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div
              className="w-[168px] p-2.5 rounded-xl flex items-center gap-2"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-2)",
                boxShadow: "0 8px 28px rgba(17,17,17,0.1), 0 1px 0 rgba(255,255,255,0.9) inset",
              }}
            >
              <motion.div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "var(--ink-2)" }}>
                <FileText size={13} style={{ color: "var(--accent)" }} />
              </motion.div>
              <div className="min-w-0">
                <div className="text-[9px] ui-mono font-medium truncate" style={{ color: "var(--text-primary)" }}>{f.name}</div>
                <div className="text-[8px]" style={{ color: "var(--text-tertiary)" }}>{f.source}</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}

function WorkflowCursor({ snap }: { snap: WorkflowSnapshot }) {
  const { cursor } = snap;
  if (!cursor.visible) return null;

  return (
    <motion.div
      className="absolute z-[70] pointer-events-none"
      style={{
        left: `${cursor.x}%`,
        top: `${cursor.y}%`,
        transform: `translate(-4px, -4px) scale(${cursor.pressing ? 0.88 : 1})`,
      }}
    >
      <MousePointer2
        size={28}
        fill="var(--text-primary)"
        stroke="var(--surface)"
        strokeWidth={1}
        style={{ filter: "drop-shadow(0 4px 12px rgba(17,17,17,0.2))" }}
      />
      {cursor.pressing && (
        <motion.span
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full"
          style={{ background: "var(--accent)", opacity: 0.35 }}
          initial={{ scale: 0 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}

function ProductUI({ snap }: { snap: WorkflowSnapshot }) {
  const showDropzone = snap.dropzone !== "hidden" && snap.dropzone !== "reconciled";
  const dropDone = snap.dropzone === "reconciled";

  return (
    <div
      className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-2)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid var(--border)", background: "var(--ink-4)" }}>
        <div className="flex gap-1.5">
          {["#E8E4DE", "#E8E4DE", "#E8E4DE"].map((c, i) => (
            <span key={i} className="w-2 h-2 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div
          className="ml-3 flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-medium ui-mono"
          style={{ background: "var(--ink-2)", color: "var(--text-tertiary)", border: "1px solid var(--border)" }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--safe)" }}
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {snap.url}
        </div>
        <motion.div className="ml-auto flex items-center gap-3 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          <span className="flex items-center gap-1">
            <RefreshCw size={10} className={snap.t >= 0.22 && snap.t < 0.5 ? "animate-spin" : ""} style={{ animationDuration: "2s" }} />
            Live sync
          </span>
          <span className="flex items-center gap-1"><Wifi size={10} /> 6 sources</span>
        </motion.div>
      </div>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[140px] flex-shrink-0 py-3 px-2" style={{ background: "var(--ink-4)", borderRight: "1px solid var(--border)" }}>
          {[
            { icon: LayoutDashboard, label: "Overview", key: "overview" },
            { icon: CheckCircle2, label: "Readiness", key: "readiness" },
            { icon: BookText, label: "Ledger", key: "ledger" },
            { icon: AlertTriangle, label: "Exceptions", key: "exceptions" },
            { icon: PlayCircle, label: "Simulations", key: "sim" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-2 px-2 py-2 rounded-md text-[10px] font-medium mb-0.5"
              style={
                snap.activeSidebar === item.key
                  ? { background: "var(--accent-dim)", color: "var(--accent-deep)", border: "1px solid var(--accent-border)" }
                  : { color: "var(--text-tertiary)" }
              }
            >
              <item.icon size={12} /> {item.label}
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4 flex flex-col gap-3 relative overflow-hidden min-w-0">
          {/* Drop zone overlay */}
          {showDropzone && (
            <motion.div
              className="absolute inset-3 z-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center"
              style={{
                borderColor: snap.dropzone === "hover" ? "var(--accent)" : snap.dropzone === "processing" ? "var(--safe)" : "var(--border-2)",
                background: snap.dropzone === "processing" ? "rgba(115,139,106,0.06)" : "rgba(247,245,242,0.92)",
                backdropFilter: "blur(8px)",
              }}
              animate={snap.dropzone === "hover" ? { scale: [1, 1.008, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              {snap.dropzone === "processing" ? (
                <>
                  <RefreshCw size={28} className="animate-spin mb-2" style={{ color: "var(--safe)", animationDuration: "1.5s" }} />
                  <span className="text-[13px] font-medium" style={{ color: "var(--safe)" }}>Reconciling files…</span>
                </>
              ) : (
                <>
                  <ArrowDownToLine size={28} className="mb-2" style={{ color: "var(--accent)" }} />
                  <span className="text-[13px] font-medium" style={{ color: "var(--accent-deep)" }}>Drop financial files to reconcile</span>
                  <span className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                    {snap.dropzone === "hover" ? "Release to ingest" : "Stripe · Adyen · Bank · ERP"}
                  </span>
                </>
              )}
            </motion.div>
          )}

          {/* Header + KPIs */}
          <div className="flex justify-between items-start flex-shrink-0">
            <div>
              <h3 className="text-[15px] font-medium" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Payout readiness</h3>
              <div className="text-[10px] flex items-center gap-1.5 mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                <Clock size={10} /> Audit ID: ATL-{Math.floor(8840 + snap.t * 12)} · {snap.phaseLabel}
              </div>
            </div>
            <motion.div
              className="px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5"
              style={{
                background: snap.fixesApplied ? "var(--safe-bg)" : snap.exceptions > 0 ? "var(--partial-bg)" : "var(--safe-bg)",
                color: snap.fixesApplied ? "var(--safe)" : snap.exceptions > 0 ? "var(--partial)" : "var(--safe)",
                border: `1px solid ${snap.fixesApplied ? "var(--safe-border)" : snap.exceptions > 0 ? "var(--partial-border)" : "var(--safe-border)"}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
              {snap.fixesApplied ? "SAFE" : snap.exceptions > 0 ? "PARTIAL" : "SAFE"}
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            {[
              { label: "Paper balance", value: "$2.41M", color: "var(--text-primary)" },
              { label: "Payoutable", value: snap.payoutable, color: "var(--safe)" },
              { label: "Blocked", value: snap.blocked, color: snap.exceptions > 0 ? "var(--blocked)" : "var(--text-tertiary)" },
            ].map((m) => (
              <motion.div
                key={m.label}
                className="p-2.5 rounded-lg"
                style={{ background: "var(--ink-4)", border: "1px solid var(--border)" }}
                layout
              >
                <motion.div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>{m.label}</motion.div>
                <motion.div className="text-[16px] ui-mono font-medium tabular-nums" style={{ color: m.color }} layout>
                  {m.value}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Reconcile % bar */}
          {dropDone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex-shrink-0"
            >
              <motion.div className="flex justify-between text-[9px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                <span>Reconciliation completeness</span>
                <span className="ui-mono font-medium" style={{ color: "var(--accent-deep)" }}>{snap.reconcilePct}%</span>
              </motion.div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--ink-3)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--accent-3), var(--accent))" }}
                  animate={{ width: `${snap.reconcilePct}%` }}
                  transition={{ duration: 0.6, ease }}
                />
              </div>
            </motion.div>
          )}

          {/* Main content area — morphs continuously */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2 min-h-0 overflow-hidden">
            {/* Log + actions */}
            <div className="flex flex-col gap-2 min-h-0">
              <div
                className="flex-1 rounded-lg p-2.5 overflow-hidden flex flex-col min-h-[100px]"
                style={{ background: "var(--ink-4)", border: "1px solid var(--border)" }}
              >
                <div className="text-[9px] uppercase tracking-widest mb-2 flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                  Operational log
                </div>
                <div className="space-y-1 overflow-hidden flex-1">
                  {snap.logLines.map((line) => (
                    <motion.div
                      key={line.time + line.text}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 text-[10px] ui-mono"
                    >
                      <span style={{ color: "var(--text-dim)" }}>{line.time}</span>
                      <span style={{ color: line.type === "ok" ? "var(--safe)" : line.type === "warn" ? "var(--partial)" : "var(--text-secondary)" }}>
                        {line.type === "ok" ? "✓ " : line.type === "warn" ? "⚠ " : ""}{line.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action buttons — cursor targets */}
              <motion.div className="flex flex-wrap gap-1.5 flex-shrink-0">
                <ActionBtn
                  id="btn-report"
                  icon={FileBarChart2}
                  label="Generate operational report"
                  active={snap.t >= 0.52 && snap.t < 0.58}
                  done={snap.reportPhase === "ready"}
                  sub={snap.reportPhase === "processing" ? "Processing…" : snap.reportPhase === "compiled" ? "Compiled" : snap.reportPhase === "ready" ? "Ready" : undefined}
                />
                <ActionBtn
                  id="btn-fixes"
                  icon={Wand2}
                  label="Apply recommended fixes"
                  active={snap.t >= 0.62 && snap.t < 0.66}
                  done={snap.fixesApplied}
                />
                <ActionBtn
                  id="btn-execute"
                  icon={Send}
                  label="Execute payout run"
                  active={snap.t >= 0.76 && snap.t < 0.8}
                  done={snap.executionProgress >= 99}
                />
              </motion.div>
            </div>

            {/* Right panel — reports / approvals / execution / ledger */}
            <div className="flex flex-col gap-2 min-h-0 overflow-hidden">
              {snap.reportsVisible > 0 && (
                <motion.div
                  className="rounded-lg p-2 flex-shrink-0 max-h-[88px] overflow-hidden"
                  style={{ background: "var(--ink-4)", border: "1px solid var(--border)" }}
                  layout
                >
                  <div className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "var(--text-tertiary)" }}>Reports</div>
                  {REPORTS.slice(0, snap.reportsVisible).map((r, i) => (
                    <motion.div
                      key={r}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-1.5 text-[10px] py-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <CheckCircle2 size={10} style={{ color: "var(--safe)" }} /> {r}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {snap.exceptions > 0 && !snap.fixesApplied && (
                <motion.div
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ background: "var(--blocked-bg)", border: "1px solid var(--blocked-border)" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: "var(--blocked)" }}>
                    <AlertTriangle size={11} /> {snap.exceptions} exceptions · Chase credit missing
                  </div>
                </motion.div>
              )}

              {snap.fixesApplied && snap.exceptions === 0 && snap.t >= 0.66 && snap.t < 0.78 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-2 rounded-lg text-[10px] flex-shrink-0"
                  style={{ background: "var(--safe-bg)", border: "1px solid var(--safe-border)", color: "var(--safe)" }}
                >
                  <CheckCircle2 size={11} className="inline mr-1" /> Auto-fixes applied · readiness +$320K
                </motion.div>
              )}

              {snap.approvalStep > 0 && snap.t >= 0.68 && snap.t < 0.8 && (
                <motion.div className="rounded-lg p-2 space-y-1 flex-shrink-0" style={{ background: "var(--ink-4)", border: "1px solid var(--border)" }}>
                  <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)" }}>Approval chain</div>
                  {APPROVALS.slice(0, snap.approvalStep).map((a) => (
                    <motion.div key={a.role} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[10px]">
                      <Users size={10} style={{ color: "var(--accent)" }} />
                      <span style={{ color: "var(--text-secondary)" }}>{a.role}</span>
                      <span className="ml-auto text-[9px] font-semibold" style={{ color: "var(--safe)" }}>{a.status}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {snap.executionProgress > 0 && snap.t >= 0.76 && (
                <motion.div className="rounded-lg p-2 flex-shrink-0" style={{ background: "var(--ink-4)", border: "1px solid var(--border)" }}>
                  <div className="flex justify-between text-[9px] mb-1" style={{ color: "var(--text-tertiary)" }}>
                    <span>Payout orchestration</span>
                    <span className="ui-mono">{Math.round(snap.executionProgress)}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--ink-3)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: "var(--accent)" }} animate={{ width: `${snap.executionProgress}%` }} />
                  </div>
                </motion.div>
              )}

              {snap.ledgerRows.length > 0 && (
                <motion.div
                  className="flex-1 rounded-lg overflow-hidden flex flex-col min-h-0"
                  style={{ background: "var(--ink-4)", border: "1px solid var(--border)" }}
                  layout
                >
                  <div className="px-2 py-1.5 flex items-center gap-1.5 text-[9px] uppercase tracking-widest flex-shrink-0" style={{ background: "var(--ink-3)", color: "var(--text-tertiary)" }}>
                    <Activity size={10} /> Live operational ledger
                  </div>
                  {snap.ledgerRows.map((row) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-[72px_1fr_56px_8px] gap-1 px-2 py-1.5 text-[9px] items-center"
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <span className="ui-mono" style={{ color: "var(--text-tertiary)" }}>{row.id}</span>
                      <span style={{ color: "var(--text-secondary)" }}>{row.status}</span>
                      <span className="ui-mono text-right" style={{ color: "var(--text-primary)" }}>{row.amount}</span>
                      <span className="w-1.5 h-1.5 rounded-full justify-self-end" style={{ background: row.state === "safe" ? "var(--safe)" : row.state === "partial" ? "var(--partial)" : "var(--blocked)" }} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  active,
  done,
  sub,
}: {
  id?: string;
  icon: typeof FileBarChart2;
  label: string;
  active?: boolean;
  done?: boolean;
  sub?: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-medium max-w-full"
      style={{
        background: active ? "var(--accent-dim)" : done ? "var(--safe-bg)" : "var(--surface)",
        border: `1px solid ${active ? "var(--accent-border)" : done ? "var(--safe-border)" : "var(--border)"}`,
        color: active ? "var(--accent-deep)" : done ? "var(--safe)" : "var(--text-secondary)",
        boxShadow: active ? "0 0 0 2px rgba(184,155,94,0.15)" : "none",
      }}
      animate={active ? { scale: [1, 0.98, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Icon size={11} />
      <span className="truncate">{label}</span>
      {sub && <span className="opacity-70">· {sub}</span>}
    </motion.div>
  );
}

export default function CinematicWorkflowFilm() {
  const { progress, snap } = useWorkflowTime();
  const stageRef = useRef<HTMLDivElement>(null);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);

  return (
    <section id="product-film" className="relative py-16 lg:py-24 overflow-hidden" style={{ zIndex: 1 }}>
      <div className="divider absolute top-0 left-0 right-0" />

      <div className="relative mx-auto max-w-[1180px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="text-center mb-10 max-w-2xl mx-auto"
        >
          <span className="section-label mb-4">Live workflow</span>
          <h2 className="text-[30px] sm:text-[38px] lg:text-[44px] font-medium mb-4" style={{ letterSpacing: "-0.04em" }}>
            Watch Atlas run payout operations<br />
            <span className="text-gradient">in real time.</span>
          </h2>
          <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            One continuous operational sequence — ingest, reconcile, fix, approve, execute, and ledger update.
          </p>
        </motion.div>

        {/* Live phase indicator */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--safe)" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.span
            key={snap.phaseLabel}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium uppercase tracking-[0.12em]"
            style={{ color: "var(--accent-deep)" }}
          >
            {snap.phaseLabel}
          </motion.span>
        </div>

        {/* Stage with camera */}
        <motion.div
          ref={stageRef}
          className="relative mx-auto rounded-[22px] overflow-visible"
          style={{
            aspectRatio: "16 / 10",
            maxHeight: "min(72vh, 680px)",
            background: "linear-gradient(165deg, var(--ink-3) 0%, var(--ink) 45%, var(--ink-2) 100%)",
            border: "1px solid var(--border-2)",
            boxShadow: "var(--shadow-card)",
          }}
          animate={{
            scale: snap.camera.scale,
            x: snap.camera.x,
            y: snap.camera.y,
          }}
          transition={{ type: "spring", stiffness: 40, damping: 28 }}
        >
          <div className="absolute inset-3 sm:inset-5">
            <div className="relative w-full h-full">
              {/* Product — right weighted */}
              <motion.div
                className="absolute z-10"
                style={{ left: "18%", right: "2%", top: "6%", bottom: "6%" }}
              >
                <ProductUI snap={snap} />
              </motion.div>

              <FileStack snap={snap} />
              <WorkflowCursor snap={snap} />
            </div>
          </div>

          {/* Progress */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "var(--border)" }}>
            <motion.div className="h-full" style={{ background: "var(--accent)", width: progressWidth }} />
          </div>
        </motion.div>

        <p className="text-center mt-6 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          36s seamless loop · cursor-driven · no cuts
        </p>
      </div>
    </section>
  );
}
