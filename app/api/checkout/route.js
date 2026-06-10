import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  one_time: { amount: 9900, mode: 'payment', name: 'Simcha Organizer - One Time' },
  semi_annual: { amount: 2900, mode: 'subscription', name: 'Simcha Organizer - 6 Months' },
  annual: { amount: 4900, mode: 'subscription', name: 'Simcha Organizer - Annual' },
};

export async function POST(req) {
  const { plan } = await req.json();
  const price = PRICES[plan];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: price.mode,
    metadata: { plan },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: price.name },
          unit_amount: price.amount,
          ...(price.mode === 'subscription' && {
            recurring: {
              interval: plan === 'annual' ? 'year' : 'month',
              ...(plan === 'semi_annual' && { interval_count: 6 })
            }
          }),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return Response.json({ url: session.url });
}