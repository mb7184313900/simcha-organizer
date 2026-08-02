import { createClient } from '@supabase/supabase-js';
import { sendVendorEditApproved } from '../../../../../../lib/email/sendVendorEditApproved';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Edit request id is required.' }), { status: 400 });
    }

    // Fetch fresh, since a category may have just been assigned to this row.
    const { data: pending, error: fetchError } = await supabase
      .from('magazine_vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !pending) {
      console.error('Failed to find edit request', fetchError?.message);
      return new Response(JSON.stringify({ error: 'Edit request not found.' }), { status: 404 });
    }

    if (!pending.edit_of_vendor_id) {
      return new Response(JSON.stringify({ error: 'This submission is not an edit request.' }), { status: 400 });
    }

    // Copy the requested content fields onto the original, live vendor row.
    // id, created_at, view_count, click stats, sort_order, status, and
    // is_published are intentionally left untouched.
    const updatePayload = {
      name: pending.name,
      category_id: pending.category_id,
      custom_category_text: null,
      phone: pending.phone,
      whatsapp: pending.whatsapp,
      website: pending.website,
      instagram: pending.instagram,
      blurb: pending.blurb,
      location: pending.location,
      thumbnail_image_url: pending.thumbnail_image_url,
      ad_image_url: pending.ad_image_url,
      regular_coupon_text: pending.regular_coupon_text,
      regular_coupon_expiration: pending.regular_coupon_expiration,
      exclusive_coupon_text: pending.exclusive_coupon_text,
      exclusive_coupon_expiration: pending.exclusive_coupon_expiration,
    };

    const { data: updatedVendor, error: updateError } = await supabase
      .from('magazine_vendors')
      .update(updatePayload)
      .eq('id', pending.edit_of_vendor_id)
      .select()
      .single();

    if (updateError || !updatedVendor) {
      console.error('Failed to apply vendor edit', updateError?.message);
      return new Response(
        JSON.stringify({ error: 'Failed to apply edits — the original vendor may no longer exist.' }),
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from('magazine_vendors')
      .delete()
      .eq('id', pending.id);

    if (deleteError) {
      console.error('Failed to delete pending edit request', deleteError.message);
      return new Response(
        JSON.stringify({ error: 'Edits were applied, but the pending request could not be cleaned up.' }),
        { status: 500 }
      );
    }

    if (updatedVendor.email) {
      try {
        await sendVendorEditApproved(updatedVendor.email, updatedVendor.name, updatedVendor.category_id, updatedVendor.id);
      } catch (emailErr) {
        console.error('Failed to send vendor edit-approved email', emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, vendor: updatedVendor }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error approving vendor edit request', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}
