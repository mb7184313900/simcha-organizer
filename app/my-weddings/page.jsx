'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAccessStatus, setActiveWedding } from '../../lib/accessControl'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function MyWeddings() {
  const [user, setUser] = useState(null)
  const [weddings, setWeddings] = useState([])
  const [activeWeddingId, setActiveWeddingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: settings } = await supabase.from('user_settings').select('active_wedding_id').eq('user_id', user.id).maybeSingle()
      setActiveWeddingId(settings?.active_wedding_id || null)

      const { data: rows } = await supabase
        .from('weddings')
        .select('*')
        .or(`side_a_user_id.eq.${user.id},side_b_user_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

      const enriched = []
      for (const w of rows || []) {
        const status = await getAccessStatus(user, w.id)
        enriched.push({ ...w, access: status })
      }
      setWeddings(enriched)
      setLoading(false)
    }
    init()
  }, [])

  const handleSwitch = async (weddingId) => {
    setSwitching(weddingId)
    await setActiveWedding(user, weddingId)
    router.push('/dashboard')
  }

  const getStatusLabel = (status) => {
    if (status.state === 'trial') return `Trial — ${status.daysLeft} day${status.daysLeft === 1 ? '' : 's'} left`
    if (status.state === 'trial_expired') return 'Trial expired'
    if (status.state === 'active') return 'Active'
    if (status.state === 'expired') return 'Edit access expired'
    if (status.state === 'revoked') return 'Access revoked'
    return 'No subscription'
  }

  const getStatusColor = (status) => {
    if (status.state === 'active' || status.state === 'trial') return 'bg-green-100 text-green-700'
    if (status.state === 'expired' || status.state === 'trial_expired') return 'bg-yellow-100 text-yellow-700'
    if (status.state === 'revoked') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-900">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onDashboardClick={() => router.push('/dashboard')} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">My Weddings 🗂️</h2>
        <p className="text-gray-500 mb-8">Switch between weddings you're managing, or add a new one.</p>

        <div className="space-y-4 mb-8">
          {weddings.map(w => {
            const isActive = w.id === activeWeddingId
            return (
              <div key={w.id} className={`bg-white rounded-2xl border shadow-sm p-6 flex items-center justify-between gap-4 flex-wrap ${isActive ? 'border-blue-900 ring-1 ring-blue-900' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-blue-900">{w.wedding_name || `${w.chosson_family || '?'} & ${w.kallah_family || '?'}`}</p>
                    {isActive && <span className="text-xs bg-blue-900 text-white px-2 py-0.5 rounded-full font-semibold">Currently Viewing</span>}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {w.wedding_date ? new Date(w.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No date set'}
                    {' · '}
                    {w.access.isSideB ? 'Connected as Side B' : 'Owner (Side A)'}
                  </p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(w.access)}`}>
                    {getStatusLabel(w.access)}
                  </span>
                </div>
                {!isActive && (
                  <button
                    onClick={() => handleSwitch(w.id)}
                    disabled={switching === w.id}
                    className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
                  >
                    {switching === w.id ? 'Switching...' : 'Switch to This'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={() => router.push('/my-weddings/new')} className="w-full bg-white border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center hover:border-blue-900 hover:bg-blue-50 transition-all">
          <div className="text-3xl mb-2">➕</div>
          <p className="font-bold text-blue-900">Add New Wedding</p>
          <p className="text-sm text-gray-500">Planning another child's wedding? Add it here — $99 one-time payment, no trial.</p>
        </button>
      </div>
      <Footer />
    </div>
  )
}