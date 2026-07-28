// lib/email/sendVendorRejection.js
// Sends an email when admin rejects a vendor listing in /admin/magazine/vendors.
// Called from the reject API route, along with the admin's typed-in reason.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a rejection email to a vendor, with the admin's reason and an
 * invitation to make changes and resubmit.
 * @param {string} email - Vendor's email address
 * @param {string} vendorName - Vendor's business name
 * @param {string} reason - Admin's typed-in reason for rejection
 */
async function sendVendorRejection(email, vendorName, reason) {
  const html = wrapEmail({
    heading: `About Your SimchaPro Submission`,
    bodyHtml: `
      <p>
        Thank you for submitting your listing, ${vendorName}. After review, we're not able to approve it yet — but we'd love to get it published once a few things are adjusted.
      </p>
      <div style="background: #fdf7e7; border-left: 3px solid #C9A227; border-radius: 6px; padding: 14px 16px; margin: 20px 0;">
        <p style="font-size: 14px; margin: 0 0 4px 0;"><strong>Reason:</strong></p>
        <p style="font-size: 14px; margin: 0;">${reason}</p>
      </div>
      <p>
        Please make the necessary changes and resubmit your listing at your convenience — we'll be happy to take another look.
      </p>
      <p>
        We're looking forward to featuring your business once it's ready. Thank you for your patience!
      </p>
    `,
    buttonText: 'Resubmit My Listing',
    buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL}/advertise`,
    footerNote: 'Questions about this? Just reply to this email.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: `Update on Your SimchaPro Listing Submission`,
    html
  })
}

module.exports = { sendVendorRejection }