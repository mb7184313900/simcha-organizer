import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAID_PLANS = ['one_time', 'annual', 'semi_annual']
const PLAN_PRICES = {
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

  // Pull all subscription rows
  const { data: subs, error: subsError } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, email, plan, status, created_at, wedding_id')
    .order('created_at', { ascending: false })

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 })
  }

  // Pull all Supabase Auth users so we can attach display names.
  // listUsers() is paginated at 50 by default -- perPage raises that ceiling.
  const { data: authData, error: authListError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  })

  if (authListError) {
    return NextResponse.json({ error: authListError.message }, { status: 500 })
  }

  // Build a lookup: user_id -> display name (falls back to null if not set)
  const nameMap = new Map()
  for (const authUser of authData.users) {
    const displayName =
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      null
    nameMap.set(authUser.id, displayName)
  }

  // --- Recent signups: one row per user, most recent signup first ---
  const userMap = new Map()

  for (const row of subs) {
    if (!userMap.has(row.user_id)) {
      userMap.set(row.user_id, {
        user_id: row.user_id,
        name: nameMap.get(row.user_id) || null,
        email: row.email,
        weddingIds: new Set(),
        plans: [],
        status: row.status,
        signedUpAt: row.created_at,
      })
    }
    const entry = userMap.get(row.user_id)
    entry.weddingIds.add(row.wedding_id)
    entry.plans.push(row.plan)
    // Keep the earliest created_at as "signed up" date
    if (new Date(row.created_at) < new Date(entry.signedUpAt)) {
      entry.signedUpAt = row.created_at
    }
  }

  const recentSignups = Array.from(userMap.values())
    .map(u => ({
      name: u.name,
      email: u.email,
      weddingCount: u.weddingIds.size,
      plan: u.plans.includes('trial') ? 'trial' : u.plans.find(p => PAID_PLANS.includes(p)) || u.plans[0],
      status: u.status,
      signedUpAt: u.signedUpAt,
    }))
    .sort((a, b) => new Date(b.signedUpAt) - new Date(a.signedUpAt))
    .slice(0, 25)

  // --- Recent payments: one row per paid subscription row ---
  const recentPayments = subs
    .filter(row => PAID_PLANS.includes(row.plan))
    .map(row => ({
      name: nameMap.get(row.user_id) || null,
      email: row.email,
      plan: row.plan,
      amount: PLAN_PRICES[row.plan],
      date: row.created_at,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 25)

  return NextResponse.json({
    recentSignups,
    recentPayments,
  })
}