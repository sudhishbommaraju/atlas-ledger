export function TransactionLineage({ step }: { step: number }) {
  // A vertical timeline of how funds move
  const nodes = [
    { label: "Stripe Settlement", active: step >= 5, status: "Verified" },
    { label: "Bank Verification", active: step >= 6, status: "Matched" },
    { label: "Reserve Check", active: step >= 6, status: "Cleared" },
    { label: "Exception Engine", active: step >= 6, status: step >= 7 ? "Flagged" : "Processing" },
  ];

  return (
    <div className="flex-1 rounded-[16px] border bg-[#FDFCFB] border-black/5 p-5 flex flex-col overflow-hidden">
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-5 text-black/40">Transaction Lineage</div>
      <div className="flex-1 relative flex flex-col gap-1">
        {nodes.map((n, i) => {
          const isError = n.label === "Exception Engine" && step >= 7;
          return (
            <div key={i} className="flex gap-3.5 relative">
              {i !== nodes.length - 1 && (
                <div className={`absolute left-[5px] top-[16px] bottom-[-6px] w-[1px] ${n.active ? "bg-[#C6A66B]/40" : "bg-black/5"}`} />
              )}
              <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 z-10 border-[2.5px] border-[#FDFCFB] ${n.active ? (isError ? "bg-[#8C4A4A]" : "bg-[#C6A66B]") : "bg-black/10"}`} />
              <div className={`text-[11px] pb-3.5 ${n.active ? "text-black" : "text-black/40"}`}>
                <div className="font-medium">{n.label}</div>
                {n.active && <div className={`text-[9px] mt-0.5 ${isError ? "text-[#8C4A4A]" : "text-black/40"}`}>{n.status}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-auto flex items-center justify-between pt-3 border-t border-black/5 text-[9px] text-black/40 uppercase tracking-wider">
        <span>Trace ID</span>
        <span className="font-mono text-black/60">TR-8X92</span>
      </div>
    </div>
  );
}
