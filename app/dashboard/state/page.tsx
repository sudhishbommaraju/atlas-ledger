import { createServerClient } from '@/lib/insforge/server';

export const revalidate = 5;

export default async function StatePage() {
  const insforge = createServerClient();
  const { data: stateData } = await insforge.database
    .from('canonical_state')
    .select('*, companies(name)')
    .limit(1);

  const state = stateData?.[0];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Canonical State</h1>
      {state ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)]">
            <div className="text-sm text-[#5B6472] mb-1">Company</div>
            <div className="text-xl font-semibold">{state.companies?.name || 'Unknown'}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)]">
            <div className="text-sm text-[#5B6472] mb-1">Confidence Score</div>
            <div className="text-xl font-semibold">{state.state_confidence_score}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)]">
            <div className="text-sm text-[#5B6472] mb-1">Stripe Balance</div>
            <div className="text-2xl font-bold">${(state.stripe_balance / 100).toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)]">
            <div className="text-sm text-[#5B6472] mb-1">ERP Balance</div>
            <div className="text-2xl font-bold">${(state.simulated_erp_balance / 100).toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)]">
            <div className="text-sm text-[#5B6472] mb-1">Bank Balance</div>
            <div className="text-2xl font-bold">${(state.simulated_bank_balance / 100).toLocaleString()}</div>
          </div>
          <div className="bg-[#1D4ED8] text-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-blue-100 mb-1">Safe to Disburse</div>
            <div className="text-3xl font-bold">${(state.safe_to_disburse / 100).toLocaleString()}</div>
          </div>
        </div>
      ) : (
        <div className="text-[#5B6472]">No canonical state found. Please run seed.</div>
      )}
    </div>
  );
}
