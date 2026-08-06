'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Footer from '../../components/Footer'

export default function SignupClient() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSignup = async () => {
    if (!agreed) {
      setMessage('You must agree to the Terms & Conditions and Privacy Policy to sign up.')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      setMessage('Please enter your first and last name.')
      return
    }
    if (!phone.trim()) {
      setMessage('Please enter your phone number.')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim()
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    })

    if (error) {
      setMessage(error.message)
    } else {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'sign_up', {
          method: 'email',
        })
      }

      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <a href="/" className="mb-6">
            <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
          </a>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-4">Check Your Email</h1>
            <p className="text-[#5a5a5a]">
              We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <a href="/" className="mb-6">
          <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
        </a>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Create your SimchaPro account</h1>
          <p className="text-[#5a5a5a] mb-6">Start your 7-day free trial</p>
          <div className="space-y-4">
            <input type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <label className="flex items-start gap-2 text-sm text-[#5a5a5a]">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1" />
              <span>
                I agree to the{' '}
                <a href="/terms" target="_blank" className="text-[#141d33] font-semibold hover:text-[#C9A227] underline">Terms & Conditions</a>{' '}
                and{' '}
                <a href="/privacy" target="_blank" className="text-[#141d33] font-semibold hover:text-[#C9A227] underline">Privacy Policy</a>
              </span>
            </label>
            <button onClick={handleSignup} disabled={loading || !agreed} className="w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors disabled:opacity-50">
              {loading ? 'Creating account...' : 'Start Free Trial'}
            </button>
          </div>
          {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
          <p className="mt-6 text-center text-sm text-[#5a5a5a]">Already have an account? <a href="/login" className="text-[#141d33] font-semibold hover:text-[#C9A227] transition-colors underline">Sign in</a></p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
