import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { userId, inviteToken } = await req.json()

    // Get the invite
    const { data: invite } = await supabase
      .from('wedding_invites')
      .select('*')
      .eq('invite_token', inviteToken)
      .single()

    if (!invite) return Response.json({ error: 'Invite not found' }, { status: 404 })

    // Mark invite as accepted
    await supabase.from('wedding_invites').update({
      status: 'accepted',
      accepted_by_user_id: userId
    }).eq('invite_token', inviteToken)

    // Get owner's family settings
    const { data: ownerSettings } = await supabase
      .from('family_settings')
      .select('*')
      .eq('user_id', invite.owner_user_id)
      .single()

    if (ownerSettings) {
      const sideBSide = ownerSettings.my_side === 'chosson' ? 'kallah' : 'chosson'

      // Check if Side B already has family settings
      const { data: existing } = await supabase
        .from('family_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existing) {
        await supabase.from('family_settings').update({
          my_side: sideBSide,
          my_family_name: ownerSettings.other_family_name,
          other_family_name: ownerSettings.my_family_name,
          custom_categories: ownerSettings.custom_categories,
          custom_occasions: ownerSettings.custom_occasions
        }).eq('user_id', userId)
      } else {
        await supabase.from('family_settings').insert({
          user_id: userId,
          my_side: sideBSide,
          my_family_name: ownerSettings.other_family_name,
          other_family_name: ownerSettings.my_family_name,
          custom_categories: ownerSettings.custom_categories,
          custom_occasions: ownerSettings.custom_occasions
        })
      }
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}