import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCursor } from "./AnimatedCursor";
import { FileCard } from "./FileCard";
import { ProductWindow } from "./ProductWindow";

export function DragDropWorkflow() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const runSequence = () => {
      setStep(0);
      t = setTimeout(() => { setStep(1); 
        t = setTimeout(() => { setStep(2); 
          t = setTimeout(() => { setStep(3); 
            t = setTimeout(() => { setStep(4); 
              t = setTimeout(() => { setStep(5); 
                t = setTimeout(() => { setStep(6); 
                  t = setTimeout(() => { setStep(7); 
                    t = setTimeout(runSequence, 4500);
                  }, 1200);
                }, 1000);
              }, 1200);
            }, 800);
          }, 1000);
        }, 800);
      }, 500);
    };
    runSequence();
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* File Stack (Background) */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div 
            initial={{ opacity: 0, x: -160, y: 140, scale: 0.9 }}
            animate={{ opacity: 1, x: -120, y: 140, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute z-20 pointer-events-none"
          >
            <FileCard filename="payout_report.xlsx" source="Finance" className="transform -rotate-12 opacity-40 scale-[0.9]" style={{ top: -16, left: -16 }} />
            <FileCard filename="refund_export.csv" source="PSP" className="transform -rotate-6 opacity-60 scale-[0.95]" style={{ top: -8, left: -8 }} />
            <FileCard filename="chase_bank_credit.csv" source="Chase" className="transform -rotate-3 opacity-80" />
            <FileCard filename="adyen_batch.json" source="Adyen" className="transform rotate-0" style={{ top: 8, left: 8 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable Top File */}
      <AnimatePresence>
        {step >= 1 && step < 4 && (
          <motion.div
            initial={{ opacity: 0, x: -160, y: 140, rotate: 2, scale: 0.9 }}
            animate={{
              opacity: 1,
              x: step >= 3 ? 120 : -120,
              y: step >= 3 ? 0 : 140,
              rotate: step >= 3 ? 8 : 2,
              scale: step >= 2 ? 0.9 : 1,
            }}
            exit={{ opacity: 0, scale: 0.5, y: -20, x: 120 }}
            transition={{ duration: step >= 3 ? 0.7 : 0.6, ease: "easeInOut" }}
            className="absolute z-40 pointer-events-none"
          >
            <FileCard filename="stripe_settlement.csv" source="Stripe" style={{ top: 16, left: 16 }} className="shadow-lg border-black/15" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedCursor step={step} />

      {/* Floating Micro-Panels */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-40px] top-[40px] z-20 w-[180px] p-2.5 bg-white border border-black/10 rounded-[14px] shadow-lg flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#C6A66B] flex-shrink-0" />
        <span className="text-[9px] font-medium uppercase tracking-wider text-black/60">Settlement drift detected</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute right-[-20px] bottom-[120px] z-20 w-[190px] p-2.5 bg-white border border-black/10 rounded-[14px] shadow-lg flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#4A8C6A] flex-shrink-0" />
        <span className="text-[9px] font-medium uppercase tracking-wider text-black/60">PSP Reconciliation Stable</span>
      </motion.div>

      {/* Main Product Window */}
      <div className="w-[1000px] z-10 relative">
        <ProductWindow step={step} />
      </div>
    </div>
  );
}
