import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/insforge/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  const insforge = createServerClient();
  
  const { error: logErr } = await insforge.database
    .from('polling_log')
    .insert({
      company_id: companyId,
      source: 'stripe',
      last_polled_at: new Date().toISOString(),
      events_found: 0,
      gap_detected: false
    });
    
  if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });
  
  return NextResponse.json({ success: true, message: 'Polled successfully' });
}
