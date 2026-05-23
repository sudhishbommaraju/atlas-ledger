import { NextResponse } from 'next/server';
import { fetchRecentEvents } from '@/lib/ingestion/stripe';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get('companyId');
  const stripeAccountId = searchParams.get('stripeAccountId') || '';
  
  if (!companyId) return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });

  try {
    await fetchRecentEvents(companyId, stripeAccountId);
    return NextResponse.json({ success: true, message: 'Polled successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
