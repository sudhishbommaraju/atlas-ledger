import { NextResponse } from 'next/server';
import { getFirstCompanyId, getRemediationActions } from '@/lib/db';

export async function GET() {
  try {
    const companyId = await getFirstCompanyId();
    if (!companyId) return NextResponse.json([]);
    const actions = await getRemediationActions(companyId);
    return NextResponse.json(actions);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
