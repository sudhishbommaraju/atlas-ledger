import { createServerClient } from '@/lib/insforge/server';

export const revalidate = 0;

export default async function StatePage() {
  const insforge = createServerClient();
  const { data: stateData } = await insforge.database
    .from('canonical_state')
    .select('*, companies(name)')
    .limit(1);

  const state = stateData?.[0];
  
  if (!state) {
     return <div className="p-8 text-[#5B6472]">No canonical state found. Please run seed.</div>;
  }

  const getFreshnessColor = (seconds: number) => {
    if (seconds < 60) return 'bg-green-500';
    if (seconds <= 300) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-amber-600';
    return 'text-red-600';
  };
  
  const scoreExplanation = state.state_confidence_score >= 0.9 
    ? "All systems agree within acceptable tolerance levels."
    : "Divergence between systems is reducing state confidence.";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#0B1220]">Canonical State</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)] mb-8 flex items-center justify-between">
        <div>
          <div className="text-sm text-[#5B6472] uppercase font-bold tracking-wider mb-2">State Confidence</div>
          <div className="text-[#5B6472] text-sm">{scoreExplanation}</div>
        </div>
        <div className={`text-5xl font-black ${getScoreColor(state.state_confidence_score)}`}>
          {(state.state_confidence_score * 100).toFixed(0)}%
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)] relative">
          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getFreshnessColor(state.balance_freshness_seconds)}`} title={`${state.balance_freshness_seconds}s old`} />
          <div className="text-sm text-[#5B6472] mb-1 font-semibold">Stripe Balance</div>
          <div className="text-3xl font-bold text-[#0B1220] mb-2">${(state.stripe_balance / 100).toLocaleString()}</div>
          <div className="text-xs text-[#5B6472]">Updated: {new Date(state.last_updated).toLocaleTimeString()}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)] relative">
          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getFreshnessColor(state.balance_freshness_seconds)}`} />
          <div className="text-sm text-[#5B6472] mb-1 font-semibold">ERP Balance</div>
          <div className="text-3xl font-bold text-[#0B1220] mb-2">${(state.simulated_erp_balance / 100).toLocaleString()}</div>
          <div className="text-xs text-[#5B6472]">Updated: {new Date(state.last_updated).toLocaleTimeString()}</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)] relative">
          <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getFreshnessColor(state.balance_freshness_seconds)}`} />
          <div className="text-sm text-[#5B6472] mb-1 font-semibold">Bank Balance</div>
          <div className="text-3xl font-bold text-[#0B1220] mb-2">${(state.simulated_bank_balance / 100).toLocaleString()}</div>
          <div className="text-xs text-[#5B6472]">Updated: {new Date(state.last_updated).toLocaleTimeString()}</div>
        </div>
        
        <div className="bg-[#1D4ED8] p-6 rounded-lg shadow-md relative">
          <div className="text-sm text-blue-100 mb-1 font-semibold">Safe to Disburse</div>
          <div className="text-3xl font-bold text-white mb-2">${(state.safe_to_disburse / 100).toLocaleString()}</div>
          <div className="text-xs text-blue-200">Reserve: ${(state.reserve_amount / 100).toLocaleString()}</div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)]">
        <h2 className="text-sm text-[#5B6472] uppercase font-bold tracking-wider mb-4">Systems Status</h2>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="font-semibold">Stripe</span>
            <span className="text-[#5B6472] text-sm">connected live</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold">ERP</span>
            <span className="text-[#5B6472] text-sm">simulated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold">Bank</span>
            <span className="text-[#5B6472] text-sm">simulated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
