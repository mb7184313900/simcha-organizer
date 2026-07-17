// lib/email/templates.js
// Shared branded HTML wrapper for all SimchaPro emails.
// Matches the visual style of the existing Wedding Invite email
// (app/api/invite/send/route.js) so every email feels consistent.

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
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <h1 style="color: #1a3c8f; font-size: 24px; margin-bottom: 4px;">SimchaPro</h1>
      <p style="color: #666; font-size: 14px; margin-top: 0;">Simcha Planning Made Simple</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <h2 style="font-size: 20px; color: #1a1a1a;">${heading}</h2>
      ${bodyHtml}
      ${buttonText && buttonUrl ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${buttonUrl}" style="background-color: #1a3c8f; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${buttonText}
        </a>
      </div>
      ` : ''}
      <p style="font-size: 13px; color: #999; text-align: center; margin-top: 24px;">
        ${footerNote || 'Questions? Just reply to this email.'}
      </p>
    </div>
  `
}

module.exports = { wrapEmail }