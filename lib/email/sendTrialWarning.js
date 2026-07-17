// lib/email/sendTrialWarning.js
// Sends a one-time warning email 2 days before a user's free trial ends.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Sends the trial expiry warning email.
 * @param {string} email - User's email
 * @param {string|Date} trialEndsAt - When the trial ends
 */
async function sendTrialWarning(email, trialEndsAt) {
  const html = wrapEmail({
    heading: 'Your Free Trial Ends Soon ⏰',
    bodyHtml: `
      <p style="font-size: 15px; line-height: 1.6;">
        Your SimchaPro free trial ends on <strong>${formatDate(trialEndsAt)}</strong>.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        To keep full edit access to your Simcha Checklist and Expense Tracker — including your vendors,
        payments, and shared family access — upgrade now for a one-time payment of <strong>$99</strong>.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        After your trial ends, you'll still be able to view your data, but won't be able to add or edit anything until you upgrade.
      </p>
    `,
    buttonText: 'Upgrade Now — $99',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    footerNote: 'Questions? Just reply to this email.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: 'Your SimchaPro Trial Ends in 2 Days',
    html
  })
}

module.exports = { sendTrialWarning }