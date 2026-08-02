import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { wrapEmail } from '../../../../lib/email/templates';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

function couponFieldNames(type) {
  return type === 'exclusive'
    ? { textField: 'exclusive_coupon_text', expirationField: 'exclusive_coupon_expiration' }
    : { textField: 'regular_coupon_text', expirationField: 'regular_coupon_expiration' };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const type = searchParams.get('type') === 'exclusive' ? 'exclusive' : 'regular';

    if (!token) {
      return new Response(JSON.stringify({ error: 'This link is invalid or has expired.' }), { status: 400 });
    }

    const { textField, expirationField } = couponFieldNames(type);

    const { data: vendor, error } = await supabase
      .from('magazine_vendors')
      .select(`id, name, ${textField}, ${expirationField}`)
      .eq('coupon_extend_token', token)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !vendor) {
      return new Response(JSON.stringify({ error: 'This link is invalid or has expired.' }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        vendorName: vendor.name,
        type,
        couponText: vendor[textField] || '',
        expirationDate: vendor[expirationField] || '',
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error looking up coupon extend token', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { token, couponText, expirationDate } = body;
    const type = body.type === 'exclusive' ? 'exclusive' : 'regular';

    if (!token) {
      return new Response(JSON.stringify({ error: 'This link is invalid or has expired.' }), { status: 400 });
    }
    if (!couponText || !couponText.trim()) {
      return new Response(JSON.stringify({ error: 'Coupon text is required.' }), { status: 400 });
    }

    const { data: vendor, error: fetchError } = await supabase
      .from('magazine_vendors')
      .select('*')
      .eq('coupon_extend_token', token)
      .eq('status', 'active')
      .maybeSingle();

    if (fetchError || !vendor) {
      return new Response(JSON.stringify({ error: 'This link is invalid or has expired.' }), { status: 404 });
    }

    // Don't let a resubmission pile up behind an unreviewed one — same rule as regular edit requests.
    await supabase
      .from('magazine_vendors')
      .delete()
      .eq('edit_of_vendor_id', vendor.id)
      .eq('status', 'pending');

    const { textField, expirationField } = couponFieldNames(type);

    const insertPayload = {
      name: vendor.name,
      category_id: vendor.category_id,
      custom_category_text: null,
      phone: vendor.phone,
      whatsapp: vendor.whatsapp,
      email: vendor.email,
      website: vendor.website,
      instagram: vendor.instagram,
      blurb: vendor.blurb,
      location: vendor.location,
      ad_image_url: vendor.ad_image_url,
      thumbnail_image_url: vendor.thumbnail_image_url,
      regular_coupon_text: vendor.regular_coupon_text,
      regular_coupon_expiration: vendor.regular_coupon_expiration,
      exclusive_coupon_text: vendor.exclusive_coupon_text,
      exclusive_coupon_expiration: vendor.exclusive_coupon_expiration,
      vendor_note_to_admin: `Coupon extension request (${type}) submitted via self-service link.`,
      status: 'pending',
      is_published: false,
      is_self_submitted: true,
      amount_paid: 0,
      edit_of_vendor_id: vendor.id,
    };

    // Only the requested coupon type's fields actually change.
    insertPayload[textField] = couponText.trim();
    insertPayload[expirationField] = expirationDate || null;

    const { error: insertError } = await supabase
      .from('magazine_vendors')
      .insert(insertPayload);

    if (insertError) {
      console.error('Failed to create coupon extension request', insertError.message);
      return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
    }

    try {
      const html = wrapEmail({
        heading: 'Coupon Extension Request 📋',
        bodyHtml: `
          <p style="font-size: 15px; line-height: 1.6;">
            <strong>${vendor.name}</strong> requested to extend/update their ${type} coupon and it's pending your approval.
          </p>
        `,
        buttonText: 'Review Pending Vendors',
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/magazine/vendors?filter=pending`,
        footerNote: 'This is an automated notification from SimchaPro.',
      });

      await resend.emails.send({
        from: 'SimchaPro <noreply@simchapro.com>',
        to: 'info@simchapro.com',
        subject: `Coupon Extension Request: ${vendor.name}`,
        html,
      });
    } catch (emailErr) {
      console.error('Failed to send coupon extension admin notification', emailErr);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error submitting coupon extension request', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}
