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
    // Trial expired and never paid -- never had real paid data
    return { state: 'trial_expired', canEdit: false, hasDataAccess: false, daysLeft: null, plan: sub.plan, expiresAt: sub.expires_at }
  }

  // Paid plan, but the 1-year (or renewal) period has lapsed -- view-only
  return { state: 'expired', canEdit: false, hasDataAccess: true, daysLeft: null, plan: sub.plan, expiresAt: sub.expires_at }
}

// Looks up a subscription row for a given user_id, falling back to email if needed.
async function findSubscription(userId, email) {
  let { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!sub && email) {
    const { data: subByEmail } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    sub = subByEmail
  }

  return sub
}

// Main entry point -- call this from any page that needs to know the user's access level.
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
//   ownerUserId: string|null // Side B specific -- Side A's user_id, needed for loading shared data
// }
export async function getAccessStatus(user) {
  if (!user) {
    return { state: 'none', canEdit: false, hasDataAccess: false, daysLeft: null, plan: null, isSideB: false, isRevoked: false, ownerUserId: null }
  }

  // Check if this user is Side B (accepted an invite from someone else)
  const { data: invite } = await supabase
    .from('wedding_invites')
    .select('*')
    .eq('accepted_by_user_id', user.id)
    .maybeSingle()

  if (invite) {
    const isRevoked = invite.status === 'revoked'

    if (isRevoked) {
      // Owner revoked Side B directly -- no edit, but Side B still sees their own private data
      return { state: 'revoked', canEdit: false, hasDataAccess: true, daysLeft: null, plan: null, isSideB: true, isRevoked: true, ownerUserId: invite.owner_user_id }
    }

    // Side B's access mirrors Side A's subscription
    const ownerSub = await findSubscription(invite.owner_user_id, null)
    const result = evaluateSubscription(ownerSub)
    return { ...result, isSideB: true, isRevoked: false, ownerUserId: invite.owner_user_id }
  }

  // Not Side B -- look up own subscription
  const sub = await findSubscription(user.id, user.email)
  const result = evaluateSubscription(sub)
  return { ...result, isSideB: false, isRevoked: false, ownerUserId: null }
}
