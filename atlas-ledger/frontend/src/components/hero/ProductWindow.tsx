import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, CheckCircle2, BookText, AlertTriangle, PlayCircle, FileBarChart2, RefreshCw, Wifi, Clock, AlertCircle, ArrowDownToLine, ShieldAlert } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ReconciliationLog } from "./ReconciliationLog";
import { ChartSystem } from "./ChartSystem";
import { DecisionEngine } from "./DecisionEngine";
import { TransactionLineage } from "./TransactionLineage";

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: CheckCircle2,    label: "Payout Readiness", active: true },
  { icon: BookText,        label: "Ledger" },
  { icon: AlertTriangle,   label: "Exceptions" },
  { icon: PlayCircle,      label: "Simulations" },
  { icon: FileBarChart2,   label: "Reports" },
];

export function ProductWindow({ step }: { step: number }) {
  const isSyncing = step === 5;
  const isComplete = step >= 6;
  const hasException = step >= 7;

  const balancePaper = step >= 6 ? "$2.41M" : "$1.20M";
  const balanceSafe = step >= 6 ? "$1.93M" : "$1.10M";
  const blockedFunds = step >= 7 ? "$480K" : "$100K";

  return (
    <div className="relative w-full h-[640px] rounded-[24px] overflow-hidden bg-white shadow-xl border border-black/10 flex flex-col">
      {/* Chrome Bar */}
      <div style={{ background: "#FDFDFD", borderBottom: `1px solid rgba(0,0,0,0.04)` }} className="flex items-center gap-2 px-4 py-3 flex-shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
        </div>
        <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-[4px] text-[10px] font-medium bg-black/5 text-black/40 border border-black/5">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-[#4A8C6A]" animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          app.atlasledger.com / reconciliation
        </div>
        <div className="ml-auto flex items-center gap-3 text-[10px] text-black/40">
          <span className="flex items-center gap-1.5"><RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} style={{ color: isSyncing ? "var(--accent)" : "currentColor" }} /> {isSyncing ? "Reconciling..." : "Live"}</span>
          <span className="flex items-center gap-1.5"><Wifi size={10} /> Connected (3 PSPs)</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        <aside className="w-[180px] flex-shrink-0 py-4 px-3 flex flex-col bg-[#FAFAFA] border-r border-black/5">
          <div className="flex items-center gap-2.5 px-2 mb-8 mt-2">
            <div className="w-6 h-6 rounded-[4px] flex items-center justify-center bg-black">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 2L12.5 11.5H1.5L7 2Z" fill="none" stroke="white" strokeWidth="1.5" /></svg>
            </div>
            <span className="text-[13px] font-semibold text-black tracking-wide">Atlas Ledger</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[6px] text-[11px] font-medium transition-colors"
                style={item.active ? { background: "rgba(184,155,94,0.08)", color: "var(--partial)", border: "1px solid rgba(184,155,94,0.15)" } : { color: "var(--text-secondary)" }}>
                <item.icon size={14} /> {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-6 flex flex-col gap-4 bg-white relative overflow-hidden min-w-[480px]">
          
          {/* Magnetic Dropzone Overlay */}
          <AnimatePresence>
            {(step === 3 || step === 4) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-4 z-30 rounded-[16px] border-2 border-dashed flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
                style={{ borderColor: step === 4 ? "var(--safe)" : "var(--accent)" }}
              >
                {step === 4 ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <CheckCircle2 size={32} className="text-[#4A8C6A] mb-3" />
                    <div className="text-[14px] font-semibold text-[#4A8C6A]">Ledger updated</div>
                  </motion.div>
                ) : (
                  <motion.div className="flex flex-col items-center" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    <ArrowDownToLine size={32} style={{ color: "var(--accent)", marginBottom: 12 }} />
                    <div className="text-[14px] font-semibold" style={{ color: "var(--accent)" }}>Drop financial files to reconcile</div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-[18px] font-semibold text-black mb-1">Payout Readiness</h2>
              <div className="text-[11px] flex items-center gap-2 text-black/40">
                <Clock size={10} /> Last reconciliation: {isComplete ? "Just now" : "2 hrs ago"}
              </div>
            </div>
            <motion.div 
              className="px-3 py-1.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border"
              style={{
                background: isComplete ? "rgba(168,139,82,0.06)" : "rgba(62,107,82,0.06)",
                color: isComplete ? "var(--partial)" : "var(--safe)",
                borderColor: isComplete ? "rgba(168,139,82,0.2)" : "rgba(62,107,82,0.2)"
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: isComplete ? "var(--partial)" : "var(--safe)" }} />
              {isComplete ? "PARTIAL" : "SAFE"}
            </motion.div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard label="Paper Balance" value={balancePaper} valueColor="var(--text-primary)" />
            <MetricCard label="Payoutable" value={balanceSafe} valueColor="var(--safe)" icon={CheckCircle2} iconColor="text-[#4A8C6A]" />
            <MetricCard label="Blocked Funds" value={blockedFunds} valueColor={hasException ? "var(--blocked)" : "var(--text-secondary)"} icon={AlertCircle} iconColor={hasException ? "text-[#8C4A4A]" : "text-black/40"} />
          </div>

          <ChartSystem step={step} />

          <ReconciliationLog step={step} />
        </main>

        {/* Context Sidebar (Right) */}
        <aside className="w-[260px] flex-shrink-0 bg-[#FAFAFA] border-l border-black/5 p-5 flex flex-col gap-4">
          <DecisionEngine step={step} />
          <TransactionLineage step={step} />
        </aside>
      </div>

      {/* Exception Popout - Re-styled as a floating alert over the chart */}
      <AnimatePresence>
        {hasException && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-[204px] right-[284px] bottom-6 p-4 rounded-[16px] z-40 shadow-2xl bg-white/95 backdrop-blur-md flex items-center gap-4 border"
            style={{ borderColor: `rgba(140,74,74,0.3)`, boxShadow: "0 16px 48px rgba(140,74,74,0.15)" }}
          >
            <div className="w-10 h-10 rounded-full bg-[#8C4A4A]/10 flex items-center justify-center flex-shrink-0 text-[#8C4A4A]">
              <ShieldAlert size={18} />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C4A4A] block mb-0.5">Missing Settlement</span>
              <p className="text-[12px] leading-relaxed text-black/80">
                A <strong>$480K bank credit</strong> from Chase failed to reconcile against expected PSP settlements.
              </p>
            </div>
            <button className="px-4 py-2.5 rounded-[4px] text-[11px] font-bold tracking-wide uppercase transition-colors text-white shadow-sm hover:opacity-90 bg-[#8C4A4A] flex-shrink-0 whitespace-nowrap">
              Hold Payout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
