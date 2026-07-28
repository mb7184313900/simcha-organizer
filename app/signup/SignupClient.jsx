'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Footer from '../../components/Footer'

export default function SignupClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSignup = async () => {
    if (!agreed) {
      setMessage('You must agree to the Terms & Conditions and Privacy Policy to sign up.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setMessage(error.message)
    } else {
      const { data: newWedding, error: weddingError } = await supabase
        .from('weddings')
        .insert({
          side_a_user_id: data.user.id,
          chosson_family: '',
          kallah_family: ''
        })
        .select()
        .single()

      if (weddingError) {
        setMessage('Something went wrong setting up your account. Please try again.')
        setLoading(false)
        return
      }

      const expires_at = new Date()
      expires_at.setDate(expires_at.getDate() + 7)
      await supabase.from('subscriptions').insert({
        user_id: data.user.id,
        wedding_id: newWedding.id,
        email,
        plan: 'trial',
        status: 'trial',
        expires_at: expires_at.toISOString(),
      })

      await supabase.from('user_settings').upsert(
        { user_id: data.user.id, active_wedding_id: newWedding.id, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'sign_up', {
          method: 'email',
        })
      }

      window.location.href = '/dashboard'
    }
    setLoading(false)
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
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
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
