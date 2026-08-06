'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Image from 'next/image'
import Footer from '../../../components/Footer'

export default function InvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/invite/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteToken: token })
        })
        const result = await res.json()
        if (result.invite) {
          setInvite(result.invite)
          setForm(f => ({ ...f, email: result.invite.invited_email }))
        }
      } catch (err) {
        console.error('Failed to load invite:', err)
      }
      setLoading(false)
    }
    init()
  }, [token])

  const handleSubmit = async () => {
    setError('')

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }
    if (!form.phone.trim()) {
      setError('Please enter your phone number.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      // First try to sign in — the invited person may already have a
      // SimchaPro account (e.g. Side A on their own wedding elsewhere).
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (!signInError) {
        // Existing, already-confirmed account — nothing to verify by email.
        // Accept the invite immediately, same as before this change.
        const userId = signInData.user.id

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
        return
      }

      // No existing account (or wrong password) — create a new one. This
      // triggers Supabase's email confirmation flow; the invite itself is
      // only accepted once they confirm and land on /auth/confirm.
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
            first_name: form.firstName.trim(),
            last_name: form.lastName.trim(),
            phone: form.phone.trim(),
            invite_token: token
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        setSubmitting(false)
        return
      }

      setSubmitted(true)
      setSubmitting(false)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
      <p className="text-[#9a9a9a]">Loading invitation...</p>
    </div>
  )

  if (!invite) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
      <p className="text-[#5a5a5a]">This invitation link is invalid or has expired.</p>
    </div>
  )

  if (invite.status === 'accepted') return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
      <div className="text-center">
        <p className="text-[#2A2A2A] font-semibold text-lg mb-2">This invitation has already been accepted.</p>
        <button onClick={() => router.push('/login')} className="text-[#141d33] underline text-sm hover:text-[#C9A227] transition-colors">Go to login</button>
      </div>
    </div>
  )

  if (invite.status === 'revoked') return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0]">
      <p className="text-[#5a5a5a]">This invitation has been revoked. Please contact the other family.</p>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <a href="/" className="mb-6">
          <Image
            src="/images/logo.png"
            alt="SimchaPro"
            width={160}
            height={230}
            priority
            className="h-16 w-auto"
          />
        </a>
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-sm border border-[#e8e0cc] text-center">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Check Your Email</h1>
          <p className="text-[#5a5a5a]">
            We've sent a confirmation link to <strong>{form.email}</strong>. Please check your inbox and click the link to activate your account and join the wedding.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )

  const chossonFamily = invite.owner_side === 'chosson' ? invite.owner_family_name : invite.other_family_name
  const kallahFamily = invite.owner_side === 'kallah' ? invite.owner_family_name : invite.other_family_name

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <a href="/" className="mb-6">
          <Image
            src="/images/logo.png"
            alt="SimchaPro"
            width={160}
            height={230}
            priority
            className="h-16 w-auto"
          />
        </a>
        <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-sm border border-[#e8e0cc]">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-1">You're Invited! 🎉</h1>
          <p className="text-[#5a5a5a] text-sm mb-1">
            The <strong>{invite.owner_family_name}</strong> family invited you to collaborate on SimchaPro.
          </p>
          <p className="text-[#5a5a5a] text-sm mb-6">
            Wedding: <strong>{invite.owner_side === 'chosson' ? `${invite.owner_family_name} & ${kallahFamily}` : `${chossonFamily} & ${invite.owner_family_name}`}</strong>
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="First name"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            <input
              type="text"
              placeholder="Last name"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              readOnly
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Please wait...' : 'Accept Invitation'}
            </button>
          </div>

          <p className="text-xs text-[#9a9a9a] text-center mt-4">
            Your account is free. Only the Chosson's side pays for SimchaPro.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
