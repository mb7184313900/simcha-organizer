'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Footer from '../../components/Footer'

const RESEND_COOLDOWN_SECONDS = 30

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')
    setIsError(false)
    setShowResend(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setIsError(true)
      if (error.code === 'email_not_confirmed') {
        setMessage('Please verify your email before logging in. Check your inbox for the confirmation link.')
        setShowResend(true)
      } else {
        setMessage(error.message)
      }
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://simcha-organizer.vercel.app/reset-password',
    })
    if (error) {
      setIsError(true)
      setMessage(error.message)
    } else {
      setIsError(false)
      setMessage('Password reset email sent! Check your inbox.')
    }
    setLoading(false)
  }

  const handleResend = async () => {
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` }
    })
    if (error) {
      setIsError(true)
      setMessage(error.message)
    } else {
      setIsError(false)
      setMessage('Verification email sent!')
      setResendCooldown(RESEND_COOLDOWN_SECONDS)
    }
    setResending(false)
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <a href="/" className="mb-6">
          <Image src="/images/logo.png" alt="SimchaPro" width={160} height={230} priority className="h-16 w-auto" />
        </a>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">
            {forgotMode ? 'Reset Password' : 'Welcome back'}
          </h1>
          <p className="text-[#5a5a5a] mb-6">
            {forgotMode ? 'Enter your email to receive a reset link' : 'Sign in to your SimchaPro account'}
          </p>
          <div className="space-y-4">
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            {!forgotMode && (
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]" />
            )}
            <button
              onClick={forgotMode ? handleForgotPassword : handleLogin}
              disabled={loading}
              className="w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Please wait...' : forgotMode ? 'Send Reset Email' : 'Sign In'}
            </button>
          </div>
          {message && (
            <p className={`mt-4 text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          {showResend && (
            <button
              onClick={handleResend}
              disabled={resending || resendCooldown > 0}
              className="mt-2 w-full text-center text-sm text-[#141d33] hover:text-[#C9A227] underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-colors"
            >
              {resending ? 'Sending...' : resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : 'Resend verification email'}
            </button>
          )}
          <p className="mt-4 text-center text-sm">
            <button onClick={() => { setForgotMode(!forgotMode); setMessage(''); setIsError(false); setShowResend(false) }} className="text-[#141d33] hover:text-[#C9A227] transition-colors underline">
              {forgotMode ? 'Back to sign in' : 'Forgot password?'}
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-[#5a5a5a]">Don't have an account? <a href="/signup" className="text-[#141d33] font-semibold hover:text-[#C9A227] transition-colors underline">Start free trial</a></p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
