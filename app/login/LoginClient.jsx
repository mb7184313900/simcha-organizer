'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Footer from '../../components/Footer'

export default function LoginClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
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
      setMessage(error.message)
    } else {
      setMessage('Password reset email sent! Check your inbox.')
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
          {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
          <p className="mt-4 text-center text-sm">
            <button onClick={() => { setForgotMode(!forgotMode); setMessage('') }} className="text-[#141d33] hover:text-[#C9A227] transition-colors underline">
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
