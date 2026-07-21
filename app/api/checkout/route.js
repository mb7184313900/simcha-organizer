import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  one_time: { amount: 9900, mode: 'payment', name: 'Simcha Organizer - One Time' },
  semi_annual: { amount: 2900, mode: 'payment', name: 'Simcha Organizer - 6 Months' },
  annual: { amount: 4900, mode: 'payment', name: 'Simcha Organizer - Annual' },
};

export async function POST(req) {
  const {
    plan, user_id, email, wedding_id, action,
    my_side, my_family_name, other_family_name, wedding_name, wedding_date
  } = await req.json();
  const price = PRICES[plan];

  if (!user_id || !email) {
    return Response.json({ error: 'Missing user_id or email' }, { status: 400 });
  }

  const isNewWedding = action === 'new_wedding';

  if (!isNewWedding && !wedding_id) {
    return Response.json({ error: 'Missing wedding_id' }, { status: 400 });
  }

  if (isNewWedding && (!my_family_name || !other_family_name)) {
    return Response.json({ error: 'Missing family names for new wedding' }, { status: 400 });
  }

  // For a brand-new wedding, no wedding row exists yet — pass the intake details
  // through Stripe metadata so the webhook can create the wedding after payment succeeds.
  const metadata = isNewWedding
    ? {
        plan, user_id, action: 'new_wedding',
        my_side: my_side || 'chosson',
        my_family_name,
        other_family_name,
        wedding_name: wedding_name || '',
        wedding_date: wedding_date || ''
      }
    : { plan, user_id, wedding_id };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: price.mode,
    customer_email: email,
    metadata,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: price.name },
          unit_amount: price.amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return Response.json({ url: session.url });
}