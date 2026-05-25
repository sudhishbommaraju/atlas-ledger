export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('sk_')) {
      return Response.json(
        { success: false, error: 'Key must start with sk_test_ or sk_live_' },
        { status: 400 }
      );
    }

    const stripeRes = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (stripeRes.ok) {
      const data = await stripeRes.json();
      const available = data.available?.[0]?.amount ?? 0;
      return Response.json({
        success: true,
        message: 'Connected to Stripe',
        available_cents: available,
      });
    }

    if (stripeRes.status === 401) {
      return Response.json(
        { success: false, error: 'Invalid API key — check it and try again' },
        { status: 401 }
      );
    }

    return Response.json(
      { success: false, error: `Stripe returned ${stripeRes.status}` },
      { status: 400 }
    );
  } catch {
    return Response.json(
      { success: false, error: 'Network error — could not reach Stripe' },
      { status: 500 }
    );
  }
}
