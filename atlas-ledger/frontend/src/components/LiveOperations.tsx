import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldAlert, Activity, CheckCircle2, AlertTriangle, ArrowRight, Clock } from "lucide-react";

function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

// --- Types & Data ---

type ColumnId = "incoming" | "reconciling" | "exceptions" | "ready";

interface Card {
  id: string;
  title: string;
  source: string;
  amount: string;
  status: "pending" | "processing" | "error" | "success";
  col: ColumnId;
}

const initialCards: Card[] = [
  { id: "c1", title: "Stripe settlement", source: "Stripe", amount: "$1.2M", status: "processing", col: "reconciling" },
  { id: "c2", title: "Adyen payout batch", source: "Adyen", amount: "$450K", status: "pending", col: "incoming" },
  { id: "c3", title: "Chase bank credit", source: "Chase", amount: "$480K", status: "error", col: "exceptions" },
  { id: "c4", title: "Refund exposure", source: "System", amount: "($12K)", status: "processing", col: "reconciling" },
  { id: "c5", title: "Reserve hold", source: "System", amount: "($50K)", status: "success", col: "ready" },
];

// --- Components ---

function Avatar({ init, color }: { init: string, color: string }) {
  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style={{ background: color }}>
      {init}
    </div>
  );
}

function Thread() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const run = () => {
      setStep(0);
      t = setTimeout(() => { setStep(1); 
        t = setTimeout(() => { setStep(2); 
          t = setTimeout(() => { setStep(3); 
            t = setTimeout(run, 6000);
          }, 1500);
        }, 1500);
      }, 1000);
    };
    run();
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#111318] rounded-[24px] border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-[#16181D]">
        <MessageSquare size={14} className="text-white/40" />
        <span className="text-[12px] font-semibold tracking-wide text-white/90">#payout-ops</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex -space-x-1.5">
            <Avatar init="M" color="#5B6B7A" />
            <Avatar init="A" color="#8FA3BF" />
            <Avatar init="S" color="#B89B5E" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 flex flex-col gap-5 overflow-hidden relative">
        <AnimatePresence>
          {step >= 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <Avatar init="M" color="#5B6B7A" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[12px] font-medium text-white/90">Maya</span>
                  <span className="text-[10px] text-white/40">10:01 PM</span>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed">Reserve exposure increased after latest PSP settlement import. Can we check the ledger?</p>
              </div>
            </motion.div>
          )}

          {step >= 2 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <Avatar init="A" color="#8FA3BF" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[12px] font-medium text-white/90">Arjun</span>
                  <span className="text-[10px] text-white/40">10:02 PM</span>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed mb-3">Atlas flagged a mismatch between expected Chase credit and PSP reconciliation totals.</p>
                
                {/* Atlas Bot Embed */}
                <div className="p-3 rounded-[6px] border border-[#8C4A4A]/30 bg-[#8C4A4A]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded bg-[#8C4A4A] flex items-center justify-center"><ShieldAlert size={10} className="text-white"/></div>
                    <span className="text-[11px] font-bold text-[#8C4A4A] uppercase tracking-wider">Atlas Ledger Exception</span>
                  </div>
                  <ul className="text-[12px] text-white/80 space-y-1.5 ml-1">
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#8C4A4A]" />Missing Chase bank credit</li>
                    <li className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#8C4A4A]" />Refund exposure threshold exceeded</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <Avatar init="S" color="#B89B5E" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[12px] font-medium text-white/90">Sophia</span>
                  <span className="text-[10px] text-white/40">10:04 PM</span>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed">Got it. Let's hold partial payout until reconciliation completes on the remaining batch.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function BoardCard({ card }: { card: Card }) {
  const isError = card.status === "error";
  const isSuccess = card.status === "success";
  
  return (
    <motion.div 
      layoutId={card.id}
      className="p-3 rounded-[16px] bg-[#1A1D24] border border-white/5 shadow-md flex flex-col gap-2 cursor-default group hover:border-white/15 transition-colors"
    >
      <div className="flex items-start justify-between">
        <span className="text-[12px] font-medium text-white/90 leading-tight">{card.title}</span>
        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isError ? "bg-[#8C4A4A]" : isSuccess ? "bg-[#4A8C6A]" : "bg-[#C6A66B]"}`} />
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-white/40">{card.source}</span>
        <span className="font-mono text-white/60">{card.amount}</span>
      </div>
      <div className="mt-1 pt-2 border-t border-white/5 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] uppercase tracking-wider text-white/30">{card.id.toUpperCase()}</span>
        <Clock size={10} className="text-white/30" />
      </div>
    </motion.div>
  );
}

function LedgerBoard() {
  const [cards, setCards] = useState<Card[]>(initialCards);

  // Workflow orchestration loop
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const run = () => {
      // Reset
      setCards(initialCards);
      
      t = setTimeout(() => {
        // Move adyen to reconciling
        setCards(prev => prev.map(c => c.id === "c2" ? { ...c, col: "reconciling", status: "processing" } : c));
        
        t = setTimeout(() => {
          // Stripe finishes, moves to ready
          setCards(prev => prev.map(c => c.id === "c1" ? { ...c, col: "ready", status: "success" } : c));
          
          t = setTimeout(() => {
            // Chase exception triggers
            setCards(prev => prev.map(c => c.id === "c4" ? { ...c, col: "exceptions", status: "error" } : c));
            
            t = setTimeout(run, 4000);
          }, 2000);
        }, 2000);
      }, 1500);
    };
    run();
    return () => clearTimeout(t);
  }, []);

  const cols = [
    { id: "incoming", label: "Incoming Events" },
    { id: "reconciling", label: "Reconciling" },
    { id: "exceptions", label: "Exceptions" },
    { id: "ready", label: "Ready for Payout" },
  ];

  return (
    <div className="h-full bg-[#111318] rounded-[24px] border border-white/10 shadow-2xl flex overflow-hidden">
      {cols.map((col, idx) => (
        <div key={col.id} className="flex-1 flex flex-col border-r border-white/5 last:border-0 bg-[#16181D]/30">
          {/* Col Header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-white/50 uppercase">{col.label}</span>
            <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[9px] text-white/40">
              {cards.filter(c => c.col === col.id).length}
            </span>
          </div>
          {/* Col Body */}
          <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto overflow-x-hidden relative">
            <AnimatePresence>
              {cards.filter(c => c.col === col.id).map(card => (
                <BoardCard key={card.id} card={card} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LiveOperations() {
  const { ref, inView } = useInView({ threshold: 0.15, rootMargin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 lg:py-48 overflow-hidden bg-[#0A0C10]">
      {/* Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 50% 0%, rgba(184,155,94,0.03) 0%, transparent 60%)",
      }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative mx-auto max-w-[1360px] px-6 md:px-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-16"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C6A66B] mb-4">Command Center</div>
          <h2 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-tight mb-5">
            Operational clarity during<br/>every payout run.
          </h2>
          <p className="text-[16px] text-white/50 leading-relaxed max-w-lg">
            Real-time collaboration for payout operations. Atlas Ledger aligns your finance, engineering, and operations teams around one unified financial truth.
          </p>
        </motion.div>

        {/* Operational Workspace Grid */}
        <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 h-[600px]">
          
          {/* Left: Collaboration Thread */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-[400px] lg:h-full"
          >
            <Thread />
          </motion.div>

          {/* Right: Live Ledger Board */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-[500px] lg:h-full hidden md:block"
          >
            <LedgerBoard />
          </motion.div>

        </div>

      </div>
    </section>
  );
}
