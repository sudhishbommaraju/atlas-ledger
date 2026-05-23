import { createServerClient } from '@/lib/insforge/server';

export const revalidate = 0;

export default async function AuditPage() {
  const insforge = createServerClient();
  const { data: actions } = await insforge.database
    .from('remediation_actions')
    .select('*')
    .order('created_at', { ascending: false });

  const formatAction = (type: string) => type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const formatTrigger = (type: string) => type === 'atlas_auto' ? 'Atlas Auto' : 'Human Approved';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <div className="flex gap-4">
          <select className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white">
            <option>All Actions</option>
            <option>Freeze Payout</option>
            <option>Block Duplicate</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)] overflow-hidden">
        {actions && actions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1EDE5] border-b border-[rgba(11,18,32,0.10)]">
                <th className="p-4 font-semibold text-[#0B1220] text-sm">Action Type</th>
                <th className="p-4 font-semibold text-[#0B1220] text-sm">Triggered By</th>
                <th className="p-4 font-semibold text-[#0B1220] text-sm">Confidence</th>
                <th className="p-4 font-semibold text-[#0B1220] text-sm">State Summary</th>
                <th className="p-4 font-semibold text-[#0B1220] text-sm">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action: any) => (
                <tr key={action.id} className="border-b border-[rgba(11,18,32,0.10)] hover:bg-[#F7F4EE]">
                  <td className="p-4 text-sm font-medium">{formatAction(action.action_type)}</td>
                  <td className="p-4 text-sm">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">{formatTrigger(action.triggered_by)}</span>
                  </td>
                  <td className="p-4 text-sm">{(action.confidence_score * 100).toFixed(0)}%</td>
                  <td className="p-4 text-sm max-w-xs truncate">{action.audit_log}</td>
                  <td className="p-4 text-sm text-[#5B6472]">{new Date(action.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-16 text-center">
            <div className="text-[#5B6472] text-lg font-medium">No remediation actions yet. Atlas is observing your stack.</div>
          </div>
        )}
      </div>
    </div>
  );
}
