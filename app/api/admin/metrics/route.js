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

// Fallback prices, used ONLY for old rows saved before amount_paid existed
// (where amount_paid is null). Any row with a real amount_paid value uses
// that instead, since it reflects what was actually charged at the time.
const FALLBACK_PLAN_PRICES = {
  one_time: 99,
  annual: 49,
  semi_annual: 29,
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: subs, error: subsError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, email, plan, status, created_at, wedding_id, is_free_grant, amount_paid')

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 })
  }

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

  const totalTrialUsers = uniqueUsers.filter(u => u.plans.includes('trial')).length

  const PAID_PLANS = ['one_time', 'annual', 'semi_annual']
  const totalPaidUsers = uniqueUsers.filter(u =>
    u.plans.some(p => PAID_PLANS.includes(p))
  ).length

  // Revenue: use the real amount_paid when available (accurate regardless
  // of future pricing changes). Only fall back to the price map for old
  // rows saved before amount_paid existed. Free grants are always excluded.
  let totalRevenue = 0
  for (const row of subs) {
    if (row.is_free_grant) continue
    if (!PAID_PLANS.includes(row.plan)) continue

    if (row.amount_paid !== null && row.amount_paid !== undefined) {
      totalRevenue += Number(row.amount_paid)
    } else {
      totalRevenue += FALLBACK_PLAN_PRICES[row.plan] || 0
    }
  }

  return NextResponse.json({
    totalSignups,
    totalTrialUsers,
    totalPaidUsers,
    totalRevenue,
  })
}