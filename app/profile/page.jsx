'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAccessStatus } from '../../lib/accessControl'
import Footer from '../../components/Footer'
import Image from 'next/image'

export default function WeddingProfile() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weddingRow, setWeddingRow] = useState(null)
  const [familySettings, setFamilySettings] = useState(null)
  const [form, setForm] = useState({ chosson_family: '', kallah_family: '', wedding_name: '', wedding_date: '' })
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  const isSideB = access?.isSideB || false
  const canEditProfile = !isSideB && (access?.canEdit || false)

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)

      const status = await getAccessStatus(user)
      setAccess(status)

      if (!status.hasDataAccess) {
        router.push('/dashboard')
        return
      }

      const weddingOwnerId = status.isSideB ? status.ownerUserId : user.id

      const { data: wedding } = await supabase.from('weddings').select('*').eq('side_a_user_id', weddingOwnerId).maybeSingle()
      setWeddingRow(wedding || null)
      setForm({
        chosson_family: wedding?.chosson_family || '',
        kallah_family: wedding?.kallah_family || '',
        wedding_name: wedding?.wedding_name || '',
        wedding_date: wedding?.wedding_date || ''
      })

      const { data: fs } = await supabase.from('family_settings').select('*').eq('user_id', user.id).maybeSingle()
      setFamilySettings(fs || null)

      setLoading(false)
    }
    init()
  }, [])

  const handleSave = async () => {
    if (!canEditProfile) return
    if (!form.chosson_family.trim() || !form.kallah_family.trim()) {
      alert('Please fill in both last names.')
      return
    }
    setSaving(true)

    if (weddingRow) {
      await supabase.from('weddings').update({
        chosson_family: form.chosson_family.trim(),
        kallah_family: form.kallah_family.trim(),
        wedding_name: form.wedding_name.trim() || null,
        wedding_date: form.wedding_date || null
      }).eq('id', weddingRow.id)
    } else {
      await supabase.from('weddings').insert({
        side_a_user_id: user.id,
        chosson_family: form.chosson_family.trim(),
        kallah_family: form.kallah_family.trim(),
        wedding_name: form.wedding_name.trim() || null,
        wedding_date: form.wedding_date || null
      })
    }

    // Keep Side A's own family_settings row in sync (used by the Expense Tracker for display names)
    if (familySettings) {
      const updatedMyName = familySettings.my_side === 'chosson' ? form.chosson_family.trim() : form.kallah_family.trim()
      const updatedOtherName = familySettings.my_side === 'chosson' ? form.kallah_family.trim() : form.chosson_family.trim()
      await supabase.from('family_settings').update({
        my_family_name: updatedMyName,
        other_family_name: updatedOtherName
      }).eq('user_id', user.id)
      setFamilySettings(prev => ({ ...prev, my_family_name: updatedMyName, other_family_name: updatedOtherName }))
    }

    const { data: refreshedWedding } = await supabase.from('weddings').select('*').eq('side_a_user_id', user.id).maybeSingle()
    setWeddingRow(refreshedWedding || null)

    setSaving(false)
    showSuccess('Wedding info saved!')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const weddingDateDisplay = form.wedding_date
    ? new Date(form.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

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
        <button onClick={() => router.push('/dashboard')} className="bg-white text-[#141d33] px-3 py-2 rounded-md text-sm font-semibold hover:bg-[#f0ebe0] transition-colors">
          ← Back to Dashboard
        </button>
      </div>

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold">
          {successMessage}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Wedding Profile 💍</h2>
        <p className="text-gray-500 mb-6">
          {canEditProfile ? 'View and edit your wedding details.' : "View-only — only the wedding owner's side can edit these details."}
        </p>

        {!canEditProfile && isSideB && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-blue-700 text-sm">
            You're viewing this in read-only mode. Only the family who created the wedding account can edit these details.
          </div>
        )}

        {!canEditProfile && !isSideB && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-700 text-sm">
            Your edit access has expired. Renew to make changes to your wedding info.
          </div>
        )}

        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Chosson's Last Name</label>
            {canEditProfile ? (
              <input
                value={form.chosson_family}
                onChange={e => setForm(p => ({ ...p, chosson_family: e.target.value }))}
                placeholder="e.g. Weiss"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{form.chosson_family || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Kallah's Last Name</label>
            {canEditProfile ? (
              <input
                value={form.kallah_family}
                onChange={e => setForm(p => ({ ...p, kallah_family: e.target.value }))}
                placeholder="e.g. Schwartz"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{form.kallah_family || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Wedding Name (optional)</label>
            {canEditProfile ? (
              <input
                value={form.wedding_name}
                onChange={e => setForm(p => ({ ...p, wedding_name: e.target.value }))}
                placeholder="e.g. Weiss-Schwartz Wedding"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{form.wedding_name || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Wedding Date (optional)</label>
            {canEditProfile ? (
              <input
                type="date"
                value={form.wedding_date}
                onChange={e => setForm(p => ({ ...p, wedding_date: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">{weddingDateDisplay || '—'}</p>
            )}
          </div>

          {canEditProfile && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}