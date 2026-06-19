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

      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (signInError) {
        // Try to create a new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password
        })
        if (signUpError) {
          setError(signUpError.message)
          setSubmitting(false)
          return
        }
        userId = signUpData.user.id
      } else {
        userId = signInData.user.id
      }

      // Call server API to accept invite and create family settings using service role
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, inviteToken: token })
      })

      const result = await res.json()
      if (!result.success) {
        setError('Something went wrong. Please try again.')
        setSubmitting(false)
        return
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

  const chossonFamily = invite.owner_side === 'chosson' ? invite.owner_family_name : invite.other_family_name
  const kallahFamily = invite.owner_side === 'kallah' ? invite.owner_family_name : invite.other_family_name

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">You're Invited! 🎉</h1>
        <p className="text-gray-500 text-sm mb-1">
          The <strong>{invite.owner_family_name}</strong> family invited you to collaborate on SimchaPro.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Wedding: <strong>{invite.owner_side === 'chosson' ? `${invite.owner_family_name} & ${kallahFamily}` : `${chossonFamily} & ${invite.owner_family_name}`}</strong>
        </p>

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
            {submitting ? 'Please wait...' : 'Accept Invitation'}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          Your account is free. Only the Chosson's side pays for SimchaPro.
        </p>
      </div>
    </div>
  )
}