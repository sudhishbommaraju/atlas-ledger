import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { api_key } = await req.json();
    if (!api_key || typeof api_key !== 'string') {
      return NextResponse.json({ success: false, message: 'API key is required' }, { status: 400 });
    }

    const stripe = new Stripe(api_key);
    await stripe.balance.retrieve();

    return NextResponse.json({ success: true, message: 'Connected to Stripe' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid Stripe API key';
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
