import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

// Server-side client using the service role key.
// This bypasses RLS, which is safe here ONLY because we manually
// verify the requester's identity below before running any queries.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  // Get the caller's access token from the Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Verify the token and get the user it belongs to
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Server-side admin check -- this is the real security gate
  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Pull all subscription rows
  const { data: subs, error: subsError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, email, plan, status, created_at, wedding_id, is_free_grant')

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 })
  }

  // Group rows by user_id so we can count unique users and weddings-per-user
  const userMap = new Map()

  for (const row of subs) {
    if (!userMap.has(row.user_id)) {
      userMap.set(row.user_id, {
        user_id: row.user_id,
        email: row.email,
        weddingIds: new Set(),
        plans: [],
        earliestSignup: row.created_at,
      })
    }
    const entry = userMap.get(row.user_id)
    entry.weddingIds.add(row.wedding_id)
    entry.plans.push(row.plan)
    if (new Date(row.created_at) < new Date(entry.earliestSignup)) {
      entry.earliestSignup = row.created_at
    }
  }

  const uniqueUsers = Array.from(userMap.values())

  const totalSignups = uniqueUsers.length

  // A user counts as "trial" if ANY of their subscriptions is currently plan = 'trial'
  const totalTrialUsers = uniqueUsers.filter(u => u.plans.includes('trial')).length

  const PAID_PLANS = ['one_time', 'annual', 'semi_annual']
  const totalPaidUsers = uniqueUsers.filter(u =>
    u.plans.some(p => PAID_PLANS.includes(p))
  ).length

  // Revenue calculation based on plan values across ALL rows (not deduped --
  // each paid row represents a real payment/renewal).
  // Rows marked is_free_grant = true were manually granted free access
  // (e.g. family/friends) and are excluded from revenue.
  const PLAN_PRICES = {
    one_time: 99,
    annual: 49,
    semi_annual: 29,
  }

  let totalRevenue = 0
  for (const row of subs) {
    if (row.is_free_grant) continue
    if (PLAN_PRICES[row.plan]) {
      totalRevenue += PLAN_PRICES[row.plan]
    }
  }

  return NextResponse.json({
    totalSignups,
    totalTrialUsers,
    totalPaidUsers,
    totalRevenue,
  })
}