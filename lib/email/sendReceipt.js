// lib/email/sendReceipt.js
// Sends payment and renewal confirmation emails via Resend.
// Called from the Stripe webhook after a successful checkout.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/**
 * Sends a receipt for a brand-new $99 one-time purchase.
 * @param {string} email - Customer's email
 * @param {string|Date} expiresAt - When edit access expires
 */
async function sendPaymentReceipt(email, expiresAt) {
  const html = wrapEmail({
    heading: 'Payment Confirmed! 🎉',
    bodyHtml: `
      <p style="font-size: 15px; line-height: 1.6;">
        Thank you for your purchase! Your SimchaPro Simcha Organizer is now fully unlocked.
      </p>
      <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 14px; margin: 0 0 6px 0;"><strong>Amount charged:</strong> $99.00 (one-time)</p>
        <p style="font-size: 14px; margin: 0;"><strong>Full edit access until:</strong> ${formatDate(expiresAt)}</p>
      </div>
      <p style="font-size: 15px; line-height: 1.6;">
        After this date, your account switches to view-only unless you renew. You'll get a reminder before that happens.
      </p>
    `,
    buttonText: 'Go to My Dashboard',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    footerNote: 'This is your receipt — no action needed.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: 'Payment Confirmed — Welcome to SimchaPro!',
    html
  })
}

/**
 * Sends a receipt after a renewal payment ($49/yr or $29/6mo).
 * @param {string} email - Customer's email
 * @param {string} plan - 'annual' or 'semi_annual'
 * @param {string|Date} expiresAt - New expiry date
 */
async function sendRenewalReceipt(email, plan, expiresAt) {
  const planLabel = plan === 'semi_annual' ? '$29.00 (6-month renewal)' : '$49.00 (annual renewal)'

  const html = wrapEmail({
    heading: 'Renewal Confirmed! ✅',
    bodyHtml: `
      <p style="font-size: 15px; line-height: 1.6;">
        Your SimchaPro renewal was successful. Your full edit access continues without interruption.
      </p>
      <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="font-size: 14px; margin: 0 0 6px 0;"><strong>Amount charged:</strong> ${planLabel}</p>
        <p style="font-size: 14px; margin: 0;"><strong>Full edit access until:</strong> ${formatDate(expiresAt)}</p>
      </div>
      <p style="font-size: 15px; line-height: 1.6;">
        You'll get a reminder before your next renewal date.
      </p>
    `,
    buttonText: 'Go to My Dashboard',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    footerNote: 'This is your receipt — no action needed.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: 'Renewal Confirmed — SimchaPro',
    html
  })
}

module.exports = { sendPaymentReceipt, sendRenewalReceipt }