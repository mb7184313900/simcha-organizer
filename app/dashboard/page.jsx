'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getAccessStatus } from '../../lib/accessControl'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Footer from '../../components/Footer'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
  const [wedding, setWedding] = useState(null)
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

      if (status.hasDataAccess && status.weddingId) {
        const { data: weddingRow } = await supabase.from('weddings').select('*').eq('id', status.weddingId).maybeSingle()
        setWedding(weddingRow || null)
      }
    }
    checkAccess()
  }, [])

  if (!user || !access) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

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

  let daysUntilWedding = null
  let weddingHasPassed = false

  if (wedding?.wedding_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weddingDateObj = new Date(wedding.wedding_date + 'T00:00:00')
    const diffTime = weddingDateObj.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      weddingHasPassed = true
    } else {
      daysUntilWedding = diffDays
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#141d33] px-6 py-1.5 flex justify-between items-center border-b border-[#C9A227]/40 shadow-md">
        <Image
          src="/images/logo.png"
          alt="SimchaPro"
          width={160}
          height={230}
          priority
          className="h-16 w-auto"
        />
        <div className="flex items-center gap-4">
          <span onClick={() => router.push('/account')} className="text-[#b8c0d4] text-sm cursor-pointer hover:text-[#C9A227] underline transition-colors">{user.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-white text-[#141d33] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#f0ebe0] transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>Welcome to SimchaPro! 🎉</span>
          <a
            href="/help#dashboard"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get help with the Dashboard"
            title="Get help with the Dashboard"
            className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-[#C9A227] text-[#141d33] text-sm font-bold leading-none hover:opacity-80 hover:scale-110 transition-all"
          >
            ?
          </a>
        </h2>

        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('payment') === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-700 font-medium">
            🎉 Payment successful! Your account is now active. Welcome to SimchaPro!
          </div>
        )}

        {wedding?.wedding_name && (
          <div className="flex items-center justify-between bg-white border rounded-xl px-5 py-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Currently viewing</p>
              <p className="font-bold text-blue-900">{wedding.wedding_name}</p>
            </div>
            <button onClick={() => router.push('/my-weddings')} className="text-sm font-semibold text-[#141d33] underline hover:text-[#C9A227] transition-colors">
              Switch Wedding
            </button>
          </div>
        )}

        {access.state === 'trial' && access.daysLeft !== null && (
          <div className={`rounded-xl p-4 mb-6 font-medium ${access.daysLeft <= 3 ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            {access.daysLeft <= 3 ? `⚠️ Your free trial expires in ${access.daysLeft} day${access.daysLeft === 1 ? '' : 's'}! ` : `⏳ ${access.daysLeft} days left in your free trial. `}
            <a href="/pricing" className="underline font-bold">Upgrade now</a>
          </div>
        )}

        {access.state === 'trial_expired' && !access.isSideB && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800">⏰ Your free trial has ended</p>
              <p className="text-yellow-700 text-sm">You're viewing your data in read-only mode. Activate for $99 to add, edit, and check off items.</p>
            </div>
            <a href="/pricing" className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center">
              Activate for $99
            </a>
          </div>
        )}

        {access.state === 'trial_expired' && access.isSideB && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-yellow-800">⏰ Free trial has ended</p>
            <p className="text-yellow-700 text-sm">The wedding owner's free trial has ended. Ask them to activate to make changes again.</p>
          </div>
        )}

        {access.state === 'expired' && !access.isSideB && (
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

        {access.state === 'expired' && access.isSideB && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-yellow-800">⏰ Edit access has expired</p>
            <p className="text-yellow-700 text-sm">You can still view all the data below. The wedding owner's edit access has expired — ask them to renew to add or edit again.</p>
          </div>
        )}

        {access.state === 'revoked' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-red-700">⚠️ Your shared access has been revoked</p>
            <p className="text-red-600 text-sm">The other family has revoked your shared access. You can still view your own private data, but cannot add or edit anything.</p>
          </div>
        )}

        {wedding && !wedding.wedding_date && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-blue-700 text-sm">Add your wedding date to see the countdown here.</p>
            <a href="/profile" className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center">
              Add Wedding Date
            </a>
          </div>
        )}

        {wedding?.wedding_date && (
          <div className="bg-[#141d33] rounded-2xl shadow-sm p-8 mb-10 text-center border border-[#C9A227]/40">
            {weddingHasPassed ? (
              <>
                <div className="text-5xl mb-3">🎊</div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#C9A227]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Mazel Tov!
                </h3>
                <p className="text-[#b8c0d4] mt-2">Wishing you a lifetime of happiness together.</p>
              </>
            ) : (
              <>
                <p className="text-[#b8c0d4] text-sm uppercase tracking-widest mb-2">Countdown to the Big Day</p>
                <h3 className="text-4xl md:text-5xl font-bold text-[#C9A227]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {daysUntilWedding === 0 ? "It's Today!" : `${daysUntilWedding} Day${daysUntilWedding === 1 ? '' : 's'}`}
                </h3>
                {daysUntilWedding !== 0 && (
                  <p className="text-[#b8c0d4] mt-2">until your wedding</p>
                )}
              </>
            )}
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

          <div onClick={() => router.push('/profile')} className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer hover:border-blue-300 transition-all">
            <div className="text-5xl mb-4">💍</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Wedding Profile</h3>
            <p className="text-gray-500 text-sm">View or edit the Chosson and Kallah's names, wedding name, and date</p>
          </div>

          <div onClick={() => router.push('/my-weddings')} className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer hover:border-blue-300 transition-all">
            <div className="text-5xl mb-4">🗂️</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">My Weddings</h3>
            <p className="text-gray-500 text-sm">Switch between weddings, or add a new one if you're planning more than one</p>
          </div>

          <div onClick={() => router.push('/magazine')} className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer hover:border-blue-300 transition-all">
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Simcha Magazine</h3>
            <p className="text-gray-500 text-sm">Articles, vendor directory, and coupons for your simcha</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}