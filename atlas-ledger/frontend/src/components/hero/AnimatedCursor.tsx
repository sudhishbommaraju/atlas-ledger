import { motion } from "framer-motion";
import { MousePointer2 } from "lucide-react";

export function AnimatedCursor({ step }: { step: number }) {
  // 0: idle offscreen
  // 1: move to file stack
  // 2: grab (scale down slightly)
  // 3: drag to drop zone
  // 4: drop (scale up)
  // 5+: disappear
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 300 }}
      animate={{ 
        opacity: step >= 1 && step <= 4 ? 1 : 0,
        x: step === 1 ? -80 : step === 2 ? -80 : step === 3 ? 160 : step === 4 ? 160 : 100,
        y: step === 1 ? 160 : step === 2 ? 160 : step === 3 ? 20 : step === 4 ? 20 : 300,
        scale: step === 2 || step === 3 ? 0.85 : 1
      }}
      transition={{ 
        duration: step === 3 ? 0.7 : 0.6, 
        ease: "easeInOut" 
      }}
      className="absolute z-50 pointer-events-none drop-shadow-xl"
    >
      <MousePointer2 size={32} fill="black" className="text-black" />
    </motion.div>
  );
}
