'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAccessStatus, getMySide } from '../../lib/accessControl'
import Footer from '../../components/Footer'
import Image from 'next/image'

export default function WeddingProfile() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
  const [weddingId, setWeddingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weddingRow, setWeddingRow] = useState(null)
  const [familySettings, setFamilySettings] = useState(null)
  const [form, setForm] = useState({ chosson_family: '', kallah_family: '', wedding_name: '', wedding_date: '', side_a_role: '' })
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
      setWeddingId(status.weddingId)

      if (!status.hasDataAccess) {
        router.push('/dashboard')
        return
      }

      const { data: wedding } = await supabase.from('weddings').select('*').eq('id', status.weddingId).maybeSingle()
      const { data: fs } = await supabase.from('family_settings').select('*').eq('user_id', user.id).eq('wedding_id', status.weddingId).maybeSingle()
      setFamilySettings(fs || null)

      let resolvedWedding = wedding || null

      // Backward compatibility: if side_a_role hasn't been set on the wedding yet
      // but this user's own family_settings already has a my_side answer, derive
      // it from that. Side A backfills it onto the wedding row (the new single
      // source of truth); Side B can't write to weddings, so just derive locally.
      if (resolvedWedding && !resolvedWedding.side_a_role && fs?.my_side) {
        const derivedSideARole = status.isSideB
          ? (fs.my_side === 'chosson' ? 'kallah' : 'chosson')
          : fs.my_side

        if (!status.isSideB) {
          const { data: updatedWedding } = await supabase
            .from('weddings')
            .update({ side_a_role: derivedSideARole })
            .eq('id', resolvedWedding.id)
            .select()
            .maybeSingle()
          resolvedWedding = updatedWedding || { ...resolvedWedding, side_a_role: derivedSideARole }
        } else {
          resolvedWedding = { ...resolvedWedding, side_a_role: derivedSideARole }
        }
      }

      setWeddingRow(resolvedWedding)
      setForm({
        chosson_family: resolvedWedding?.chosson_family || '',
        kallah_family: resolvedWedding?.kallah_family || '',
        wedding_name: resolvedWedding?.wedding_name || '',
        wedding_date: resolvedWedding?.wedding_date || '',
        side_a_role: resolvedWedding?.side_a_role || ''
      })

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
    if (!form.side_a_role) {
      alert('Please select which side you are on.')
      return
    }
    setSaving(true)

    if (weddingRow) {
      await supabase.from('weddings').update({
        chosson_family: form.chosson_family.trim(),
        kallah_family: form.kallah_family.trim(),
        wedding_name: form.wedding_name.trim() || null,
        wedding_date: form.wedding_date || null,
        side_a_role: form.side_a_role
      }).eq('id', weddingRow.id)
    } else {
      await supabase.from('weddings').insert({
        side_a_user_id: user.id,
        chosson_family: form.chosson_family.trim(),
        kallah_family: form.kallah_family.trim(),
        wedding_name: form.wedding_name.trim() || null,
        wedding_date: form.wedding_date || null,
        side_a_role: form.side_a_role
      })
    }

    // Keep Side A's own family_settings row (for this wedding) in sync with display names
    if (familySettings) {
      const updatedMyName = form.side_a_role === 'chosson' ? form.chosson_family.trim() : form.kallah_family.trim()
      const updatedOtherName = form.side_a_role === 'chosson' ? form.kallah_family.trim() : form.chosson_family.trim()
      await supabase.from('family_settings').update({
        my_side: form.side_a_role,
        my_family_name: updatedMyName,
        other_family_name: updatedOtherName
      }).eq('user_id', user.id).eq('wedding_id', weddingId)
      setFamilySettings(prev => ({ ...prev, my_side: form.side_a_role, my_family_name: updatedMyName, other_family_name: updatedOtherName }))
    }

    const { data: refreshedWedding } = await supabase.from('weddings').select('*').eq('id', weddingId).maybeSingle()
    setWeddingRow(refreshedWedding || null)

    setSaving(false)
    showSuccess('Wedding info saved!')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  const weddingDateDisplay = form.wedding_date
    ? new Date(form.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const mySideDisplay = form.side_a_role
    ? (getMySide({ side_a_role: form.side_a_role }, isSideB) === 'chosson' ? "Chosson's Side" : "Kallah's Side")
    : null

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
            {access?.state === 'trial_expired'
              ? 'Your free trial has ended. Activate for $99 to make changes to your wedding info.'
              : 'Your edit access has expired. Renew to make changes to your wedding info.'}
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
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Which side are you?</label>
            {canEditProfile ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, side_a_role: 'chosson' }))}
                  className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${form.side_a_role === 'chosson' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600'}`}
                >
                  Chosson's Side
                </button>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, side_a_role: 'kallah' }))}
                  className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${form.side_a_role === 'kallah' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600'}`}
                >
                  Kallah's Side
                </button>
              </div>
            ) : (
              <p className="text-gray-800 font-medium">
                {mySideDisplay ? `You are on the ${mySideDisplay}` : 'Not set yet'}
              </p>
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
            {canEditProfile && (
              <p className="text-xs text-gray-400 mt-1">Don't know the date yet? You can leave this blank and update it anytime.</p>
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
