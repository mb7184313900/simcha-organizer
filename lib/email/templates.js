// lib/email/templates.js
// Shared branded HTML wrapper for all SimchaPro emails.
// Navy (#141d33) + Gold (#C9A227) branding with logo, matching the site's visual identity.

/**
 * Wraps email body content in the standard SimchaPro branded layout.
 *
 * @param {Object} options
 * @param {string} options.heading - Main heading shown under the logo (e.g. "Payment Received!")
 * @param {string} options.bodyHtml - Inner HTML content (paragraphs, etc.) - caller controls this
 * @param {string} [options.buttonText] - Optional CTA button text
 * @param {string} [options.buttonUrl] - Optional CTA button URL (required if buttonText is set)
 * @param {string} [options.footerNote] - Optional small note shown at the very bottom
 * @returns {string} Full HTML email string
 */
function wrapEmail({ heading, bodyHtml, buttonText, buttonUrl, footerNote }) {
  return `
    <div style="background-color: #f4f4f4; padding: 32px 12px; font-family: Georgia, 'Times New Roman', serif;">
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

        <!-- Header -->
        <div style="background-color: #141d33; padding: 28px 24px; text-align: center;">
          <img
            src="https://simchapro.com/assets/logo/simchapro-logo-gold-transparent.png"
            alt="SimchaPro"
            width="48"
            height="48"
            style="height: 48px; width: 48px; margin-bottom: 8px;"
          />
          <p style="color: #C9A227; font-size: 13px; letter-spacing: 0.5px; margin: 0; text-transform: uppercase;">
            Simcha Planning Made Simple
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px; color: #1a1a1a;">
          <h1 style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; color: #141d33; font-size: 22px; margin: 0 0 20px 0;">
            ${heading}
          </h1>

          <div style="font-size: 15px; line-height: 1.6; color: #333;">
            ${bodyHtml}
          </div>

          ${buttonText && buttonUrl ? `
          <div style="text-align: center; margin: 32px 0 8px 0;">
            <a href="${buttonUrl}" style="background-color: #C9A227; color: #141d33; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              ${buttonText}
            </a>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f9f8f4; padding: 18px 24px; border-top: 1px solid #eee; text-align: center;">
          <p style="font-size: 13px; color: #888; margin: 0;">
            ${footerNote || 'Questions? Just reply to this email.'}
          </p>
          <p style="font-size: 12px; color: #aaa; margin: 8px 0 0 0;">
            SimchaPro &middot; simchapro.com
          </p>
        </div>

      </div>
    </div>
  `
}

module.exports = { wrapEmail }