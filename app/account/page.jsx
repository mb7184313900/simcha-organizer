'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [sub, setSub] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      setSub(data)
    }
    getData()
  }, [])

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const expiryDate = sub ? new Date(sub.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null
  const daysLeft = sub ? Math.ceil((new Date(sub.expires_at) - new Date()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>SimchaPro</h1>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-white text-blue-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50">
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-8">My Account</h2>

        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Account Info</h3>
          <p className="text-gray-600"><span className="font-medium">Email:</span> {user.email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Subscription</h3>
          {sub ? (
            <div className="space-y-3">
              <p className="text-gray-600"><span className="font-medium">Plan:</span> {sub.plan}</p>
              <p className="text-gray-600"><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status}</span></p>
              <p className="text-gray-600"><span className="font-medium">Expires:</span> {expiryDate}</p>
              <p className="text-gray-600"><span className="font-medium">Days left:</span> {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</p>
            </div>
          ) : (
            <p className="text-gray-500">No subscription found.</p>
          )}
        </div>

        {sub && daysLeft <= 30 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-700 font-medium">⚠️ Your access expires soon! <a href="/renew" className="underline">Renew now</a></p>
          </div>
        )}

        <a href="/renew" className="block w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 text-center">
          Renew Subscription
        </a>
      </div>
    </div>
  )
}