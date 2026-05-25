import { NextResponse } from 'next/server';

// Seed endpoint removed in V3 rebuild.
// Data is seeded via the InsForge migrations.
export async function POST() {
  return NextResponse.json({ message: 'Seed not available in this version' }, { status: 410 });
}
