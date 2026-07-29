import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { wrapEmail } from '../../../../lib/email/templates';
import { sendVendorSubmissionConfirmation } from '../../../../lib/email/sendVendorSubmissionConfirmation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const MIN_SUBMIT_SECONDS = 3;

async function verifyTurnstile(token, remoteIp) {
  if (!token) return false;

  const params = new URLSearchParams();
  params.append('secret', process.env.TURNSTILE_SECRET_KEY);
  params.append('response', token);
  if (remoteIp) params.append('remoteip', remoteIp);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: params,
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      category_id,
      phone,
      whatsapp,
      email,
      website,
      instagram,
      blurb,
      location,
      coupon_text,
      image,
      honeypot,
      formLoadedAt,
      turnstileToken,
    } = body;

    // Honeypot: real users never fill this hidden field. Pretend success so bots don't adapt.
    if (honeypot) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // Time-trap: bots tend to submit near-instantly after loading the form.
    if (formLoadedAt && Date.now() - formLoadedAt < MIN_SUBMIT_SECONDS * 1000) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    const remoteIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const captchaValid = await verifyTurnstile(turnstileToken, remoteIp);
    if (!captchaValid) {
      return new Response(
        JSON.stringify({ error: 'Verification failed. Please try again.' }),
        { status: 400 }
      );
    }

    if (!name || !category_id || !email) {
      return new Response(
        JSON.stringify({ error: 'Business Name, Category, and Email are required.' }),
        { status: 400 }
      );
    }

    const { data: newVendor, error: insertError } = await supabase
      .from('magazine_vendors')
      .insert({
        name,
        category_id,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email,
        website: website || null,
        instagram: instagram || null,
        blurb: blurb || null,
        location: location || null,
        coupon_text: coupon_text || null,
        ad_image_url: image || null,
        thumbnail_image_url: image || null,
        status: 'pending',
        is_published: false,
        is_self_submitted: true,
        amount_paid: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert vendor submission', insertError.message);
      return new Response(
        JSON.stringify({ error: 'Something went wrong. Please try again.' }),
        { status: 500 }
      );
    }

    // Notify admin of the new submission
    try {
      const html = wrapEmail({
        heading: 'New Vendor Submission 📋',
        bodyHtml: `
          <p style="font-size: 15px; line-height: 1.6;">
            <strong>${name}</strong> just submitted a listing for the Simcha Magazine and is pending your approval.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Email: <strong>${email}</strong>
          </p>
        `,
        buttonText: 'Review Pending Vendors',
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/magazine/vendors?filter=pending`,
        footerNote: 'This is an automated notification from SimchaPro.',
      });

      await resend.emails.send({
        from: 'SimchaPro <noreply@simchapro.com>',
        to: 'info@simchapro.com',
        subject: `New Vendor Submission: ${name}`,
        html,
      });
    } catch (emailErr) {
      console.error('Failed to send admin notification email', emailErr);
    }

    // Send confirmation email to the vendor
    try {
      await sendVendorSubmissionConfirmation(email, name);
    } catch (vendorEmailErr) {
      console.error('Failed to send vendor submission confirmation email', vendorEmailErr);
    }

    return new Response(JSON.stringify({ success: true, vendor: newVendor }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error in vendor submission', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500 }
    );
  }
}