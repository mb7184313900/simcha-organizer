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
    const action = session.metadata?.action || null;
    const plan = session.metadata?.plan || 'one_time';

    if (!email) {
      console.error('No email found on checkout session', session.id);
      return new Response('ok', { status: 200 });
    }

    if (!user_id) {
      console.error('No user_id found on checkout session metadata', session.id);
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

    let wedding_id = session.metadata?.wedding_id || null;

    // This payment is for a brand-new (2nd, 3rd, etc.) wedding — nothing exists yet.
    // Create the wedding + family_settings now that payment has actually succeeded.
    if (action === 'new_wedding') {
      const my_side = session.metadata?.my_side || 'chosson';
      const my_family_name = session.metadata?.my_family_name;
      const other_family_name = session.metadata?.other_family_name;
      const wedding_name = session.metadata?.wedding_name || null;
      const wedding_date = session.metadata?.wedding_date || null;

      const chosson_family = my_side === 'chosson' ? my_family_name : other_family_name;
      const kallah_family = my_side === 'kallah' ? my_family_name : other_family_name;

      const { data: newWedding, error: weddingError } = await supabase
        .from('weddings')
        .insert({
          side_a_user_id: user_id,
          chosson_family,
          kallah_family,
          wedding_name,
          wedding_date
        })
        .select()
        .single();

      if (weddingError || !newWedding) {
        console.error('Failed to create new wedding after payment', weddingError?.message, session.id);
        return new Response('ok', { status: 200 });
      }

      wedding_id = newWedding.id;

      const { error: familySettingsError } = await supabase.from('family_settings').insert({
        user_id,
        wedding_id,
        my_side,
        my_family_name,
        other_family_name
      });

      if (familySettingsError) {
        console.error('Failed to create family_settings for new wedding', familySettingsError.message, session.id);
      }

      // Make the newly-paid wedding the active one, so the user lands on it after checkout
      const { error: activeWeddingError } = await supabase.from('user_settings').upsert(
        { user_id, active_wedding_id: wedding_id, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

      if (activeWeddingError) {
        console.error('Failed to set active_wedding_id after new wedding payment', activeWeddingError.message, session.id);
      }
    }

    if (!wedding_id) {
      console.error('No wedding_id resolved for checkout session', session.id);
      return new Response('ok', { status: 200 });
    }

    // One subscription row per wedding — upsert keyed on wedding_id.
    const { error: subscriptionError } = await supabase.from('subscriptions').upsert(
      {
        user_id,
        wedding_id,
        email,
        plan,
        status: 'active',
        expires_at: expires_at.toISOString(),
      },
      { onConflict: 'wedding_id' }
    );

    if (subscriptionError) {
      console.error('Failed to upsert subscription', subscriptionError.message, session.id);
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