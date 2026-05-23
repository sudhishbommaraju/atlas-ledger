import { NextResponse } from 'next/server';
import { processStripeEvent } from '@/lib/ingestion/stripe';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventId = payload.id || `evt_${Date.now()}`;
    const amount = payload.data?.object?.amount || 0;
    const currency = payload.data?.object?.currency || 'usd';
    const companyId = payload.company_id || req.headers.get('x-company-id');
    const type = payload.type || 'unknown';
    
    if (!companyId) return NextResponse.json({ error: 'Missing company_id' }, { status: 400 });

    const res = await processStripeEvent(companyId, eventId, type, amount, currency, payload);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
