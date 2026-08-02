import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { wrapEmail } from '../../../../lib/email/templates'
import { sendTrialWarning } from '../../../../lib/email/sendTrialWarning'
import { sendExpiryReminder } from '../../../../lib/email/sendExpiryReminder'
import { sendSideBDigest } from '../../../../lib/email/sendSideBDigest'
import { sendCouponExpirationReminder } from '../../../../lib/email/sendCouponExpirationReminder'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

// Coupon expiration reminders only look at vendor-submitted coupons on
// magazine_vendors, not the separately-managed `coupons` table.
const COUPON_REMINDER_WINDOW_DAYS = 7

function isExpiringSoon(expirationDateStr, now, windowDays) {
  if (!expirationDateStr) return false
  const expiration = new Date(`${expirationDateStr}T23:59:59`)
  const msUntil = expiration.getTime() - now.getTime()
  if (msUntil < 0) return false // already expired
  return msUntil <= windowDays * 24 * 60 * 60 * 1000
}

export async function GET(req) {
  // --- Security check: only Vercel's cron system (or someone with the secret) can trigger this ---
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const results = {
    trialWarnings: 0,
    expiryReminders: 0,
    sideBDigests: 0,
    regularCouponReminders: 0,
    exclusiveCouponReminders: 0,
    errors: [],
  }

  // ============================================================
  // 1. TRIAL EXPIRY WARNING — trial ends within 2 days, not yet sent
  // ============================================================
  try {
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const { data: trialsEndingSoon } = await supabase
      .from('subscriptions')
      .select('id, user_id, email, expires_at')
      .eq('plan', 'trial')
      .eq('trial_warning_sent', false)
      .not('expires_at', 'is', null)
      .lte('expires_at', twoDaysFromNow.toISOString())
      .gt('expires_at', now.toISOString())

    for (const row of trialsEndingSoon || []) {
      try {
        await sendTrialWarning(row.email, row.expires_at)
        await supabase.from('subscriptions').update({ trial_warning_sent: true }).eq('id', row.id)
        results.trialWarnings++
      } catch (err) {
        results.errors.push(`trial warning for ${row.email}: ${err.message}`)
      }
    }
  } catch (err) {
    results.errors.push(`trial warning query: ${err.message}`)
  }

  // ============================================================
  // 2. EXPIRY REMINDER — paid access ends within 2 weeks, not yet sent
  // ============================================================
  try {
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    const { data: expiringSoon } = await supabase
      .from('subscriptions')
      .select('id, user_id, email, expires_at')
      .eq('status', 'active')
      .eq('expiry_reminder_sent', false)
      .not('expires_at', 'is', null)
      .lte('expires_at', twoWeeksFromNow.toISOString())
      .gt('expires_at', now.toISOString())

    for (const row of expiringSoon || []) {
      try {
        await sendExpiryReminder(row.email, row.expires_at)
        await supabase.from('subscriptions').update({ expiry_reminder_sent: true }).eq('id', row.id)
        results.expiryReminders++
      } catch (err) {
        results.errors.push(`expiry reminder for ${row.email}: ${err.message}`)
      }
    }
  } catch (err) {
    results.errors.push(`expiry reminder query: ${err.message}`)
  }

  // ============================================================
  // 3. SIDE B ACTIVITY DIGEST — payments added/edited by Side B in the last 24 hours
  // ============================================================
  try {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    const { data: recentAdds } = await supabase
      .from('payments')
      .select('id, vendor_id, amount, payment_method, payment_type, created_by, created_at')
      .gte('created_at', oneDayAgo)

    const { data: recentEdits } = await supabase
      .from('payments')
      .select('id, vendor_id, amount, payment_method, payment_type, last_edited_by, updated_at')
      .not('updated_at', 'is', null)
      .gte('updated_at', oneDayAgo)

    // Group activity by Side A owner (vendor.user_id)
    const activityByOwner = {} // { ownerId: [ { vendorName, amount, paymentMethod, paymentType, action } ] }

    const processRows = async (rows, actorField, actionLabel) => {
      for (const row of rows || []) {
        const actorId = row[actorField]
        if (!actorId) continue

        const { data: vendor } = await supabase
          .from('vendors')
          .select('id, name, user_id, is_shared')
          .eq('id', row.vendor_id)
          .maybeSingle()

        if (!vendor || !vendor.is_shared) continue
        // Only count it if the actor is NOT the Side A owner (i.e. it was Side B)
        if (actorId === vendor.user_id) continue

        if (!activityByOwner[vendor.user_id]) activityByOwner[vendor.user_id] = []
        activityByOwner[vendor.user_id].push({
          vendorName: vendor.name,
          amount: row.amount,
          paymentMethod: row.payment_method || 'Cash',
          paymentType: row.payment_type || 'Payment',
          action: actionLabel
        })
      }
    }

    await processRows(recentAdds, 'created_by', 'added')
    await processRows(recentEdits, 'last_edited_by', 'edited')

    for (const ownerId of Object.keys(activityByOwner)) {
      try {
        const { data: ownerSub } = await supabase
          .from('subscriptions')
          .select('email')
          .eq('user_id', ownerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { data: fs } = await supabase
          .from('family_settings')
          .select('other_family_name')
          .eq('user_id', ownerId)
          .maybeSingle()

        if (ownerSub?.email) {
          await sendSideBDigest(ownerSub.email, fs?.other_family_name || 'The other family', activityByOwner[ownerId])
          results.sideBDigests++
        }
      } catch (err) {
        results.errors.push(`side B digest for owner ${ownerId}: ${err.message}`)
      }
    }
  } catch (err) {
    results.errors.push(`side B digest query: ${err.message}`)
  }

  // ============================================================
  // 4. COUPON EXPIRATION REMINDER — vendor-submitted coupon (regular_coupon_text
  // / exclusive_coupon_text on magazine_vendors) expires within 7 days, not yet sent
  // ============================================================
  const processCouponReminders = async (couponType, textField, expirationField, reminderField) => {
    try {
      const { data: candidates } = await supabase
        .from('magazine_vendors')
        .select(`id, name, email, category_id, coupon_extend_token, ${textField}, ${expirationField}`)
        .eq('is_published', true)
        .eq('status', 'active')
        .not(textField, 'is', null)
        .not(expirationField, 'is', null)
        .eq(reminderField, false)

      for (const vendor of candidates || []) {
        if (!isExpiringSoon(vendor[expirationField], now, COUPON_REMINDER_WINDOW_DAYS)) continue

        try {
          let token = vendor.coupon_extend_token
          if (!token) {
            token = crypto.randomBytes(32).toString('hex')
            await supabase.from('magazine_vendors').update({ coupon_extend_token: token }).eq('id', vendor.id)
          }

          if (vendor.email) {
            await sendCouponExpirationReminder(vendor.email, vendor.name, couponType, vendor[expirationField], token)
          }

          try {
            const html = wrapEmail({
              heading: 'Coupon Expiring Soon',
              bodyHtml: `
                <p style="font-size: 15px; line-height: 1.6;">
                  <strong>${vendor.name}</strong>'s ${couponType} coupon expires on <strong>${vendor[expirationField]}</strong> — vendor has been notified.
                </p>
              `,
              footerNote: 'This is an automated notification from SimchaPro.',
            })

            await resend.emails.send({
              from: 'SimchaPro <noreply@simchapro.com>',
              to: 'info@simchapro.com',
              subject: `${vendor.name}'s ${couponType} coupon expires soon`,
              html,
            })
          } catch (adminEmailErr) {
            results.errors.push(`coupon reminder admin email for ${vendor.name}: ${adminEmailErr.message}`)
          }

          await supabase.from('magazine_vendors').update({ [reminderField]: true }).eq('id', vendor.id)

          if (couponType === 'regular') {
            results.regularCouponReminders++
          } else {
            results.exclusiveCouponReminders++
          }
        } catch (err) {
          results.errors.push(`coupon reminder for ${vendor.name} (${couponType}): ${err.message}`)
        }
      }
    } catch (err) {
      results.errors.push(`coupon reminder query (${couponType}): ${err.message}`)
    }
  }

  await processCouponReminders('regular', 'regular_coupon_text', 'regular_coupon_expiration', 'regular_coupon_reminder_sent')
  await processCouponReminders('exclusive', 'exclusive_coupon_text', 'exclusive_coupon_expiration', 'exclusive_coupon_reminder_sent')

  return Response.json(results)
}