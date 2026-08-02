// lib/email/sendCouponExpirationReminder.js
// Reminds a vendor that one of their self-submitted coupons (regular or
// exclusive) is about to expire, with a link to extend/update it themselves.
// Called from the daily cron job in app/api/cron/daily-emails/route.js.

const { Resend } = require('resend')
const { wrapEmail } = require('./templates')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * @param {string} email - Vendor's email address
 * @param {string} vendorName - Vendor's business name
 * @param {'regular'|'exclusive'} couponType - Which coupon is expiring
 * @param {string} expirationDate - The coupon's expiration date (YYYY-MM-DD)
 * @param {string} token - The vendor's coupon_extend_token
 */
async function sendCouponExpirationReminder(email, vendorName, couponType, expirationDate, token) {
  const label = couponType === 'exclusive' ? 'Exclusive' : 'Regular'
  const extendUrl = `${process.env.NEXT_PUBLIC_APP_URL}/advertise/extend-coupon?token=${token}&type=${couponType}`

  const html = wrapEmail({
    heading: `Your ${label} Coupon is Expiring Soon`,
    bodyHtml: `
      <p>
        Hi ${vendorName}, your <strong>${label.toLowerCase()}</strong> coupon on Simcha Magazine is set to expire on <strong>${expirationDate}</strong>.
      </p>
      <p>
        If you'd like to extend the expiration date or update the coupon text, you can do so below. Your update will be reviewed before it goes live.
      </p>
    `,
    buttonText: 'Extend My Coupon',
    buttonUrl: extendUrl,
    footerNote: 'Questions about this? Just reply to this email.'
  })

  await resend.emails.send({
    from: 'SimchaPro <noreply@simchapro.com>',
    to: email,
    subject: `Your ${label} Coupon is Expiring Soon`,
    html
  })
}

module.exports = { sendCouponExpirationReminder }
