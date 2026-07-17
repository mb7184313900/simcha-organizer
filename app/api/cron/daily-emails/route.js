import { createClient } from '@supabase/supabase-js'
import { sendTrialWarning } from '../../../../lib/email/sendTrialWarning'
import { sendExpiryReminder } from '../../../../lib/email/sendExpiryReminder'
import { sendSideBDigest } from '../../../../lib/email/sendSideBDigest'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  // --- Security check: only Vercel's cron system (or someone with the secret) can trigger this ---
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const results = { trialWarnings: 0, expiryReminders: 0, sideBDigests: 0, errors: [] }

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

  return Response.json(results)
}