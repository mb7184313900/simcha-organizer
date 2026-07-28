import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { wrapEmail } from '../../../../lib/email/templates'

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

    const html = wrapEmail({
      heading: 'Mazel Tov! 🎉',
      bodyHtml: `
        <p style="font-size: 15px; line-height: 1.6;">
          The <strong>${ownerFamilyName}</strong> family has invited you to collaborate on SimchaPro
          for the upcoming wedding of <strong>${chossonFamily} & ${kallahFamily}</strong>.
        </p>
        <p style="font-size: 15px; line-height: 1.6;">
          As the <strong>${otherSide}'s side</strong>, you'll be able to view and add shared expenses together.
        </p>
      `,
      buttonText: 'Accept Invitation',
      buttonUrl: inviteUrl,
      footerNote: "If you weren't expecting this invitation, you can safely ignore this email."
    })

    await resend.emails.send({
      from: 'SimchaPro <noreply@simchapro.com>',
      to: invitedEmail,
      subject: `You're invited to join SimchaPro — ${chossonFamily} & ${kallahFamily}`,
      html
    })

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}