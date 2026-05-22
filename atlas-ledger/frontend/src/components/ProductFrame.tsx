import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, CheckCircle2, BookText, AlertTriangle,
  PlayCircle, FileBarChart2, AlertCircle, DollarSign,
  Clock, Wifi, RefreshCw, Activity, ShieldAlert,
  FileText, ArrowDownToLine, MousePointer2
} from "lucide-react";

const C = {
  text: "var(--text-primary)",
  textDim: "var(--text-secondary)",
  border: "var(--border)",
  surface: "var(--surface)",
  accent: "var(--accent)",
  safe: "var(--safe)",
  partial: "var(--partial)",
  blocked: "var(--blocked)",
};

const navItems = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: CheckCircle2,    label: "Payout Readiness", active: true },
  { icon: BookText,        label: "Ledger" },
  { icon: AlertTriangle,   label: "Exceptions" },
  { icon: PlayCircle,      label: "Simulations" },
  { icon: FileBarChart2,   label: "Reports" },
];

function AnimatedNumber({ value, className = "", color }: { value: string, className?: string, color: string }) {
  return (
    <div className={`overflow-hidden relative ${className}`} style={{ color }}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function ProductFrame() {
  const [step, setStep] = useState(0);

  // Workflow Timeline:
  // 0: Idle, cursor hidden, files hidden.
  // 1: Files appear. Cursor enters.
  // 2: Cursor grabs files.
  // 3: Cursor drags files to dropzone. Drop!
  // 4: Dashboard processes and updates.
  // 5: Exception panel pops out.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const runSequence = () => {
      setStep(0);
      t = setTimeout(() => { setStep(1); 
        t = setTimeout(() => { setStep(2); 
          t = setTimeout(() => { setStep(3); 
            t = setTimeout(() => { setStep(4); 
              t = setTimeout(() => { setStep(5); 
                t = setTimeout(runSequence, 4500); // Wait at end before loop
              }, 2500);
            }, 1800);
          }, 1500);
        }, 1200);
      }, 500);
    };
    runSequence();
    return () => clearTimeout(t);
  }, []);

  const filesVisible = step >= 1 && step < 3;
  const isDragging = step === 2;
  const isDropping = step === 3;
  const isProcessing = step === 4;
  const isComplete = step >= 5;

  // Derived state for the dashboard UI
  const showDropzone = step >= 2 && step <= 3;
  const isSyncing = step === 3 || step === 4;
  const balancePaper = step >= 4 ? "$2.41M" : "$1.20M";
  const balanceSafe = step >= 4 ? "$1.93M" : "$1.10M";
  const blockedFunds = step >= 5 ? "$480K" : "$100K";

  return (
    <div className="relative w-full max-w-[900px] h-[650px] mx-auto text-left flex items-center justify-center">
      
      {/* ── Main Product Frame ── */}
      <motion.div 
        className="relative w-[800px] h-[540px] rounded-[10px] overflow-hidden z-10 bg-white"
        animate={{
          scale: isDropping ? 0.98 : 1,
          boxShadow: showDropzone ? "0 0 0 4px rgba(184,155,94,0.15), 0 12px 40px rgba(0,0,0,0.08)" : "0 12px 32px rgba(0,0,0,0.05)",
          borderColor: showDropzone ? "rgba(184,155,94,0.4)" : "rgba(0,0,0,0.06)"
        }}
        style={{ border: "1px solid" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Chrome Bar */}
        <div style={{ background: "#FDFDFD", borderBottom: `1px solid rgba(0,0,0,0.04)` }} className="flex items-center gap-2 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
          </div>
          <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-[4px] text-[10px] font-medium bg-black/5 text-black/40 border border-black/5">
            <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: C.safe }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            app.atlasledger.com / reconciliation
          </div>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-black/40">
            <span className="flex items-center gap-1.5"><RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} style={{ color: isSyncing ? C.accent : "currentColor" }} /> {isSyncing ? "Reconciling..." : "Idle"}</span>
            <span className="flex items-center gap-1.5"><Wifi size={10} /> Live</span>
          </div>
        </div>

        <div className="flex h-full relative">
          {/* Sidebar */}
          <aside className="w-44 flex-shrink-0 py-4 px-2 flex flex-col bg-[#FAFAFA] border-r border-black/5">
            <div className="flex items-center gap-2.5 px-2 mb-6">
              <div className="w-5 h-5 rounded-[4px] flex items-center justify-center bg-black">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M7 2L12.5 11.5H1.5L7 2Z" fill="none" stroke="white" strokeWidth="1.5" /></svg>
              </div>
              <span className="text-[12px] font-semibold text-black tracking-wide">Atlas Ledger</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[11px] font-medium transition-colors"
                  style={item.active ? { background: "rgba(184,155,94,0.08)", color: C.partial, border: "1px solid rgba(184,155,94,0.15)" } : { color: "var(--text-secondary)" }}>
                  <item.icon size={12} /> {item.label}
                  {item.active && isSyncing && (
                    <motion.span className="ml-auto w-1 h-1 rounded-full bg-[#C6A66B]" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Workspace */}
          <main className="flex-1 p-6 flex flex-col gap-5 bg-white relative">
            
            {/* Magnetic Dropzone Overlay */}
            <AnimatePresence>
              {showDropzone && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="absolute inset-4 z-30 rounded-[8px] border-2 border-dashed flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
                  style={{ borderColor: "var(--accent)" }}
                >
                  <ArrowDownToLine size={32} style={{ color: "var(--accent)", marginBottom: 12 }} />
                  <div className="text-[14px] font-semibold" style={{ color: "var(--accent)" }}>Drop settlement files to reconcile</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-black mb-1">Payout Readiness</h2>
                <div className="text-[11px] flex items-center gap-2 text-black/40">
                  <Clock size={10} /> Last run: {isComplete ? "Just now" : "2 hrs ago"}
                </div>
              </div>
              <motion.div 
                className="px-3 py-1.5 rounded-[4px] text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 border"
                style={{
                  background: isComplete ? "rgba(168,139,82,0.06)" : "rgba(62,107,82,0.06)",
                  color: isComplete ? C.partial : C.safe,
                  borderColor: isComplete ? "rgba(168,139,82,0.2)" : "rgba(62,107,82,0.2)"
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: isComplete ? C.partial : C.safe }} />
                {isComplete ? "PARTIAL" : "SAFE"}
              </motion.div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-[6px] border bg-[#FDFCFB] border-black/5">
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-black/40">Paper Balance</div>
                <AnimatedNumber value={balancePaper} color={C.text} className="text-[20px] font-mono font-medium" />
              </div>
              <div className="p-4 rounded-[6px] border bg-[#FDFCFB] border-black/5">
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-black/40 flex items-center gap-1"><CheckCircle2 size={10} className="text-[#4A8C6A]"/> Payoutable</div>
                <AnimatedNumber value={balanceSafe} color={C.safe} className="text-[20px] font-mono font-medium" />
              </div>
              <div className="p-4 rounded-[6px] border bg-[#FDFCFB] border-black/5">
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-black/40 flex items-center gap-1"><AlertCircle size={10} className={isComplete ? "text-[#8C4A4A]" : ""}/> Blocked</div>
                <AnimatedNumber value={blockedFunds} color={isComplete ? C.blocked : C.textDim} className="text-[20px] font-mono font-medium" />
              </div>
            </div>

            {/* Processing Activity Log */}
            <div className="flex-1 rounded-[6px] border bg-[#FDFCFB] border-black/5 p-4 flex flex-col overflow-hidden">
               <div className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-black/40">Reconciliation Log</div>
               <div className="space-y-2 flex-1 font-mono text-[11px]">
                  <div className="flex justify-between text-black/40"><span>[08:14:22]</span> <span>Idle</span></div>
                  
                  {step >= 4 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-black/60">
                      <span>[08:15:01]</span> <span className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin text-[#C6A66B]"/> Processing 3 files</span>
                    </motion.div>
                  )}
                  {step >= 4 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex justify-between text-black/60">
                      <span>[08:15:02]</span> <span className="text-[#4A8C6A]">Stripe Settlement matched</span>
                    </motion.div>
                  )}
                  {step >= 4 && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="flex justify-between text-black/60">
                      <span>[08:15:02]</span> <span className="text-[#4A8C6A]">Adyen Batch matched</span>
                    </motion.div>
                  )}
                  {isComplete && (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-[#8C4A4A] font-medium bg-[#8C4A4A]/5 p-1 -mx-1 rounded">
                      <span>[08:15:03]</span> <span className="flex items-center gap-1"><AlertTriangle size={10} /> Chase Credit Missing</span>
                    </motion.div>
                  )}
               </div>
            </div>
          </main>
        </div>
      </motion.div>

      {/* ── Interactive Workflow Layer ── */}

      {/* 1. Floating Files */}
      <AnimatePresence>
        {(filesVisible || isDragging) && (
          <motion.div
            initial={{ opacity: 0, x: -100, y: 150, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              x: isDragging ? 180 : -100, 
              y: isDragging ? -50 : 150, 
              scale: isDragging ? 0.8 : 1,
              rotate: isDragging ? 5 : 0
            }}
            exit={{ opacity: 0, scale: 0.5, y: -50, x: 180 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute left-[80px] z-40 pointer-events-none"
          >
            {/* Stack of files */}
            <div className="relative">
              <div className="absolute top-4 left-4 w-40 p-3 bg-white border border-black/10 rounded-[6px] shadow-sm transform -rotate-6">
                 <div className="flex items-center gap-2 text-[10px] font-mono text-black/60"><FileText size={12}/> stripe_settle.csv</div>
              </div>
              <div className="absolute top-2 left-2 w-40 p-3 bg-white border border-black/10 rounded-[6px] shadow-md transform rotate-3">
                 <div className="flex items-center gap-2 text-[10px] font-mono text-black/60"><FileText size={12}/> adyen_batch.json</div>
              </div>
              <div className="relative w-40 p-3 bg-white border border-black/15 rounded-[6px] shadow-lg transform rotate-0 z-10">
                 <div className="flex items-center gap-2 text-[10px] font-mono font-medium text-black/80"><FileText size={12} className="text-[#C6A66B]"/> chase_credit.pdf</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Cinematic Cursor */}
      <AnimatePresence>
        {step >= 1 && step < 4 && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 300 }}
            animate={{ 
              opacity: 1,
              x: step === 1 ? -40 : step === 2 ? 240 : 240, // Move to files, then drag to center
              y: step === 1 ? 190 : step === 2 ? -10 : 300,
              scale: step === 2 ? 0.9 : 1 // Press down when grabbing
            }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ duration: step === 2 ? 0.6 : 0.8, ease: "easeInOut" }}
            className="absolute left-[80px] z-50 pointer-events-none"
          >
            <MousePointer2 size={32} className="text-black drop-shadow-lg" fill="black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exception Popout ── */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            className="absolute right-[-40px] lg:right-[-80px] top-[180px] w-[260px] p-5 rounded-[8px] z-40 shadow-2xl bg-white/95 backdrop-blur-md"
            style={{ border: `1px solid rgba(140,74,74,0.3)`, boxShadow: "0 16px 48px rgba(140,74,74,0.15)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert size={14} style={{ color: C.blocked }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: C.blocked }}>Exception Block</span>
            </div>
            <p className="text-[12px] leading-relaxed mb-4 text-black">
              A <strong>$480K bank credit</strong> from Chase failed to reconcile against expected PSP settlements. 
            </p>
            <div className="p-3 rounded-[4px] border border-[#8C4A4A]/20 text-[10px] font-mono mb-5 space-y-1 bg-[#8C4A4A]/5">
              <div className="flex justify-between text-black/60"><span>Expected:</span> <span>14:00 UTC</span></div>
              <div className="flex justify-between text-black/60"><span>Status:</span> <span className="text-[#8C4A4A] font-bold">Missing</span></div>
            </div>
            <button className="w-full py-2.5 rounded-[4px] text-[11px] font-bold tracking-wide uppercase transition-colors text-white shadow-sm hover:opacity-90"
              style={{ background: C.blocked }}>
              Hold $480K from Payout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
