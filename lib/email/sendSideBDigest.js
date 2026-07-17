// lib/email/sendSideBDigest.js
// Sends a daily digest email to Side A summarizing payments the other family
// (Side B) added or edited that day. Only sent if there was activity.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends the Side B daily activity digest email.
 * @param {string} email - Side A's email
 * @param {string} otherFamilyName - Side B's family name
 * @param {Array} activities - Array of { vendorName, amount, paymentMethod, paymentType, action }
 *   action is either 'added' or 'edited'
 */
async function sendSideBDigest(email, otherFamilyName, activities) {
  if (!activities || activities.length === 0) return

  const rowsHtml = activities.map(a => `
    <div style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">
      <strong>${otherFamilyName}</strong> ${a.action} a <strong>$${a.amount.toLocaleString()}</strong>
      ${a.paymentMethod} payment (${a.paymentType}) to <strong>${a.vendorName}</strong>
    </div>
  `).join('')

  const html = wrapEmail({
    heading: `${otherFamilyName}'s Activity Today`,
    bodyHtml: `
      <p style="font-size: 15px; line-height: 1.6;">
        Here's a summary of what ${otherFamilyName} added or updated in your shared expense tracker today:
      </p>
      <div style="margin: 20px 0;">
        ${rowsHtml}
      </div>
    `,
    buttonText: 'View Expense Tracker',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/budget`,
    footerNote: 'You are receiving this because you have shared access enabled with the other family.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: `${otherFamilyName} made updates to your shared expenses`,
    html
  })
}

module.exports = { sendSideBDigest }