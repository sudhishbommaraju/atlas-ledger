import { NextResponse } from 'next/server';
import { getFirstCompanyId, getDriftEvents } from '@/lib/db';

export async function GET() {
  try {
    const companyId = await getFirstCompanyId();
    if (!companyId) return NextResponse.json([]);
    const drifts = await getDriftEvents(companyId);
    return NextResponse.json(drifts);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
