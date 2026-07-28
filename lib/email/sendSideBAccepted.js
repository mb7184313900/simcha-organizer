// lib/email/sendSideBAccepted.js
// Sends a notification to Side A when Side B accepts their wedding invitation.
// Called from app/api/invite/accept/route.js after the invite is successfully accepted.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Notifies Side A that Side B has accepted their invite and joined the wedding.
 * @param {string} ownerEmail - Side A's email address
 * @param {string} sideBName - Side B's family name (or email, as fallback) to display
 */
async function sendSideBAcceptedEmail(ownerEmail, sideBName) {
  const html = wrapEmail({
    heading: 'Mazel Tov! 🎉',
    bodyHtml: `
      <p style="font-size: 15px; line-height: 1.6;">
        Great news — <strong>${sideBName}</strong> has accepted your invitation and joined your wedding on SimchaPro!
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        You now have shared access to plan together — expenses, checklists, and every detail in between.
      </p>
    `,
    buttonText: 'Go to My Dashboard',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    footerNote: 'This is an automatic notification — no action needed.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: ownerEmail,
    subject: `${sideBName} has joined your wedding on SimchaPro!`,
    html
  })
}

module.exports = { sendSideBAcceptedEmail }