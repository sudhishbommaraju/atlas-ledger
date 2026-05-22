import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

export function ReconciliationLog({ step }: { step: number }) {
  return (
    <div className="flex-1 rounded-[16px] bg-[#FAFAFA] border border-black/5 p-4 flex flex-col relative overflow-hidden">
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-3 text-black/40">Reconciliation Log</div>
      <div className="space-y-2.5 flex-1 font-mono text-[11px]">
        <div className="flex justify-between text-black/40"><span>[08:14:22]</span> <span>Idle</span></div>
        
        {step >= 5 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-black/60">
            <span>[08:14:23]</span> <span className="flex items-center gap-1.5"><RefreshCw size={10} className="animate-spin text-[#C6A66B]"/> Stripe settlement uploaded</span>
          </motion.div>
        )}
        {step >= 6 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-black/60">
            <span>[08:14:25]</span> <span className="flex items-center gap-1.5 text-[#4A8C6A]"><CheckCircle2 size={10}/> Bank credit matched</span>
          </motion.div>
        )}
        {step >= 6 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex justify-between text-black/60">
            <span>[08:14:31]</span> <span className="flex items-center gap-1.5 text-[#4A8C6A]"><CheckCircle2 size={10}/> Refund export reconciled</span>
          </motion.div>
        )}
        {step >= 7 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between text-[#8C4A4A] font-medium bg-[#8C4A4A]/5 p-1 -mx-1 rounded">
            <span>[08:14:36]</span> <span className="flex items-center gap-1.5"><AlertTriangle size={10} /> Missing bank credit detected</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
