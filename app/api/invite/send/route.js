import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { invitedEmail, ownerUserId, weddingId, ownerFamilyName, ownerSide, chossonFamily, kallahFamily } = await req.json()

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    await supabase.from('wedding_invites').insert({
      owner_user_id: ownerUserId,
      wedding_id: weddingId,
      owner_family_name: ownerFamilyName,
      owner_side: ownerSide,
      invited_email: invitedEmail,
      invite_token: token,
      status: 'pending'
    })

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`
    const otherSide = ownerSide === 'chosson' ? 'Kallah' : 'Chosson'

    await resend.emails.send({
      from: 'SimchaPro <noreply@simchapro.com>',
      to: invitedEmail,
      subject: `You're invited to join SimchaPro — ${chossonFamily} & ${kallahFamily}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
          <h1 style="color: #1a3c8f; font-size: 24px; margin-bottom: 4px;">SimchaPro</h1>
          <p style="color: #666; font-size: 14px; margin-top: 0;">Simcha Planning Made Simple</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <h2 style="font-size: 20px; color: #1a1a1a;">Mazel Tov! 🎉</h2>
          <p style="font-size: 15px; line-height: 1.6;">
            The <strong>${ownerFamilyName}</strong> family has invited you to collaborate on SimchaPro
            for the upcoming wedding of <strong>${chossonFamily} & ${kallahFamily}</strong>.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            As the <strong>${otherSide}'s side</strong>, you'll be able to view and add shared expenses together.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteUrl}" style="background-color: #1a3c8f; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 13px; color: #999; text-align: center;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>
      `
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}