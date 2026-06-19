'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function InvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ email: '', password: '' })
  const [isLogin, setIsLogin] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase
        .from('wedding_invites')
        .select('*')
        .eq('invite_token', token)
        .single()
      if (data) {
        setInvite(data)
        setForm(f => ({ ...f, email: data.invited_email }))
      }
      setLoading(false)
    }
    init()
  }, [token])

  const handleSubmit = async () => {
    setError('')
    setSubmitting(true)
    try {
      let userId

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        })
        if (error) { setError(error.message); setSubmitting(false); return }
        userId = data.user.id
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password
        })
        if (error) { setError(error.message); setSubmitting(false); return }
        userId = data.user.id
      }

      // Mark invite as accepted
      await supabase.from('wedding_invites').update({
        status: 'accepted',
        accepted_by_user_id: userId
      }).eq('invite_token', token)

      // Copy owner's family_settings into Side B's account
      const { data: ownerSettings } = await supabase
        .from('family_settings')
        .select('*')
        .eq('user_id', invite.owner_user_id)
        .single()

      if (ownerSettings) {
        const sideBSide = ownerSettings.my_side === 'chosson' ? 'kallah' : 'chosson'
        await supabase.from('family_settings').upsert({
          user_id: userId,
          my_side: sideBSide,
          my_family_name: ownerSettings.other_family_name,
          other_family_name: ownerSettings.my_family_name,
          custom_categories: ownerSettings.custom_categories,
          custom_occasions: ownerSettings.custom_occasions
        }, { onConflict: 'user_id' })
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading invitation...</p>
    </div>
  )

  if (!invite) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">This invitation link is invalid or has expired.</p>
    </div>
  )

  if (invite.status === 'accepted') return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-700 font-semibold text-lg mb-2">This invitation has already been accepted.</p>
        <button onClick={() => router.push('/login')} className="text-blue-600 underline text-sm">Go to login</button>
      </div>
    </div>
  )

  if (invite.status === 'revoked') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">This invitation has been revoked. Please contact the other family.</p>
    </div>
  )

  const chossonFamily = invite.owner_side === 'chosson' ? invite.owner_family_name : null
  const kallahFamily = invite.owner_side === 'kallah' ? invite.owner_family_name : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">You're Invited! 🎉</h1>
        <p className="text-gray-500 text-sm mb-1">
          The <strong>{invite.owner_family_name}</strong> family invited you to collaborate on SimchaPro.
        </p>
        {chossonFamily && <p className="text-gray-500 text-sm mb-6">Wedding: <strong>{chossonFamily} & {invite.invited_email}</strong></p>}
        {kallahFamily && <p className="text-gray-500 text-sm mb-6">Wedding: <strong>{invite.invited_email} & {kallahFamily}</strong></p>}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${!isLogin ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900'}`}
          >
            Create Account
          </button>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${isLogin ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900'}`}
          >
            I Have an Account
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : isLogin ? 'Sign In & Accept' : 'Create Account & Accept'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Your account is free. Only the Chosson's side pays for SimchaPro.
        </p>
      </div>
    </div>
  )
}