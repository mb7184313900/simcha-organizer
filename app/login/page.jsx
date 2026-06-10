'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
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
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">
          {forgotMode ? 'Reset Password' : 'Welcome back'}
        </h1>
        <p className="text-gray-500 mb-6">
          {forgotMode ? 'Enter your email to receive a reset link' : 'Sign in to your SimchaPro account'}
        </p>
        <div className="space-y-4">
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {!forgotMode && (
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          )}
          <button
            onClick={forgotMode ? handleForgotPassword : handleLogin}
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : forgotMode ? 'Send Reset Email' : 'Sign In'}
          </button>
        </div>
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
        <p className="mt-4 text-center text-sm">
          <button onClick={() => { setForgotMode(!forgotMode); setMessage('') }} className="text-blue-600 hover:underline">
            {forgotMode ? 'Back to sign in' : 'Forgot password?'}
          </button>
        </p>
        <p className="mt-4 text-center text-sm text-gray-500">Don't have an account? <a href="/signup" className="text-blue-600 hover:underline">Start free trial</a></p>
      </div>
    </main>
  )
}