import { NextResponse } from 'next/server';
import { seedDemoData } from '@/lib/seed/demo';

export async function POST(req: Request) {
  try {
    const result = await seedDemoData();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
