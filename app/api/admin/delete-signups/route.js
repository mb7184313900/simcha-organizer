import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Permanently deletes a Side A user, all weddings they own, every row tied
// to those weddings, and any Side B auth account attached to them.
//
// Server-side safety check: if ANY subscription row for ANY of this user's
// weddings has amount_paid > 0 or is_free_grant = true, the whole user is
// skipped — nothing is deleted for them. This check is re-derived from the
// database here and does not trust anything the client sent.
async function deleteUserAndData(userId) {
  const { data: weddings, error: weddingsError } = await supabaseAdmin
    .from('weddings')
    .select('id, side_b_user_id')
    .eq('side_a_user_id', userId)

  if (weddingsError) {
    throw new Error(`Failed to look up weddings: ${weddingsError.message}`)
  }

  const weddingIds = (weddings || []).map(w => w.id)

  if (weddingIds.length > 0) {
    const { data: subsCheck, error: subsCheckError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, amount_paid, is_free_grant')
      .in('wedding_id', weddingIds)

    if (subsCheckError) {
      throw new Error(`Failed to check subscriptions: ${subsCheckError.message}`)
    }

    const isProtected = (subsCheck || []).some(
      (s) => (s.amount_paid !== null && s.amount_paid !== undefined && Number(s.amount_paid) > 0) || s.is_free_grant === true
    )

    if (isProtected) {
      return { userId, status: 'skipped_protected', reason: 'User has a paid or free-grant subscription.' }
    }
  }

  const sideBUserIds = new Set()

  for (const wedding of weddings || []) {
    if (wedding.side_b_user_id) {
      sideBUserIds.add(wedding.side_b_user_id)
    }

    const { error: cascadeError } = await supabaseAdmin.rpc('delete_wedding_cascade', {
      target_wedding_id: wedding.id,
    })

    if (cascadeError) {
      throw new Error(`Failed to delete wedding ${wedding.id}: ${cascadeError.message}`)
    }
  }

  const { error: userSettingsDeleteError } = await supabaseAdmin
    .from('user_settings')
    .delete()
    .eq('user_id', userId)

  if (userSettingsDeleteError) {
    throw new Error(`Failed to delete user_settings for user ${userId}: ${userSettingsDeleteError.message}`)
  }

  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authDeleteError) {
    throw new Error(`Failed to delete auth account: ${authDeleteError.message}`)
  }

  const sideBResults = []
  for (const sideBId of sideBUserIds) {
    // Don't delete this Side B account if it's still attached to a wedding
    // outside this batch — they may be an active Side B elsewhere.
    const { data: otherWeddings, error: otherWeddingsError } = await supabaseAdmin
      .from('weddings')
      .select('id')
      .eq('side_b_user_id', sideBId)
      .not('id', 'in', `(${weddingIds.join(',')})`)

    if (otherWeddingsError) {
      throw new Error(`Failed to check other weddings for Side B user ${sideBId}: ${otherWeddingsError.message}`)
    }

    if ((otherWeddings || []).length > 0) {
      sideBResults.push({
        sideBUserId: sideBId,
        deleted: false,
        reason: 'Still an active Side B on another wedding — not deleted.',
      })
      continue
    }

    const { error: sideBUserSettingsDeleteError } = await supabaseAdmin
      .from('user_settings')
      .delete()
      .eq('user_id', sideBId)

    if (sideBUserSettingsDeleteError) {
      sideBResults.push({
        sideBUserId: sideBId,
        deleted: false,
        reason: `Failed to delete user_settings: ${sideBUserSettingsDeleteError.message}`,
      })
      continue
    }

    const { error: sideBDeleteError } = await supabaseAdmin.auth.admin.deleteUser(sideBId)
    sideBResults.push({
      sideBUserId: sideBId,
      deleted: !sideBDeleteError,
      reason: sideBDeleteError?.message || null,
    })
  }

  return {
    userId,
    status: 'deleted',
    weddingsDeleted: weddingIds.length,
    sideBResults,
  }
}

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
  const { userIds } = body

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'userIds must be a non-empty array.' }, { status: 400 })
  }

  const results = []

  for (const userId of userIds) {
    try {
      const result = await deleteUserAndData(userId)
      results.push(result)
    } catch (err) {
      results.push({ userId, status: 'failed', reason: err.message })
    }
  }

  return NextResponse.json({ results })
}
