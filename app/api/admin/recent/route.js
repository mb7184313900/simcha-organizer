import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAID_PLANS = ['one_time', 'annual', 'semi_annual']

// Fallback prices, used ONLY for old rows saved before amount_paid existed.
const FALLBACK_PLAN_PRICES = {
  one_time: 99,
  annual: 49,
  semi_annual: 29,
}

function getAmount(row) {
  if (row.amount_paid !== null && row.amount_paid !== undefined) {
    return Number(row.amount_paid)
  }
  return FALLBACK_PLAN_PRICES[row.plan] || 0
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
    .select('id, user_id, email, plan, status, created_at, expires_at, wedding_id, is_free_grant, amount_paid')
    .order('created_at', { ascending: false })

  if (subsError) {
    return NextResponse.json({ error: subsError.message }, { status: 500 })
  }

  // Used to give the Manage Access wedding-picker a human-readable label
  // and current expiration for each wedding a signup is connected to.
  const weddingIds = Array.from(new Set(subs.map(row => row.wedding_id).filter(Boolean)))
  const weddingInfoMap = new Map()

  if (weddingIds.length > 0) {
    const { data: weddingsData } = await supabaseAdmin
      .from('weddings')
      .select('id, wedding_name, chosson_family, kallah_family, wedding_date, side_b_user_id')
      .in('id', weddingIds)

    for (const w of weddingsData || []) {
      weddingInfoMap.set(w.id, {
        label: w.wedding_name || `${w.chosson_family || '?'} & ${w.kallah_family || '?'}`,
        date: w.wedding_date || null,
        sideBUserId: w.side_b_user_id || null,
      })
    }
  }

  const { data: authData, error: authListError } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  })

  if (authListError) {
    return NextResponse.json({ error: authListError.message }, { status: 500 })
  }

  const nameMap = new Map()
  const lastLoginMap = new Map()
  for (const authUser of authData.users) {
    const displayName =
      authUser.user_metadata?.display_name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      null
    nameMap.set(authUser.id, displayName)
    lastLoginMap.set(authUser.id, authUser.last_sign_in_at || null)
  }

  // --- Recent signups: one row per user ---
  const userMap = new Map()

  for (const row of subs) {
    if (!userMap.has(row.user_id)) {
      userMap.set(row.user_id, {
        user_id: row.user_id,
        name: nameMap.get(row.user_id) || null,
        lastLogin: lastLoginMap.get(row.user_id) || null,
        email: row.email,
        weddingIds: new Set(),
        plans: [],
        status: row.status,
        signedUpAt: row.created_at,
        expiresAtList: [],
        freeWeddingCount: 0,
        paidWeddingCount: 0,
        totalPaid: 0,
        weddingsMap: new Map(),
      })
    }
    const entry = userMap.get(row.user_id)
    entry.weddingIds.add(row.wedding_id)
    entry.plans.push(row.plan)
    entry.expiresAtList.push(row.expires_at)

    // Keep only the most recent subscription row per wedding — matches
    // findSubscription's "most recent by created_at" lookup in accessControl.js,
    // so Manage Access edits the exact row a real access check would find.
    const existingWeddingEntry = entry.weddingsMap.get(row.wedding_id)
    if (!existingWeddingEntry || new Date(row.created_at) > new Date(existingWeddingEntry.createdAt)) {
      entry.weddingsMap.set(row.wedding_id, {
        weddingId: row.wedding_id,
        subscriptionId: row.id,
        expiresAt: row.expires_at,
        plan: row.plan,
        status: row.status,
        createdAt: row.created_at,
        amountPaid: row.amount_paid,
        isFreeGrant: row.is_free_grant,
      })
    }

    const isRealPaidRow = PAID_PLANS.includes(row.plan) && !row.is_free_grant

    if (row.is_free_grant) {
      entry.freeWeddingCount += 1
    } else if (PAID_PLANS.includes(row.plan)) {
      entry.paidWeddingCount += 1
    }

    if (isRealPaidRow) {
      entry.totalPaid += getAmount(row)
    }

    if (new Date(row.created_at) < new Date(entry.signedUpAt)) {
      entry.signedUpAt = row.created_at
    }
  }

  const recentSignups = Array.from(userMap.values())
    .map(u => {
      const sortedExpires = u.expiresAtList
        .filter(Boolean)
        .sort((a, b) => new Date(a) - new Date(b))

      let accountType
      if (u.freeWeddingCount > 0 && u.paidWeddingCount > 0) {
        accountType = `Mixed (${u.freeWeddingCount} free, ${u.paidWeddingCount} paid)`
      } else if (u.freeWeddingCount > 0) {
        accountType = 'Free'
      } else if (u.paidWeddingCount > 0) {
        accountType = 'Paid'
      } else {
        accountType = 'Trial'
      }

      return {
        userId: u.user_id,
        name: u.name,
        email: u.email,
        weddingCount: u.weddingIds.size,
        plan: u.plans.includes('trial') ? 'trial' : u.plans.find(p => PAID_PLANS.includes(p)) || u.plans[0],
        status: u.status,
        signedUpAt: u.signedUpAt,
        expiresAtList: sortedExpires,
        soonestExpiresAt: sortedExpires[0] || null,
        accountType,
        totalPaid: u.totalPaid,
        lastLogin: u.lastLogin,
        weddings: Array.from(u.weddingsMap.values()).map(w => ({
          weddingId: w.weddingId,
          subscriptionId: w.subscriptionId,
          expiresAt: w.expiresAt,
          plan: w.plan,
          status: w.status,
          label: weddingInfoMap.get(w.weddingId)?.label || 'Unknown wedding',
          date: weddingInfoMap.get(w.weddingId)?.date || null,
          amountPaid: w.amountPaid,
          isFreeGrant: w.isFreeGrant,
          sideBUserId: weddingInfoMap.get(w.weddingId)?.sideBUserId || null,
        })),
      }
    })
    .sort((a, b) => new Date(b.signedUpAt) - new Date(a.signedUpAt))
    .slice(0, 50)

  // --- Recent payments: one row per paid subscription row ---
  const recentPayments = subs
    .filter(row => PAID_PLANS.includes(row.plan) && !row.is_free_grant)
    .map(row => ({
      name: nameMap.get(row.user_id) || null,
      email: row.email,
      plan: row.plan,
      amount: getAmount(row),
      date: row.created_at,
      expiresAt: row.expires_at,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 50)

  return NextResponse.json({
    recentSignups,
    recentPayments,
  })
}