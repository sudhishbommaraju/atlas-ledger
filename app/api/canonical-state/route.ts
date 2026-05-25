import { NextResponse } from 'next/server';
import { getFirstCompanyId, getCanonicalState } from '@/lib/db';

export async function GET() {
  try {
    const companyId = await getFirstCompanyId();
    if (!companyId) return NextResponse.json(null);
    const state = await getCanonicalState(companyId);
    return NextResponse.json(state);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
