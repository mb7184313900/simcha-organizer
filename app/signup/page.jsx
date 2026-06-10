'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setMessage(error.message)
    } else {
      const expires_at = new Date()
      expires_at.setDate(expires_at.getDate() + 7)
      await supabase.from('subscriptions').insert({
        user_id: data.user.id,
        email,
        plan: 'trial',
        status: 'trial',
        expires_at: expires_at.toISOString(),
      })
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-2">Create your SimchaPro account</h1>
        <p className="text-gray-500 mb-6">Start your 7-day free trial</p>
        <div className="space-y-4">
          <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSignup} disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Start Free Trial'}
          </button>
        </div>
        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
        <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Sign in</a></p>
      </div>
    </main>
  )
}