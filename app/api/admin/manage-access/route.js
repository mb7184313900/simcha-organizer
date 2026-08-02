import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
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

  const body = await request.json()
  const { subscriptionId, userId, weddingId, newExpiresAt, isFreeGrant } = body

  if (!newExpiresAt) {
    return NextResponse.json({ error: 'newExpiresAt is required.' }, { status: 400 })
  }

  let targetId = subscriptionId

  if (!targetId) {
    if (!userId || !weddingId) {
      return NextResponse.json(
        { error: 'subscriptionId, or userId and weddingId, is required.' },
        { status: 400 }
      )
    }

    // Same lookup as findSubscription() in lib/accessControl.js — most
    // recent subscription row for this user_id + wedding_id.
    const { data: sub, error: findError } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }

    if (!sub) {
      return NextResponse.json({ error: 'No subscription found for this user and wedding.' }, { status: 404 })
    }

    targetId = sub.id
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update({
      expires_at: newExpiresAt,
      is_free_grant: Boolean(isFreeGrant),
      plan: 'granted',
    })
    .eq('id', targetId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ subscription: updated })
}
