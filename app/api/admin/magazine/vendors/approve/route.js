import { createClient } from '@supabase/supabase-js';
import { sendVendorApproval } from '../../../../../../lib/email/sendVendorApproval';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Vendor id is required.' }), { status: 400 });
    }

    const { data: vendor, error: updateError } = await supabase
      .from('magazine_vendors')
      .update({ status: 'active', is_published: true })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to approve vendor', updateError.message);
      return new Response(JSON.stringify({ error: 'Failed to approve vendor.' }), { status: 500 });
    }

    if (vendor?.email) {
      try {
        await sendVendorApproval(vendor.email, vendor.name, vendor.category_id, vendor.id);
      } catch (emailErr) {
        console.error('Failed to send vendor approval email', emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, vendor }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error approving vendor', err);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), { status: 500 });
  }
}