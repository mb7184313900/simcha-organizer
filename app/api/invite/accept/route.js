import { createClient } from '@supabase/supabase-js'
import { sendSideBAcceptedEmail } from '../../../../lib/email/sendSideBAccepted'

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

    // Get owner's family settings for THIS specific wedding
    const { data: ownerSettings, error: settingsError } = await supabase
      .from('family_settings')
      .select('*')
      .eq('user_id', invite.owner_user_id)
      .eq('wedding_id', invite.wedding_id)
      .single()

    if (settingsError || !ownerSettings) {
      return Response.json({ error: 'Owner settings not found', detail: settingsError?.message }, { status: 500 })
    }

    const sideBSide = ownerSettings.my_side === 'chosson' ? 'kallah' : 'chosson'

    // Check if Side B already has family settings for THIS specific wedding
    const { data: existing } = await supabase
      .from('family_settings')
      .select('id')
      .eq('user_id', userId)
      .eq('wedding_id', invite.wedding_id)
      .maybeSingle()

    if (existing) {
      await supabase.from('family_settings').update({
        my_side: sideBSide,
        my_family_name: ownerSettings.other_family_name,
        other_family_name: ownerSettings.my_family_name,
        custom_categories: ownerSettings.custom_categories,
        custom_occasions: ownerSettings.custom_occasions
      }).eq('user_id', userId).eq('wedding_id', invite.wedding_id)
    } else {
      const { error: insertError } = await supabase.from('family_settings').insert({
        user_id: userId,
        wedding_id: invite.wedding_id,
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

    // Link Side B into the specific weddings row this invite is for
    // (matching by wedding_id, not owner_user_id — an owner can have multiple weddings now)
    const { error: weddingLinkError } = await supabase
      .from('weddings')
      .update({ side_b_user_id: userId })
      .eq('id', invite.wedding_id)

    if (weddingLinkError) {
      console.error('Failed to link side_b_user_id on weddings row:', weddingLinkError.message)
      // Not fatal — invite acceptance still succeeds even if this fails
    }

    // Set this wedding as Side B's active wedding so they land on it automatically after login
    const { error: activeWeddingError } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: userId, active_wedding_id: invite.wedding_id, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (activeWeddingError) {
      console.error('Failed to set active_wedding_id for Side B:', activeWeddingError.message)
      // Not fatal — invite acceptance still succeeds even if this fails
    }

    // Notify Side A that Side B has accepted the invite
    try {
      const { data: ownerAuthData, error: ownerAuthError } = await supabase.auth.admin.getUserById(invite.owner_user_id)

      if (ownerAuthError || !ownerAuthData?.user?.email) {
        console.error('Failed to look up owner email for acceptance notification:', ownerAuthError?.message)
      } else {
        const sideBDisplayName = ownerSettings.other_family_name || invite.invited_email
        await sendSideBAcceptedEmail(ownerAuthData.user.email, sideBDisplayName)
      }
    } catch (emailErr) {
      console.error('Failed to send Side B accepted notification email:', emailErr.message)
      // Not fatal — invite acceptance still succeeds even if this fails
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Accept invite error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}