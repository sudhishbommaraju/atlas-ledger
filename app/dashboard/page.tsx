import { createServerClient } from '@/lib/insforge/server';

// TODO: InsForge realtime subscriptions can be wired here via client component.
// For now we use standard server component fetch, which relies on page refresh/polling if ported to client.
export const revalidate = 5;

export default async function DashboardPage() {
  const insforge = createServerClient();
  const { data: driftEvents } = await insforge.database
    .from('drift_events')
    .select('*')
    .order('detected_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Open Drift Events</h1>
      <div className="space-y-4">
        {driftEvents?.map((evt: any) => (
          <div key={evt.id} className="bg-white p-6 rounded-lg shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-[rgba(11,18,32,0.10)]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">{evt.detector_type}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                evt.severity === 'critical' ? 'bg-red-100 text-red-800' :
                evt.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>{evt.severity}</span>
            </div>
            <p className="text-[#5B6472] mb-4">{evt.description}</p>
            <div className="flex gap-6 text-sm text-[#5B6472]">
              <div><span className="font-medium text-[#0B1220]">Dollars at Risk:</span> ${(evt.dollars_at_risk / 100).toLocaleString()}</div>
              <div><span className="font-medium text-[#0B1220]">Payouts Affected:</span> {evt.payouts_affected}</div>
            </div>
          </div>
        ))}
        {(!driftEvents || driftEvents.length === 0) && (
          <div className="text-[#5B6472]">No open drift events detected.</div>
        )}
      </div>
    </div>
  );
}
