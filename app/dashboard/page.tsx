import { createServerClient } from '@/lib/insforge/server';
import DriftEventsClient from './DriftEventsClient';

export const revalidate = 0; // Force dynamic to ensure fresh initial state

export default async function DashboardPage() {
  const insforge = createServerClient();
  
  const { data: companies } = await insforge.database
    .from('companies')
    .select('*')
    .limit(1);
    
  const company = companies?.[0] || { id: 'unknown', name: 'Unknown Company' };
  
  const { data: stateData } = await insforge.database
    .from('canonical_state')
    .select('state_confidence_score')
    .eq('company_id', company.id)
    .limit(1);
    
  const confidenceScore = stateData?.[0]?.state_confidence_score ?? 1.0;

  const { data: driftEvents } = await insforge.database
    .from('drift_events')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'open');
    
  return (
    <DriftEventsClient 
      initialEvents={driftEvents || []} 
      companyName={company.name} 
      confidenceScore={confidenceScore} 
      companyId={company.id} 
    />
  );
}
