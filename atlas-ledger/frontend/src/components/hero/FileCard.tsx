import { motion, HTMLMotionProps } from "framer-motion";
import { FileText } from "lucide-react";

interface FileCardProps extends HTMLMotionProps<"div"> {
  filename: string;
  source: string;
}

export function FileCard({ filename, source, className = "", ...props }: FileCardProps) {
  return (
    <motion.div
      {...props}
      className={`absolute w-[180px] p-3 bg-white border border-black/10 rounded-[14px] shadow-lg flex items-center gap-2.5 z-20 ${className}`}
    >
      <div className="w-8 h-8 rounded bg-black/5 flex items-center justify-center flex-shrink-0">
        <FileText size={14} className="text-black/60" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono font-medium text-black/80 truncate">{filename}</div>
        <div className="text-[9px] text-black/50">Source: {source}</div>
      </div>
    </motion.div>
  );
}
