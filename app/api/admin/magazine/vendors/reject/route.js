import { createClient } from '@supabase/supabase-js';
import { sendVendorRejection } from '../../../../../../lib/email/sendVendorRejection';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id, reason } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Vendor id is required.' }), { status: 400 });
    }
    if (!reason || !reason.trim()) {
      return new Response(JSON.stringify({ error: 'A rejection reason is required.' }), { status: 400 });
    }

    // Look up the vendor first, since we need their email/name before deleting the row
    const { data: vendor, error: fetchError } = await supabase
      .from('magazine_vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !vendor) {
      console.error('Failed to find vendor to reject', fetchError?.message);
      return new Response(JSON.stringify({ error: 'Vendor not found.' }), { status: 404 });
    }

    if (vendor.email) {
      try {
        await sendVendorRejection(vendor.email, vendor.name, reason.trim());
      } catch (emailErr) {
        console.error('Failed to send vendor rejection email', emailErr);
      }
    }

    const { error: deleteError } = await supabase
      .from('magazine_vendors')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete rejected vendor', deleteError.message);
      return new Response(JSON.stringify({ error: 'Failed to reject vendor.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error rejecting vendor', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}