import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

export async function POST(req: Request) {
  try {
    const { tier, duration, restaurantId, restaurantName } = await req.json();

    const pricingMap: Record<string, Record<string, number>> = {
      starter: { '1m': 1200, '3m': 3200, '6m': 5900, '1y': 9900 },
      pro: { '1m': 2900, '3m': 7900, '6m': 14900, '1y': 26900 },
    };

    const unitAmount = pricingMap[tier]?.[duration] || 1200;
    const planName = `${restaurantName} - ${tier.toUpperCase()} Plan (${duration.toUpperCase()})`;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: planName },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        restaurantId,
        tier,
        duration,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}