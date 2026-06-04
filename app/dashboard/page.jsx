'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SimchaPro</h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">{user.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50">
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Welcome to SimchaPro! 🎉</h2>
        <p className="text-gray-500 mb-10">What would you like to work on today?</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Simcha Guide</h3>
            <p className="text-gray-500 text-sm">Step by step guidance for every simcha — Lchaim, Tenaim, Wedding and more</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Budget Organizer</h3>
            <p className="text-gray-500 text-sm">Track shared expenses between both families and stay on budget</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8 text-center hover:shadow-md cursor-pointer">
            <div className="text-5xl mb-4">📰</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Simcha Magazine</h3>
            <p className="text-gray-500 text-sm">Exclusive deals and coupons from top simcha vendors</p>
          </div>
        </div>
      </div>
    </div>
  )
}