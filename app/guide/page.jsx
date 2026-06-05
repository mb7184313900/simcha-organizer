'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const guides = {
  Lchaim: [
    'Choose a date and venue',
    'Create a guest list',
    'Arrange catering or food',
    'Organize music or entertainment',
    'Send invitations',
    'Arrange seating',
    'Prepare vort speech',
    'Coordinate with both families',
  ],
  Tenaim: [
    'Set the date with both families',
    'Choose a rav to officiate',
    'Write up the tenaim document',
    'Arrange a small seudah',
    'Break a plate ceremony',
    'Invite close family',
    'Coordinate with mesader kiddushin',
  ],
  Wedding: [
    'Book the hall',
    'Choose a caterer',
    'Hire a photographer',
    'Hire a band or DJ',
    'Order the wedding dress',
    'Order suits for chosson',
    'Send invitations',
    'Arrange flowers and decorations',
    'Book hair and makeup',
    'Arrange transportation',
    'Prepare ketubah',
    'Choose mesader kiddushin',
    'Plan the badeken',
    'Arrange sheva brachos schedule',
  ],
  'Sheva Brachos': [
    'Set dates for all 7 nights',
    'Assign hosts for each night',
    'Coordinate guest lists',
    'Arrange transportation for chosson and kallah',
    'Prepare divrei Torah schedule',
    'Confirm minyan for bentching',
  ],
}

export default function Guide() {
  const [selected, setSelected] = useState('Wedding')
  const [checked, setChecked] = useState({})
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await loadChecklist(user.id, 'Wedding')
      setLoading(false)
    }
    init()
  }, [])

  const loadChecklist = async (userId, type) => {
    const { data } = await supabase.from('checklist').select('*').eq('user_id', userId).eq('simcha_type', type)
    const newChecked = {}
    data?.forEach(row => { if (row.completed) newChecked[row.item] = true })
    setChecked(newChecked)
  }

  const toggle = async (item) => {
    const newVal = !checked[item]
    setChecked(prev => ({ ...prev, [item]: newVal }))
    const { data } = await supabase.from('checklist').select('*').eq('user_id', user.id).eq('simcha_type', selected).eq('item', item)
    if (data?.length > 0) {
      await supabase.from('checklist').update({ completed: newVal }).eq('id', data[0].id)
    } else {
      await supabase.from('checklist').insert({ user_id: user.id, simcha_type: selected, item, completed: newVal })
    }
  }

  const switchTab = async (type) => {
    setSelected(type)
    setChecked({})
    if (user) await loadChecklist(user.id, type)
  }

  const items = guides[selected]
  const done = items.filter(i => checked[i]).length

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>SimchaPro</h1>
        <span className="text-blue-200 text-sm">Simcha Guide</span>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Simcha Guide 📋</h2>
        <p className="text-gray-500 mb-6">Select your simcha type and check off each step</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          {Object.keys(guides).map(type => (
            <button
              key={type}
              onClick={() => switchTab(type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selected === type ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{done} of {items.length} completed</span>
            <span>{Math.round((done / items.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-900 h-2 rounded-full transition-all" style={{ width: `${(done / items.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm divide-y">
          {items.map(item => (
            <div key={item} onClick={() => toggle(item)} className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked[item] ? 'bg-blue-900 border-blue-900' : 'border-gray-300'}`}>
                {checked[item] && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm ${checked[item] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}