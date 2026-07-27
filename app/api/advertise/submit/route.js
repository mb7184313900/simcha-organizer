import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { wrapEmail } from '../../../../lib/email/templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

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
    } = body;

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

    return new Response(JSON.stringify({ success: true, vendor: newVendor }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error in vendor submission', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500 }
    );
  }
}