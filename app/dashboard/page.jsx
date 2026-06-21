'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getAccessStatus } from '../../lib/accessControl'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const status = await getAccessStatus(user)
      setAccess(status)
    }
    checkAccess()
  }, [])

  if (!user || !access) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (access.state === 'trial_expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow border text-center max-w-md">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Your free trial has ended</h2>
          <p className="text-gray-500 mb-6">Activate your account for full access to SimchaPro.</p>
          <a href="/pricing" className="block bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800">Activate for $99</a>
        </div>
      </div>
    )
  }

  if (access.state === 'none') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow border text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">No active subscription</h2>
          <p className="text-gray-500 mb-6">Get started with a 7-day free trial.</p>
          <a href="/pricing" className="block bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800">Get Started</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SimchaPro</h1>
        <div className="flex items-center gap-4">
          <span onClick={() => router.push('/account')} className="text-blue-200 text-sm cursor-pointer hover:text-white underline">{user.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Welcome to SimchaPro! 🎉</h2>

        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('payment') === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 font-medium">
            🎉 Payment successful! Your account is now active. Welcome to SimchaPro!
          </div>
        )}

        {access.state === 'trial' && access.daysLeft !== null && (
          <div className={`rounded-xl p-4 mb-6 font-medium ${access.daysLeft <= 3 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            {access.daysLeft <= 3 ? `⚠️ Your free trial expires in ${access.daysLeft} day${access.daysLeft === 1 ? '' : 's'}! ` : `⏳ ${access.daysLeft} days left in your free trial. `}
            <a href="/pricing" className="underline font-bold">Upgrade now</a>
          </div>
        )}

        {access.state === 'expired' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800">⏰ Your edit access has expired</p>
              <p className="text-yellow-700 text-sm">You can still view all your data below. Renew to add or edit again.</p>
            </div>
            <a href="/renew" className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center">
              Renew Now
            </a>
          </div>
        )}

        {access.state === 'revoked' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-red-700">⚠️ Your shared access has been revoked</p>
            <p className="text-red-600 text-sm">The other family has revoked your shared access. You can still view your own private data, but cannot add or edit anything.</p>
          </div>
        )}

        <p className="text-gray-500 mb-10">What would you like to work on today?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => router.push('/checklist')} className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer hover:border-blue-300 transition-all">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Simcha Checklist</h3>
            <p className="text-gray-500 text-sm">Step by step guidance for every simcha — Lchaim, Tenaim, Wedding and more</p>
          </div>

          <div onClick={() => router.push('/budget')} className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer hover:border-blue-300 transition-all">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Expense Tracker</h3>
            <p className="text-gray-500 text-sm">Track shared expenses between both families and stay on budget</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center opacity-60">
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Simcha Magazine</h3>
            <p className="text-gray-500 text-sm">Exclusive deals and coupons from top simcha vendors</p>
            <span className="inline-block mt-3 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}