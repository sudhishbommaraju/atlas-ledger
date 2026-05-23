import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/insforge/server';
import { recomputeState } from '@/lib/state/canonical';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventId = payload.id || `evt_${Date.now()}`;
    const amount = payload.data?.object?.amount || 0;
    const currency = payload.data?.object?.currency || 'usd';
    const companyId = payload.company_id || req.headers.get('x-company-id');
    
    if (!companyId) return NextResponse.json({ error: 'Missing company_id' }, { status: 400 });

    const insforge = createServerClient();
    
    const { data: existing, error: checkErr } = await insforge.database
      .from('ingested_events')
      .select('id')
      .eq('company_id', companyId)
      .eq('source', 'stripe')
      .eq('event_id', eventId);
      
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }
    
    const { error: insertErr } = await insforge.database
      .from('ingested_events')
      .insert({
        company_id: companyId,
        source: 'stripe',
        event_type: payload.type || 'unknown',
        event_id: eventId,
        amount,
        currency,
        raw_payload: payload
      });
      
    if (insertErr) throw insertErr;
    
    await recomputeState(companyId);
    
    return NextResponse.json({ success: true, eventId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
