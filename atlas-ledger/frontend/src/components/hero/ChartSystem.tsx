import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const dataIdle = [
  { time: "08:00", balance: 1.10 },
  { time: "08:05", balance: 1.15 },
  { time: "08:10", balance: 1.18 },
  { time: "08:14", balance: 1.20 },
];

const dataProcessed = [
  { time: "08:00", balance: 1.10 },
  { time: "08:05", balance: 1.15 },
  { time: "08:10", balance: 1.18 },
  { time: "08:14", balance: 1.20 },
  { time: "08:15", balance: 1.93 },
  { time: "08:16", balance: 1.93 },
];

export function ChartSystem({ step }: { step: number }) {
  const isComplete = step >= 6;
  const currentData = isComplete ? dataProcessed : dataIdle;

  return (
    <div className="h-[90px] w-full mt-2 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={currentData}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C6A66B" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#C6A66B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#C6A66B" 
            strokeWidth={1.5}
            fill="url(#colorBalance)" 
            isAnimationActive={true}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="absolute top-0 left-0 text-[9px] font-mono text-black/30 tracking-widest uppercase">Payoutable Balance Trend</div>
    </div>
  );
}
