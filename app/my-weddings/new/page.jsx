'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function AddNewWedding() {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ my_side: 'chosson', my_family_name: '', other_family_name: '', wedding_name: '', wedding_date: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
    }
    loadUser()
  }, [])

  const handleContinue = async () => {
    setError('')
    if (!form.my_family_name.trim() || !form.other_family_name.trim()) {
      setError('Please fill in both family names.')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'one_time',
        user_id: user.id,
        email: user.email,
        action: 'new_wedding',
        my_side: form.my_side,
        my_family_name: form.my_family_name.trim(),
        other_family_name: form.other_family_name.trim(),
        wedding_name: form.wedding_name.trim(),
        wedding_date: form.wedding_date
      })
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onDashboardClick={() => router.push('/dashboard')} />
      <div className="max-w-md mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Add New Wedding 💍</h2>
        <p className="text-gray-500 mb-8">Planning another child's wedding? Set it up here — a separate, fully private tracker just for this wedding.</p>

        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Which side are you for this wedding?</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setForm(p => ({ ...p, my_side: 'chosson' }))} className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${form.my_side === 'chosson' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600'}`}>Chosson's Side</button>
              <button onClick={() => setForm(p => ({ ...p, my_side: 'kallah' }))} className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${form.my_side === 'kallah' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600'}`}>Kallah's Side</button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Your Family Name</label>
            <input placeholder="e.g. Weiss" value={form.my_family_name} onChange={e => setForm(p => ({ ...p, my_family_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Other Family's Name</label>
            <input placeholder="e.g. Schwartz" value={form.other_family_name} onChange={e => setForm(p => ({ ...p, other_family_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Wedding Name (optional)</label>
            <input placeholder="e.g. Weiss-Schwartz Wedding" value={form.wedding_name} onChange={e => setForm(p => ({ ...p, wedding_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Wedding Date (optional)</label>
            <input type="date" value={form.wedding_date} onChange={e => setForm(p => ({ ...p, wedding_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
            This wedding gets its own checklist, expense tracker, and invite system — completely separate from your other weddings. A one-time $99 payment is required (no free trial for additional weddings).
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? 'Redirecting to payment...' : 'Continue to Payment — $99'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}