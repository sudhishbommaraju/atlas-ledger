import { motion, AnimatePresence } from "framer-motion";

export function MetricCard({ label, value, icon: Icon, valueColor, iconColor }: any) {
  return (
    <div className="bg-[#FDFCFB] rounded-[16px] p-4 flex flex-col justify-between border border-black/5 min-h-[90px]">
      <div className="text-[11px] font-medium text-black/40 flex items-center gap-1.5 uppercase tracking-wider">
        {Icon && <Icon size={12} className={iconColor} />} {label}
      </div>
      <div className={`overflow-hidden relative text-[20px] font-mono font-medium`} style={{ color: valueColor }}>
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
    </div>
  );
}
