import { supabase } from './supabase'

// Plans that represent a real (non-trial) paid purchase.
// 'paid' is included for safety in case any old rows used that value.
const PAID_PLANS = ['one_time', 'annual', 'semi_annual', 'paid']

// Evaluates a single subscription row and returns the access state for it.
function evaluateSubscription(sub) {
  if (!sub) {
    return { state: 'none', canEdit: false, hasDataAccess: false, daysLeft: null, plan: null, expiresAt: null }
  }

  const now = new Date()
  const expires = new Date(sub.expires_at)
  const isTrial = sub.plan === 'trial'

  if (expires > now) {
    if (isTrial) {
      const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
      return { state: 'trial', canEdit: true, hasDataAccess: true, daysLeft, plan: sub.plan, expiresAt: sub.expires_at }
    }
    return { state: 'active', canEdit: true, hasDataAccess: true, daysLeft: null, plan: sub.plan, expiresAt: sub.expires_at }
  }

  // Past the access window
  if (isTrial) {
    // Trial expired -- view-only, same as a lapsed paid plan
    return { state: 'trial_expired', canEdit: false, hasDataAccess: true, daysLeft: null, plan: sub.plan, expiresAt: sub.expires_at }
  }

  // Paid plan, but the 1-year (or renewal) period has lapsed -- view-only
  return { state: 'expired', canEdit: false, hasDataAccess: true, daysLeft: null, plan: sub.plan, expiresAt: sub.expires_at }
}

// Looks up a subscription row for a given wedding, falling back to email if needed.
async function findSubscription(userId, email, weddingId) {
  let { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub && email) {
    const { data: subByEmail } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .eq('wedding_id', weddingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    sub = subByEmail
  }

  return sub
}

// Finds the user's current "active" wedding.
// Checks user_settings first. If nothing is set yet (e.g. an existing user
// from before this feature existed), falls back to the first wedding this
// user is connected to (as Side A or Side B), and saves that as their
// active wedding going forward so future calls are fast.
export async function getActiveWeddingId(user) {
  if (!user) return null

  const { data: settings } = await supabase
    .from('user_settings')
    .select('active_wedding_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (settings?.active_wedding_id) {
    return settings.active_wedding_id
  }

  // No active wedding set yet -- find any wedding this user belongs to
  const { data: ownedWedding } = await supabase
    .from('weddings')
    .select('id')
    .or(`side_a_user_id.eq.${user.id},side_b_user_id.eq.${user.id}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (ownedWedding) {
    await setActiveWedding(user, ownedWedding.id)
    return ownedWedding.id
  }

  return null
}

// Updates (or creates) the user's active wedding selection.
// Used by the "My Weddings" switcher and after creating a new wedding.
export async function setActiveWedding(user, weddingId) {
  if (!user || !weddingId) return

  await supabase
    .from('user_settings')
    .upsert(
      { user_id: user.id, active_wedding_id: weddingId, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
}

// Main entry point -- call this from any page that needs to know the user's
// access level for their currently active wedding.
//
// Pass a specific weddingId if you already know it (e.g. right after switching
// weddings); otherwise it looks up the user's active wedding automatically.
//
// Returns:
// {
//   state: 'none' | 'trial' | 'trial_expired' | 'active' | 'expired' | 'revoked',
//   canEdit: boolean,        // true if the user can add/edit/delete data
//   hasDataAccess: boolean,  // true if the user should see their real saved data (vs. the generic preview)
//   daysLeft: number|null,   // days left in trial, if applicable
//   plan: string|null,
//   isSideB: boolean,
//   isRevoked: boolean,      // Side B specific -- owner revoked their access directly
//   ownerUserId: string|null,// Side B specific -- Side A's user_id, needed for loading shared data
//   weddingId: string|null   // the wedding this status applies to
// }
export async function getAccessStatus(user, weddingId = null) {
  if (!user) {
    return { state: 'none', canEdit: false, hasDataAccess: false, daysLeft: null, plan: null, isSideB: false, isRevoked: false, ownerUserId: null, weddingId: null }
  }

  const activeWeddingId = weddingId || await getActiveWeddingId(user)

  if (!activeWeddingId) {
    return { state: 'none', canEdit: false, hasDataAccess: false, daysLeft: null, plan: null, isSideB: false, isRevoked: false, ownerUserId: null, weddingId: null }
  }

  // Check if this user is Side B on THIS specific wedding
  const { data: invite } = await supabase
    .from('wedding_invites')
    .select('*')
    .eq('accepted_by_user_id', user.id)
    .eq('wedding_id', activeWeddingId)
    .maybeSingle()

  if (invite) {
    const isRevoked = invite.status === 'revoked'

    if (isRevoked) {
      // Owner revoked Side B directly -- no edit, but Side B still sees their own private data
      return { state: 'revoked', canEdit: false, hasDataAccess: true, daysLeft: null, plan: null, isSideB: true, isRevoked: true, ownerUserId: invite.owner_user_id, weddingId: activeWeddingId }
    }

    // Side B's access mirrors Side A's subscription for this wedding
    const ownerSub = await findSubscription(invite.owner_user_id, null, activeWeddingId)
    const result = evaluateSubscription(ownerSub)
    return { ...result, isSideB: true, isRevoked: false, ownerUserId: invite.owner_user_id, weddingId: activeWeddingId }
  }

  // Not Side B on this wedding -- look up own subscription for this wedding
  const sub = await findSubscription(user.id, user.email, activeWeddingId)
  const result = evaluateSubscription(sub)
  return { ...result, isSideB: false, isRevoked: false, ownerUserId: null, weddingId: activeWeddingId }
}