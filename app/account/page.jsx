'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Footer from '../../components/Footer'

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
      <div className="bg-[#141d33] px-6 py-1.5 flex justify-between items-center border-b border-[#C9A227]/40 shadow-md">
        <Image
          src="/images/logo.png"
          alt="SimchaPro"
          width={160}
          height={230}
          priority
          className="h-16 w-auto cursor-pointer"
          onClick={() => router.push('/dashboard')}
        />
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="bg-white text-[#141d33] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#f0ebe0] transition-colors">
          Sign Out
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <h2 className="font-serif text-3xl font-semibold text-[#141d33] mb-8">My Account</h2>

        <div className="bg-white rounded-lg shadow-sm border border-[#e8e0cc] p-8 mb-6">
          <h3 className="font-serif text-lg font-semibold text-[#141d33] mb-4">Account Info</h3>
          <p className="text-[#5a5a5a]"><span className="font-medium text-[#2A2A2A]">Email:</span> {user.email}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-[#e8e0cc] p-8 mb-6">
          <h3 className="font-serif text-lg font-semibold text-[#141d33] mb-4">Subscription</h3>
          {sub ? (
            <div className="space-y-3">
              <p className="text-[#5a5a5a]"><span className="font-medium text-[#2A2A2A]">Plan:</span> {sub.plan}</p>
              <p className="text-[#5a5a5a]"><span className="font-medium text-[#2A2A2A]">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-[#C9A227]/15 text-[#8a6d10]'}`}>{sub.status}</span></p>
              <p className="text-[#5a5a5a]"><span className="font-medium text-[#2A2A2A]">Expires:</span> {expiryDate}</p>
              <p className="text-[#5a5a5a]"><span className="font-medium text-[#2A2A2A]">Days left:</span> {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}</p>
            </div>
          ) : (
            <p className="text-[#9a9a9a]">No subscription found.</p>
          )}
        </div>

        {sub && daysLeft <= 30 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <p className="text-yellow-700 font-medium">⚠️ Your access expires soon! <a href="/renew" className="underline">Renew now</a></p>
          </div>
        )}

        <a href="/renew" className="block w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors text-center">
          Renew Subscription
        </a>
      </div>
      <Footer />
    </div>
  )
}