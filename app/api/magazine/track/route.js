import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STAT_COLUMN_MAP = {
  view: 'view_count',
  phone: 'click_phone',
  whatsapp: 'click_whatsapp',
  website: 'click_website',
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { vendorId, statType } = body;

    const column = STAT_COLUMN_MAP[statType];

    if (!vendorId || !column) {
      return new Response(JSON.stringify({ error: 'Invalid tracking request.' }), { status: 400 });
    }

    const { error } = await supabase.rpc('increment_vendor_stat', {
      vendor_id: vendorId,
      stat_column: column,
    });

    if (error) {
      console.error('Failed to increment vendor stat', error.message);
      return new Response(JSON.stringify({ error: 'Tracking failed.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Unexpected error in vendor tracking', err);
    return new Response(JSON.stringify({ error: 'Tracking failed.' }), { status: 500 });
  }
}