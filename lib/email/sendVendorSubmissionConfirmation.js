// lib/email/sendVendorSubmissionConfirmation.js
// Sends a confirmation email when a vendor submits a listing via /advertise.
// Called from app/api/advertise/submit/route.js right after the row is saved
// to magazine_vendors with status: 'pending'.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a "we received your submission" email to a vendor.
 * @param {string} email - Vendor's email address
 * @param {string} vendorName - Vendor's business name
 */
async function sendVendorSubmissionConfirmation(email, vendorName) {
  const html = wrapEmail({
    heading: `Thank You, ${vendorName}! 🙏`,
    bodyHtml: `
      <p>
        We've received your listing submission for the SimchaPro Vendor Directory, and we're excited you want to be part of our community.
      </p>
      <p>
        Every submission is carefully reviewed by our team before it goes live, so your listing looks great and fits our directory guidelines. This usually doesn't take long.
      </p>
      <p>
        <strong>You'll receive another email as soon as your listing has been reviewed</strong> — whether it's approved and published, or if we need any changes first.
      </p>
      <p>
        <strong>Please do not submit another listing in the meantime.</strong> One submission is all we need, and duplicate entries can slow down the review process.
      </p>
      <p>
        Thank you again for choosing to advertise with SimchaPro — we look forward to featuring your business!
      </p>
    `,
    footerNote: 'This is a confirmation email — no action is needed from you right now.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: 'We Received Your SimchaPro Listing Submission',
    html
  })
}

module.exports = { sendVendorSubmissionConfirmation }