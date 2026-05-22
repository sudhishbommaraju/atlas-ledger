import { ShieldCheck, ShieldAlert, Activity } from "lucide-react";

export function DecisionEngine({ step }: { step: number }) {
  const isComplete = step >= 6;
  const hasException = step >= 7;

  return (
    <div className="rounded-[16px] border bg-[#FDFCFB] border-black/5 p-5 flex flex-col relative overflow-hidden h-[190px]">
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-5 text-black/40">Decision Engine</div>
      
      {/* Status */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${hasException ? "bg-[#8C4A4A]/10 text-[#8C4A4A]" : isComplete ? "bg-[#4A8C6A]/10 text-[#4A8C6A]" : "bg-black/5 text-black/40"}`}>
          {hasException ? <ShieldAlert size={16}/> : isComplete ? <ShieldCheck size={16}/> : <Activity size={16}/>}
        </div>
        <div>
          <div className="text-[14px] font-semibold text-black leading-snug">{hasException ? "Partial Payout" : isComplete ? "Safe to Disburse" : "Awaiting Sync"}</div>
          <div className="text-[10px] text-black/50 mt-0.5">{hasException ? "Exception threshold breached" : isComplete ? "Reconciliation complete" : "Engine idle"}</div>
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-black/50">Confidence Score</span>
          <span className="font-mono text-black font-medium">{hasException ? "82.4%" : isComplete ? "99.9%" : "—"}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-black/50">Operational Status</span>
          <span className="font-mono text-black font-medium">{hasException ? "Hold Required" : isComplete ? "Approved" : "—"}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] pt-3 border-t border-black/5">
          <span className="text-black/40">Review Action</span>
          <span className="font-medium bg-black/5 px-1.5 py-0.5 rounded text-black/60 tracking-wider">AUTO_SYS</span>
        </div>
      </div>
    </div>
  );
}
