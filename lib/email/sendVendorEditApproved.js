// lib/email/sendVendorEditApproved.js
// Sends a confirmation email when admin approves an edit request against an
// existing vendor listing in /admin/magazine/vendors. Called right after the
// requested changes are copied onto the live vendor row.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Sends a confirmation email to a vendor whose edit request was just approved.
 * @param {string} email - Vendor's email address
 * @param {string} vendorName - Vendor's business name
 * @param {string} categoryId - The vendor's category_id (used to build the listing URL)
 * @param {string} vendorId - The vendor's id (used to build the listing URL)
 */
async function sendVendorEditApproved(email, vendorName, categoryId, vendorId) {
  const listingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/magazine/vendors/${categoryId}/${vendorId}`

  const html = wrapEmail({
    heading: `Your Listing Has Been Updated`,
    bodyHtml: `
      <p>
        Good news, ${vendorName} — the changes to your listing on Simcha Magazine have been approved and are now live!
      </p>
      <p>
        Take a look to make sure everything appears the way you'd like.
      </p>
    `,
    buttonText: 'View My Live Listing',
    buttonUrl: listingUrl,
    footerNote: 'Questions about your listing? Just reply to this email.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: `Your SimchaPro Listing Has Been Updated`,
    html
  })
}

module.exports = { sendVendorEditApproved }
