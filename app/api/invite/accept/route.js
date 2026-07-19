import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { userId, inviteToken } = await req.json()

    if (!userId || !inviteToken) {
      return Response.json({ error: 'Missing userId or inviteToken' }, { status: 400 })
    }

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('wedding_invites')
      .select('*')
      .eq('invite_token', inviteToken)
      .single()

    if (inviteError || !invite) {
      return Response.json({ error: 'Invite not found', detail: inviteError?.message }, { status: 404 })
    }

    // Mark invite as accepted
    const { error: updateError } = await supabase.from('wedding_invites').update({
      status: 'accepted',
      accepted_by_user_id: userId
    }).eq('invite_token', inviteToken)

    if (updateError) {
      return Response.json({ error: 'Failed to update invite', detail: updateError.message }, { status: 500 })
    }

    // Get owner's family settings
    const { data: ownerSettings, error: settingsError } = await supabase
      .from('family_settings')
      .select('*')
      .eq('user_id', invite.owner_user_id)
      .single()

    if (settingsError || !ownerSettings) {
      return Response.json({ error: 'Owner settings not found', detail: settingsError?.message }, { status: 500 })
    }

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
      const { error: insertError } = await supabase.from('family_settings').insert({
        user_id: userId,
        my_side: sideBSide,
        my_family_name: ownerSettings.other_family_name,
        other_family_name: ownerSettings.my_family_name,
        custom_categories: ownerSettings.custom_categories,
        custom_occasions: ownerSettings.custom_occasions
      })
      if (insertError) {
        return Response.json({ error: 'Failed to create family settings', detail: insertError.message }, { status: 500 })
      }
    }

    // Link Side B into the weddings row (if one exists for this owner)
    const { error: weddingLinkError } = await supabase
      .from('weddings')
      .update({ side_b_user_id: userId })
      .eq('side_a_user_id', invite.owner_user_id)

    if (weddingLinkError) {
      console.error('Failed to link side_b_user_id on weddings row:', weddingLinkError.message)
      // Not fatal — invite acceptance still succeeds even if this fails
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Accept invite error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}