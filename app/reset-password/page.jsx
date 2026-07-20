'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'
import Footer from '../../components/Footer'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
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
          <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Password Updated!</h1>
            <p className="text-[#5a5a5a] mb-6">Your password has been changed successfully.</p>
            <a href="/login" className="block w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors">
              Sign In Now
            </a>
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
          <Image
            src="/images/logo.png"
            alt="SimchaPro"
            width={160}
            height={230}
            priority
            className="h-16 w-auto"
          />
        </a>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-md">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Reset Your Password</h1>
          <p className="text-[#5a5a5a] mb-6">Enter your new password below</p>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
          {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
        </div>
      </div>
      <Footer />
    </main>
  )
}