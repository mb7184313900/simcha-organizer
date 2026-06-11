'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
const [daysLeft, setDaysLeft] = useState(null)
const [subStatus, setSubStatus] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!sub) {
        setAccess('none')
        return
      }

      const now = new Date()
      const expires = new Date(sub.expires_at)

      if (expires > now) {
        setAccess(sub.status)
        setSubStatus(sub.status)
        setDaysLeft(Math.ceil((expires - now) / (1000 * 60 * 60 * 24)))
      } else {
        setAccess('expired')
      }
    }
    checkAccess()
  }, [])

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (access === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow border text-center max-w-md">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Your access has expired</h2>
          <p className="text-gray-500 mb-6">Renew your subscription to continue using SimchaPro.</p>
          <a href="/renew" className="block bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800">Renew Now</a>
        </div>
      </div>
    )
  }

  if (access === 'none') {
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
{subStatus === 'trial' && daysLeft !== null && (
  <div className={`rounded-xl p-4 mb-6 font-medium ${daysLeft <= 3 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
    {daysLeft <= 3 ? `⚠️ Your free trial expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}! ` : `⏳ ${daysLeft} days left in your free trial. `}
    <a href="/pricing" className="underline font-bold">Upgrade now</a>
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