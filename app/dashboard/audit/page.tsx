import { createServerClient } from '@/lib/insforge/server';

export const revalidate = 5;

export default async function AuditPage() {
  const insforge = createServerClient();
  const { data: actions } = await insforge.database
    .from('remediation_actions')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit & Remediation</h1>
        <button disabled className="bg-neutral-200 text-neutral-500 px-4 py-2 rounded-md cursor-not-allowed">
          Execute Fix
        </button>
      </div>
      <p className="text-sm text-[#5B6472] mb-6 italic">
        Remediation execution requires live payout permissions.
      </p>
      
      <div className="bg-white rounded-lg shadow-sm border border-[rgba(11,18,32,0.10)] p-6">
        {actions && actions.length > 0 ? (
          <ul className="space-y-4">
            {actions.map((action: any) => (
              <li key={action.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="font-medium">{action.action_type}</div>
                <div className="text-sm text-[#5B6472] mt-1">{action.audit_log}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[#5B6472] text-center py-8">No remediation actions found.</div>
        )}
      </div>
    </div>
  );
}
