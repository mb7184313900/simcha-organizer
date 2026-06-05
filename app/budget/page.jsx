'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Hall', 'Catering', 'Music', 'Photography', 'Flowers', 'Clothing', 'Invitations', 'Transportation', 'Other']
const STATUSES = ['Researching', 'Deposit Paid', 'Fully Paid', 'Cancelled']
const PAYMENT_METHODS = ['Cash', 'Check', 'Wire Transfer', 'Credit Card']

export default function Budget() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('my')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [expandedVendor, setExpandedVendor] = useState(null)
  const [familyNames, setFamilyNames] = useState({ chosson: 'Chosson Family', kallah: 'Kallah Family' })
  const [showFamilySetup, setShowFamilySetup] = useState(false)
  const [newVendor, setNewVendor] = useState({
    name: '', category: 'Hall', total_amount: '', is_shared: false,
    split_chosson: 50, split_kallah: 50, vendor_phone: '', vendor_contact: '',
    status: 'Researching', notes: '', receipt_url: ''
  })
  const [payments, setPayments] = useState({})
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState({})
  const [newPayment, setNewPayment] = useState({})
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await loadVendors(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const loadVendors = async (userId) => {
    const { data } = await supabase.from('vendors').select('*').eq('user_id', userId)
    setVendors(data || [])
  }

  const loadPayments = async (vendorId) => {
    const { data } = await supabase.from('payments').select('*').eq('vendor_id', vendorId)
    setPayments(prev => ({ ...prev, [vendorId]: data || [] }))
  }

  const loadComments = async (vendorId) => {
    const { data } = await supabase.from('vendor_comments').select('*').eq('vendor_id', vendorId)
    setComments(prev => ({ ...prev, [vendorId]: data || [] }))
  }

  const toggleExpand = async (vendorId) => {
    if (expandedVendor === vendorId) { setExpandedVendor(null); return }
    setExpandedVendor(vendorId)
    await loadPayments(vendorId)
    await loadComments(vendorId)
  }

  const addVendor = async () => {
    if (!newVendor.name || !newVendor.total_amount) return
    const { data } = await supabase.from('vendors').insert({ ...newVendor, user_id: user.id, total_amount: parseFloat(newVendor.total_amount), split_chosson: parseFloat(newVendor.split_chosson), split_kallah: parseFloat(newVendor.split_kallah), chosson_family: familyNames.chosson, kallah_family: familyNames.kallah }).select()
    setVendors(prev => [...prev, data[0]])
    setShowAddVendor(false)
    setNewVendor({ name: '', category: 'Hall', total_amount: '', is_shared: false, split_chosson: 50, split_kallah: 50, vendor_phone: '', vendor_contact: '', status: 'Researching', notes: '', receipt_url: '' })
  }

  const deleteVendor = async (id) => {
    await supabase.from('vendors').delete().eq('id', id)
    setVendors(prev => prev.filter(v => v.id !== id))
  }

  const addPayment = async (vendorId) => {
    const p = newPayment[vendorId]
    if (!p?.amount) return
    const { data } = await supabase.from('payments').insert({ vendor_id: vendorId, amount: parseFloat(p.amount), due_date: p.due_date || null, paid_date: p.paid_date || null, paid_by: p.paid_by || '', payment_method: p.payment_method || 'Cash', is_deposit: p.is_deposit || false, is_check: p.is_check || false, check_date: p.check_date || null, is_paid: p.is_paid || false }).select()
    setPayments(prev => ({ ...prev, [vendorId]: [...(prev[vendorId] || []), data[0]] }))
    setNewPayment(prev => ({ ...prev, [vendorId]: {} }))
  }

  const addComment = async (vendorId) => {
    const text = newComment[vendorId]
    if (!text) return
    const { data } = await supabase.from('vendor_comments').insert({ vendor_id: vendorId, user_id: user.id, family_name: familyNames.chosson, comment: text }).select()
    setComments(prev => ({ ...prev, [vendorId]: [...(prev[vendorId] || []), data[0]] }))
    setNewComment(prev => ({ ...prev, [vendorId]: '' }))
  }

  const isPaymentDueSoon = (due_date) => {
    if (!due_date) return false
    const due = new Date(due_date)
    const today = new Date()
    const diff = (due - today) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff >= 0
  }

  const filteredVendors = vendors.filter(v => tab === 'my' ? !v.is_shared : v.is_shared)

  const totalBudget = filteredVendors.reduce((sum, v) => sum + v.total_amount, 0)
  const totalPaid = filteredVendors.reduce((sum, v) => {
    const vPayments = payments[v.id] || []
    return sum + vPayments.filter(p => p.is_paid).reduce((s, p) => s + p.amount, 0)
  }, 0)

  const getStatusColor = (status) => {
    if (status === 'Fully Paid') return 'bg-green-100 text-green-700'
    if (status === 'Deposit Paid') return 'bg-yellow-100 text-yellow-700'
    if (status === 'Cancelled') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-600'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>SimchaPro</h1>
        <button onClick={() => setShowFamilySetup(true)} className="text-blue-200 text-sm hover:text-white">⚙️ Family Names</button>
      </div>

      {/* Family Setup Modal */}
      {showFamilySetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-6">Set Family Names</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Chosson's Family Name</label>
                <input value={familyNames.chosson} onChange={e => setFamilyNames(p => ({ ...p, chosson: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Kallah's Family Name</label>
                <input value={familyNames.kallah} onChange={e => setFamilyNames(p => ({ ...p, kallah: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFamilySetup(false)} className="flex-1 bg-blue-900 text-white py-2 rounded-lg font-semibold">Save</button>
              <button onClick={() => setShowFamilySetup(false)} className="flex-1 border py-2 rounded-lg text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Budget Organizer 💰</h2>
        <p className="text-gray-500 mb-6">Track all your simcha expenses</p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-blue-900">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Remaining</p>
            <p className="text-2xl font-bold text-red-500">${(totalBudget - totalPaid).toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Payment Progress</span>
            <span>{totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-900 h-3 rounded-full transition-all" style={{ width: `${totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('my')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'my' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>My Expenses</button>
          <button onClick={() => setTab('shared')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'shared' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>Shared Expenses</button>
        </div>

        {/* Add Vendor Button */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-blue-900">{filteredVendors.length} {tab === 'my' ? 'Private' : 'Shared'} Expenses</h3>
          <button onClick={() => setShowAddVendor(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Add Vendor</button>
        </div>

        {/* Add Vendor Modal */}
        {showAddVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl my-8">
              <h3 className="text-xl font-bold text-blue-900 mb-6">Add Vendor</h3>
              <div className="space-y-3">
                <input placeholder="Vendor name *" value={newVendor.name} onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="grid grid-cols-2 gap-3">
                  <select value={newVendor.category} onChange={e => setNewVendor(p => ({ ...p, category: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select value={newVendor.status} onChange={e => setNewVendor(p => ({ ...p, status: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <input placeholder="Total amount *" type="number" value={newVendor.total_amount} onChange={e => setNewVendor(p => ({ ...p, total_amount: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Vendor phone" value={newVendor.vendor_phone} onChange={e => setNewVendor(p => ({ ...p, vendor_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Contact name" value={newVendor.vendor_contact} onChange={e => setNewVendor(p => ({ ...p, vendor_contact: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Receipt/contract link (optional)" value={newVendor.receipt_url} onChange={e => setNewVendor(p => ({ ...p, receipt_url: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea placeholder="Notes (optional)" value={newVendor.notes} onChange={e => setNewVendor(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={newVendor.is_shared} onChange={e => setNewVendor(p => ({ ...p, is_shared: e.target.checked }))} className="accent-blue-900" />
                  This is a shared expense (split between both families)
                </label>
                {newVendor.is_shared && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-blue-900">Split %</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">{familyNames.chosson} %</label>
                        <input type="number" value={newVendor.split_chosson} onChange={e => setNewVendor(p => ({ ...p, split_chosson: e.target.value, split_kallah: 100 - e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">{familyNames.kallah} %</label>
                        <input type="number" value={newVendor.split_kallah} onChange={e => setNewVendor(p => ({ ...p, split_kallah: e.target.value, split_chosson: 100 - e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={addVendor} className="flex-1 bg-blue-900 text-white py-2 rounded-lg font-semibold">Add Vendor</button>
                <button onClick={() => setShowAddVendor(false)} className="flex-1 border py-2 rounded-lg text-gray-600">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Vendor List */}
        <div className="space-y-3">
          {filteredVendors.length === 0 && <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">No expenses yet. Click + Add Vendor to get started!</div>}
          {filteredVendors.map(vendor => {
            const vPayments = payments[vendor.id] || []
            const vendorPaid = vPayments.filter(p => p.is_paid).reduce((s, p) => s + p.amount, 0)
            const hasDueSoon = vPayments.some(p => !p.is_paid && isPaymentDueSoon(p.due_date))

            return (
              <div key={vendor.id} className={`bg-white rounded-2xl border shadow-sm ${hasDueSoon ? 'border-red-300' : ''}`}>
                <div className="flex items-center justify-between px-6 py-4 cursor-pointer" onClick={() => toggleExpand(vendor.id)}>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">{vendor.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(vendor.status)}`}>{vendor.status}</span>
                        {hasDueSoon && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">⚠️ Payment Due Soon</span>}
                      </div>
                      <p className="text-xs text-gray-400">{vendor.category} {vendor.vendor_contact ? `· ${vendor.vendor_contact}` : ''} {vendor.vendor_phone ? `· ${vendor.vendor_phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-900">${vendor.total_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">${vendorPaid.toLocaleString()} paid</p>
                  </div>
                </div>

                {expandedVendor === vendor.id && (
                  <div className="border-t px-6 py-4 space-y-4">

                    {/* Shared split info */}
                    {vendor.is_shared && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Split</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">{vendor.chosson_family}</p>
                            <p className="font-bold text-blue-900">{vendor.split_chosson}% = ${(vendor.total_amount * vendor.split_chosson / 100).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{vendor.kallah_family}</p>
                            <p className="font-bold text-blue-900">{vendor.split_kallah}% = ${(vendor.total_amount * vendor.split_kallah / 100).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {vendor.notes && <p className="text-sm text-gray-600 italic">📝 {vendor.notes}</p>}

                    {/* Receipt link */}
                    {vendor.receipt_url && <a href={vendor.receipt_url} target="_blank" className="text-sm text-blue-600 hover:underline">📎 View Receipt/Contract</a>}

                    {/* Payments */}
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Payments</p>
                      {vPayments.length === 0 && <p className="text-xs text-gray-400 mb-2">No payments added yet.</p>}
                      {vPayments.map(p => (
                        <div key={p.id} className={`flex items-center justify-between text-sm py-2 border-b ${!p.is_paid && isPaymentDueSoon(p.due_date) ? 'text-red-600' : 'text-gray-700'}`}>
                          <div>
                            <span className="font-semibold">${p.amount.toLocaleString()}</span>
                            {p.is_deposit && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Deposit</span>}
                            {p.is_check && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Check {p.check_date ? `(${p.check_date})` : ''}</span>}
                            {p.paid_by && <span className="ml-2 text-xs text-gray-400">by {p.paid_by}</span>}
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            {p.due_date && <p>Due: {p.due_date}</p>}
                            {p.is_paid ? <span className="text-green-600 font-semibold">✓ Paid {p.paid_date}</span> : <span className="text-red-500">Unpaid</span>}
                          </div>
                        </div>
                      ))}

                      {/* Add Payment */}
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-500">Add Payment</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Amount" type="number" value={newPayment[vendor.id]?.amount || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], amount: e.target.value } }))} className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <select value={newPayment[vendor.id]?.paid_by || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_by: e.target.value } }))} className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="">Who paid?</option>
                            <option>{familyNames.chosson}</option>
                            <option>{familyNames.kallah}</option>
                          </select>
                          <input placeholder="Due date" type="date" value={newPayment[vendor.id]?.due_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], due_date: e.target.value } }))} className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <input placeholder="Paid date" type="date" value={newPayment[vendor.id]?.paid_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_date: e.target.value } }))} className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <select value={newPayment[vendor.id]?.payment_method || 'Cash'} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], payment_method: e.target.value } }))} className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                          </select>
                          <input placeholder="Check date" type="date" value={newPayment[vendor.id]?.check_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], check_date: e.target.value, is_check: true } }))} className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div className="flex gap-3 text-xs">
                          <label className="flex items-center gap-1"><input type="checkbox" checked={newPayment[vendor.id]?.is_deposit || false} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], is_deposit: e.target.checked } }))} /> Deposit</label>
                          <label className="flex items-center gap-1"><input type="checkbox" checked={newPayment[vendor.id]?.is_paid || false} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], is_paid: e.target.checked } }))} /> Already Paid</label>
                        </div>
                        <button onClick={() => addPayment(vendor.id)} className="bg-blue-900 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-800">Add Payment</button>
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Comments</p>
                      {(comments[vendor.id] || []).map(c => (
                        <div key={c.id} className="text-sm py-2 border-b">
                          <span className="font-semibold text-blue-900">{c.family_name}: </span>
                          <span className="text-gray-700">{c.comment}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input placeholder="Add a comment..." value={newComment[vendor.id] || ''} onChange={e => setNewComment(p => ({ ...p, [vendor.id]: e.target.value }))} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button onClick={() => addComment(vendor.id)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">Send</button>
                      </div>
                    </div>

                    {/* Delete */}
                    <button onClick={() => deleteVendor(vendor.id)} className="text-red-400 hover:text-red-600 text-xs">Delete vendor</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}