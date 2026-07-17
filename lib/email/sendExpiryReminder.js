// lib/email/sendExpiryReminder.js
// Sends a one-time reminder email 2 weeks before a paid user's 1-year edit access expires.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Sends the 1-year access expiry reminder email.
 * @param {string} email - User's email
 * @param {string|Date} expiresAt - When edit access expires
 */
async function sendExpiryReminder(email, expiresAt) {
  const html = wrapEmail({
    heading: 'Your Access Expires in 2 Weeks',
    bodyHtml: `
      <p style="font-size: 15px; line-height: 1.6;">
        Your SimchaPro edit access is set to expire on <strong>${formatDate(expiresAt)}</strong>.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Renew now to keep full edit access to your Simcha Checklist and Expense Tracker — your data stays exactly as you left it.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        Renewal options: <strong>$49/year</strong> or <strong>$29/6 months</strong>.
      </p>
      <p style="font-size: 15px; line-height: 1.6;">
        After your access expires, you'll still be able to view your data, but won't be able to add or edit anything until you renew.
      </p>
    `,
    buttonText: 'Renew Now',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/renew`,
    footerNote: 'Questions? Just reply to this email.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: 'Your SimchaPro Access Expires in 2 Weeks',
    html
  })
}

module.exports = { sendExpiryReminder }