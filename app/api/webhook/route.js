import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentReceipt, sendRenewalReceipt } from '../../../lib/email/sendReceipt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email || session.customer_details?.email;
    const user_id = session.metadata?.user_id || null;
    const plan = session.metadata?.plan || 'one_time';

    if (!email) {
      console.error('No email found on checkout session', session.id);
      return new Response('ok', { status: 200 });
    }

    const expires_at = new Date();
    if (plan === 'annual') {
      expires_at.setFullYear(expires_at.getFullYear() + 1);
    } else if (plan === 'semi_annual') {
      expires_at.setMonth(expires_at.getMonth() + 6);
    } else {
      expires_at.setFullYear(expires_at.getFullYear() + 1);
    }

    if (user_id) {
      await supabase.from('subscriptions').upsert(
        {
          user_id,
          email,
          plan,
          status: 'active',
          expires_at: expires_at.toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } else {
      console.error('No user_id found on checkout session metadata', session.id);

      // Defensive fallback: look up an existing row by email before inserting,
      // so we never create a duplicate row for someone who already has one
      // (e.g. an existing trial row) without a user_id.
      const { data: existingByEmail } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingByEmail) {
        await supabase.from('subscriptions').update({
          plan,
          status: 'active',
          expires_at: expires_at.toISOString(),
        }).eq('id', existingByEmail.id);
      } else {
        await supabase.from('subscriptions').insert({
          email,
          plan,
          status: 'active',
          expires_at: expires_at.toISOString(),
        });
      }
    }

    // Send the appropriate confirmation email.
    // 'one_time' = brand-new $99 purchase. 'annual'/'semi_annual' = a renewal.
    try {
      if (plan === 'one_time') {
        await sendPaymentReceipt(email, expires_at.toISOString());
      } else {
        await sendRenewalReceipt(email, plan, expires_at.toISOString());
      }
    } catch (emailErr) {
      // Never fail the webhook because of an email issue — payment already succeeded.
      console.error('Failed to send receipt email', emailErr);
    }
  }

  return new Response('ok', { status: 200 });
}