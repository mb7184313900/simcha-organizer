// lib/email/sendVendorApproval.js
// Sends a celebratory email when admin approves a vendor listing
// in /admin/magazine/vendors. Called right after status is set to 'approved'
// and is_published is set to true in magazine_vendors.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends an approval/congratulations email to a vendor whose listing just went live.
 * @param {string} email - Vendor's email address
 * @param {string} vendorName - Vendor's business name
 * @param {string} categoryId - The vendor's category_id (used to build the listing URL)
 * @param {string} vendorId - The vendor's id (used to build the listing URL)
 */
async function sendVendorApproval(email, vendorName, categoryId, vendorId) {
  const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/magazine/vendors/${categoryId}/${vendorId}`

  const html = wrapEmail({
    heading: `Congratulations, ${vendorName}! 🎉`,
    bodyHtml: `
      <p>
        Great news — your listing has been reviewed and approved, and it's now <strong>live</strong> on the SimchaPro Vendor Directory!
      </p>
      <p>
        Families planning their simcha can now find you, see your details, and reach out directly.
      </p>
      <p>
        We'd love for you to share your listing with your customers, friends, and family — every share helps more people discover your business.
      </p>
      <p>
        Thank you for being part of the SimchaPro community. We're excited to help your business grow!
      </p>
    `,
    buttonText: 'View My Live Listing',
    buttonUrl: listingUrl,
    footerNote: 'Questions about your listing? Just reply to this email.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: `Your SimchaPro Listing Is Live! 🎉`,
    html
  })
}

module.exports = { sendVendorApproval }