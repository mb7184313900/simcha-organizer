'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const CATEGORIES = ['Hall', 'Catering', 'Music', 'Photography', 'Flowers', 'Clothing', 'Invitations', 'Transportation', 'Other']
const PAYMENT_METHODS = ['Cash', 'Check', 'Zelle', 'Wire Transfer', 'Credit Card', 'Other']

export default function ExpenseTracker() {
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('my')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [expandedVendor, setExpandedVendor] = useState(null)
  const [editingVendor, setEditingVendor] = useState(null)
  const [familySettings, setFamilySettings] = useState(null)
  const [showFamilySetup, setShowFamilySetup] = useState(false)
  const [setupForm, setSetupForm] = useState({ my_side: 'chosson', my_family_name: '', other_family_name: '' })
  const [payments, setPayments] = useState({})
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState({})
  const [newPayment, setNewPayment] = useState({})
  const [newAddon, setNewAddon] = useState({})
  const [uploadingFor, setUploadingFor] = useState(null)
  const [newVendor, setNewVendor] = useState({
    name: '', category: 'Hall', total_amount: '', is_shared: false,
    split_chosson: 50, split_kallah: 50, vendor_phone: '', vendor_contact: '',
    notes: '', receipt_url: ''
  })
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: fs } = await supabase.from('family_settings').select('*').eq('user_id', user.id).single()
      if (fs) {
        setFamilySettings(fs)
        await loadVendors(user.id)
      } else {
        setShowFamilySetup(true)
      }
      setLoading(false)
    }
    init()
  }, [])

  const saveFamilySettings = async () => {
    if (!setupForm.my_family_name || !setupForm.other_family_name) return
    const { data } = await supabase.from('family_settings').insert({ user_id: user.id, ...setupForm }).select()
    setFamilySettings(data[0])
    setShowFamilySetup(false)
    await loadVendors(user.id)
  }

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

  const myFamilyName = familySettings?.my_side === 'chosson' ? familySettings?.my_family_name : familySettings?.other_family_name
  const otherFamilyName = familySettings?.my_side === 'chosson' ? familySettings?.other_family_name : familySettings?.my_family_name
  const chossonName = familySettings?.my_side === 'chosson' ? familySettings?.my_family_name : familySettings?.other_family_name
  const kallaName = familySettings?.my_side === 'kallah' ? familySettings?.my_family_name : familySettings?.other_family_name

  const getVendorRegularPayments = (vendorId) => (payments[vendorId] || []).filter(p => p.payment_type !== 'Add-on')
  const getVendorAddons = (vendorId) => (payments[vendorId] || []).filter(p => p.payment_type === 'Add-on')
  const getVendorAddonTotal = (vendorId) => getVendorAddons(vendorId).reduce((s, p) => s + p.amount, 0)
  const getVendorRevisedTotal = (vendor) => vendor.total_amount + getVendorAddonTotal(vendor.id)
  const getVendorTotalPaid = (vendorId) => getVendorRegularPayments(vendorId).filter(p => p.is_paid).reduce((s, p) => s + p.amount, 0)

  const getAutoStatus = (revisedTotal, totalPaid) => {
    if (totalPaid <= 0) return 'Booked'
    if (totalPaid >= revisedTotal) return 'Fully Paid'
    return 'Deposit Paid'
  }

  const addVendor = async () => {
    if (!newVendor.name || !newVendor.total_amount) return
    const { data } = await supabase.from('vendors').insert({
      ...newVendor, user_id: user.id,
      total_amount: parseFloat(newVendor.total_amount),
      split_chosson: parseFloat(newVendor.split_chosson),
      split_kallah: parseFloat(newVendor.split_kallah),
      chosson_family: chossonName,
      kallah_family: kallaName,
      status: 'Booked'
    }).select()
    setVendors(prev => [...prev, data[0]])
    setShowAddVendor(false)
    setNewVendor({ name: '', category: 'Hall', total_amount: '', is_shared: false, split_chosson: 50, split_kallah: 50, vendor_phone: '', vendor_contact: '', notes: '', receipt_url: '' })
  }

  const updateVendor = async (vendor) => {
    await supabase.from('vendors').update({
      name: vendor.name, category: vendor.category, total_amount: parseFloat(vendor.total_amount),
      vendor_phone: vendor.vendor_phone, vendor_contact: vendor.vendor_contact,
      notes: vendor.notes, split_chosson: parseFloat(vendor.split_chosson), split_kallah: parseFloat(vendor.split_kallah)
    }).eq('id', vendor.id)
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, ...vendor } : v))
    setEditingVendor(null)
  }

  const deleteVendor = async (id) => {
    await supabase.from('vendors').delete().eq('id', id)
    setVendors(prev => prev.filter(v => v.id !== id))
    setExpandedVendor(null)
  }

  const addPayment = async (vendor) => {
    const p = newPayment[vendor.id]
    if (!p?.amount) return
    const revisedTotal = getVendorRevisedTotal(vendor)
    const totalPaidSoFar = getVendorTotalPaid(vendor.id)
    const newAmount = parseFloat(p.amount)
    const paymentType = totalPaidSoFar + newAmount >= revisedTotal ? 'Full Payment' : 'Partial Payment'
    const isPaid = !!p.paid_date
    const { data } = await supabase.from('payments').insert({
      vendor_id: vendor.id, amount: newAmount,
      due_date: p.due_date || null, paid_date: p.paid_date || null,
      paid_by: p.paid_by || '', payment_method: p.payment_method || 'Cash',
      is_deposit: false, is_check: p.payment_method === 'Check',
      check_date: p.payment_method === 'Check' ? (p.check_date || null) : null,
      is_paid: isPaid, payment_type: paymentType, description: ''
    }).select()
    const updatedPayments = [...(payments[vendor.id] || []), data[0]]
    setPayments(prev => ({ ...prev, [vendor.id]: updatedPayments }))
    const newTotalPaid = updatedPayments.filter(x => x.payment_type !== 'Add-on' && x.is_paid).reduce((s, x) => s + x.amount, 0)
    const newRevisedTotal = getVendorRevisedTotal(vendor)
    const newStatus = getAutoStatus(newRevisedTotal, newTotalPaid)
    await supabase.from('vendors').update({ status: newStatus }).eq('id', vendor.id)
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: newStatus } : v))
    setNewPayment(prev => ({ ...prev, [vendor.id]: {} }))
  }

  const addAddon = async (vendor) => {
    const a = newAddon[vendor.id]
    if (!a?.amount || !a?.description) return
    const { data } = await supabase.from('payments').insert({
      vendor_id: vendor.id, amount: parseFloat(a.amount),
      due_date: null, paid_date: a.paid_date || null,
      paid_by: a.paid_by || '', payment_method: a.payment_method || 'Cash',
      is_deposit: false, is_check: false, check_date: null,
      is_paid: !!a.paid_date, payment_type: 'Add-on', description: a.description
    }).select()
    const updatedPayments = [...(payments[vendor.id] || []), data[0]]
    setPayments(prev => ({ ...prev, [vendor.id]: updatedPayments }))
    const newRevisedTotal = vendor.total_amount + updatedPayments.filter(p => p.payment_type === 'Add-on').reduce((s, p) => s + p.amount, 0)
    const newTotalPaid = getVendorTotalPaid(vendor.id)
    const newStatus = getAutoStatus(newRevisedTotal, newTotalPaid)
    await supabase.from('vendors').update({ status: newStatus }).eq('id', vendor.id)
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: newStatus } : v))
    setNewAddon(prev => ({ ...prev, [vendor.id]: {} }))
  }

  const addComment = async (vendorId) => {
    const text = newComment[vendorId]
    if (!text) return
    const { data } = await supabase.from('vendor_comments').insert({ vendor_id: vendorId, user_id: user.id, family_name: myFamilyName, comment: text }).select()
    setComments(prev => ({ ...prev, [vendorId]: [...(prev[vendorId] || []), data[0]] }))
    setNewComment(prev => ({ ...prev, [vendorId]: '' }))
  }

  const handleFileUpload = async (e, vendorId) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingFor(vendorId)
    const fileName = `${vendorId}-${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('receipts').upload(fileName, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(fileName)
      await supabase.from('vendors').update({ receipt_url: urlData.publicUrl }).eq('id', vendorId)
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, receipt_url: urlData.publicUrl } : v))
    }
    setUploadingFor(null)
  }

  const isPaymentDueSoon = (due_date, is_paid) => {
    if (!due_date || is_paid) return false
    const diff = (new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff >= 0
  }

  const filteredVendors = vendors.filter(v => tab === 'my' ? !v.is_shared : v.is_shared)
  const allSharedVendors = vendors.filter(v => v.is_shared)
  const allMyVendors = vendors.filter(v => !v.is_shared)

  const myPrivateTotal = allMyVendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0)
  const mySharedTotal = allSharedVendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_chosson / 100), 0)
  const myTotalResponsibility = myPrivateTotal + mySharedTotal
  const myTotalPaid = vendors.reduce((sum, v) => {
    return sum + (payments[v.id] || []).filter(p => p.paid_by === myFamilyName && p.is_paid).reduce((s, p) => s + p.amount, 0)
  }, 0)
  const myStillOwe = Math.max(0, myTotalResponsibility - myTotalPaid)

  const sharedTotal = allSharedVendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0)
  const chossonShare = allSharedVendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_chosson / 100), 0)
  const kallaShare = allSharedVendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_kallah / 100), 0)
  const paidByChosson = allSharedVendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === chossonName && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const paidByKalla = allSharedVendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === kallaName && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const chossonBalance = paidByChosson - chossonShare
  const kallaBalance = paidByKalla - kallaShare

  const getStatusColor = (s) => s === 'Fully Paid' ? 'bg-green-100 text-green-700' : s === 'Deposit Paid' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
  const getPaymentTypeColor = (t) => t === 'Full Payment' ? 'bg-green-100 text-green-700' : t === 'Partial Payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (showFamilySetup) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Expense Tracker</h2>
        <p className="text-gray-500 mb-6">Let's set up your family info first</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Which side are you?</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSetupForm(p => ({ ...p, my_side: 'chosson' }))} className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${setupForm.my_side === 'chosson' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>Chosson's Side</button>
              <button onClick={() => setSetupForm(p => ({ ...p, my_side: 'kallah' }))} className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${setupForm.my_side === 'kallah' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>Kallah's Side</button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Your Family Name</label>
            <input placeholder="e.g. Bloom" value={setupForm.my_family_name} onChange={e => setSetupForm(p => ({ ...p, my_family_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Other Family's Name</label>
            <input placeholder="e.g. Sharon" value={setupForm.other_family_name} onChange={e => setSetupForm(p => ({ ...p, other_family_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={saveFamilySettings} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 mt-2">Get Started</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>SimchaPro</h1>
        <span className="text-blue-200 text-sm">{myFamilyName} · {familySettings?.my_side === 'chosson' ? "Chosson's Side" : "Kallah's Side"}</span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Expense Tracker 💰</h2>
        <p className="text-gray-500 mb-6">Track all your simcha expenses</p>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('my')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'my' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>My Expenses</button>
          <button onClick={() => setTab('shared')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'shared' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>Shared Expenses</button>
        </div>

        {tab === 'my' && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-4">My Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">My Private Expenses</p>
                <p className="text-xl font-bold text-blue-900">${myPrivateTotal.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">My Share of Shared</p>
                <p className="text-xl font-bold text-blue-900">${mySharedTotal.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">I Paid</p>
                <p className="text-xl font-bold text-green-600">${myTotalPaid.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">I Still Owe</p>
                <p className="text-xl font-bold text-red-500">${myStillOwe.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-center mb-3">
              <span className="text-gray-500">My Total Responsibility: </span>
              <span className="font-bold text-blue-900">${myTotalResponsibility.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-900 h-2 rounded-full transition-all" style={{ width: `${myTotalResponsibility > 0 ? (myTotalPaid / myTotalResponsibility) * 100 : 0}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{myTotalResponsibility > 0 ? Math.round((myTotalPaid / myTotalResponsibility) * 100) : 0}% paid</p>
          </div>
        )}

        {tab === 'shared' && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-4">Shared Summary</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">Total Shared</p>
                <p className="text-xl font-bold text-blue-900">${sharedTotal.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">{chossonName} Share</p>
                <p className="text-xl font-bold text-blue-900">${chossonShare.toLocaleString()}</p>
                <p className="text-xs text-green-600">Paid: ${paidByChosson.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs mb-1">{kallaName} Share</p>
                <p className="text-xl font-bold text-blue-900">${kallaShare.toLocaleString()}</p>
                <p className="text-xs text-green-600">Paid: ${paidByKalla.toLocaleString()}</p>
              </div>
            </div>
            {(paidByChosson > 0 || paidByKalla > 0) && (
              <div className={`rounded-lg px-4 py-3 text-sm text-center font-semibold ${chossonBalance < 0 || kallaBalance < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {chossonBalance < 0 ? `${chossonName} owes ${kallaName} $${Math.abs(chossonBalance).toLocaleString()}`
                  : kallaBalance < 0 ? `${kallaName} owes ${chossonName} $${Math.abs(kallaBalance).toLocaleString()}`
                  : '✓ All settled'}
              </div>
            )}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-900 h-2 rounded-full" style={{ width: `${sharedTotal > 0 ? ((paidByChosson + paidByKalla) / sharedTotal) * 100 : 0}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{sharedTotal > 0 ? Math.round(((paidByChosson + paidByKalla) / sharedTotal) * 100) : 0}% paid</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-blue-900">{filteredVendors.length} {tab === 'my' ? 'Private' : 'Shared'} Expenses</h3>
          <button onClick={() => setShowAddVendor(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Add Vendor</button>
        </div>

        {showAddVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl my-8">
              <h3 className="text-xl font-bold text-blue-900 mb-6">Add Vendor</h3>
              <div className="space-y-3">
                <input placeholder="Vendor name *" value={newVendor.name} onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <select value={newVendor.category} onChange={e => setNewVendor(p => ({ ...p, category: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input placeholder="Total contracted price *" type="number" value={newVendor.total_amount} onChange={e => setNewVendor(p => ({ ...p, total_amount: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Vendor phone" value={newVendor.vendor_phone} onChange={e => setNewVendor(p => ({ ...p, vendor_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Contact name" value={newVendor.vendor_contact} onChange={e => setNewVendor(p => ({ ...p, vendor_contact: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea placeholder="Notes (optional)" value={newVendor.notes} onChange={e => setNewVendor(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={newVendor.is_shared} onChange={e => setNewVendor(p => ({ ...p, is_shared: e.target.checked }))} className="accent-blue-900" />
                  Shared expense (split between both families)
                </label>
                {newVendor.is_shared && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-semibold text-blue-900">Split %</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">{chossonName} %</label>
                        <input type="number" value={newVendor.split_chosson} onChange={e => setNewVendor(p => ({ ...p, split_chosson: parseFloat(e.target.value), split_kallah: 100 - parseFloat(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">{kallaName} %</label>
                        <input type="number" value={newVendor.split_kallah} onChange={e => setNewVendor(p => ({ ...p, split_kallah: parseFloat(e.target.value), split_chosson: 100 - parseFloat(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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

        <div className="space-y-3">
          {filteredVendors.length === 0 && <div className="bg-white rounded-2xl border p-8 text-center text-gray-400">No expenses yet. Click + Add Vendor to get started!</div>}
          {filteredVendors.map(vendor => {
            const vPayments = payments[vendor.id] || []
            const regularPayments = getVendorRegularPayments(vendor.id)
            const addons = getVendorAddons(vendor.id)
            const addonTotal = getVendorAddonTotal(vendor.id)
            const revisedTotal = getVendorRevisedTotal(vendor)
            const vendorPaid = getVendorTotalPaid(vendor.id)
            const hasDueSoon = vPayments.some(p => isPaymentDueSoon(p.due_date, p.is_paid))
            const isExpanded = expandedVendor === vendor.id
            const isEditing = editingVendor?.id === vendor.id

            return (
              <div key={vendor.id} className={`bg-white rounded-2xl border shadow-sm ${hasDueSoon ? 'border-red-300' : ''}`}>
                <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 rounded-2xl" onClick={() => !isEditing && toggleExpand(vendor.id)}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{vendor.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(vendor.status)}`}>{vendor.status}</span>
                      {hasDueSoon && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">⚠️ Due Soon</span>}
                    </div>
                    <p className="text-xs text-gray-400">{vendor.category}{vendor.vendor_contact ? ` · ${vendor.vendor_contact}` : ''}{vendor.vendor_phone ? ` · ${vendor.vendor_phone}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-blue-900">${revisedTotal.toLocaleString()}</p>
                      {addonTotal > 0 && <p className="text-xs text-purple-500">+${addonTotal.toLocaleString()} add-ons</p>}
                      <p className="text-xs text-gray-400">${vendorPaid.toLocaleString()} paid</p>
                    </div>
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-6 py-4 space-y-5">

                    {/* Edit vendor */}
                    {isEditing ? (
                      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-bold text-blue-900">Edit Vendor</p>
                        <input value={editingVendor.name} onChange={e => setEditingVendor(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input value={editingVendor.total_amount} type="number" onChange={e => setEditingVendor(p => ({ ...p, total_amount: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Total contracted price" />
                        <input value={editingVendor.vendor_phone} onChange={e => setEditingVendor(p => ({ ...p, vendor_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone" />
                        <input value={editingVendor.vendor_contact} onChange={e => setEditingVendor(p => ({ ...p, vendor_contact: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contact name" />
                        <textarea value={editingVendor.notes} onChange={e => setEditingVendor(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Notes" />
                        <div className="flex gap-2">
                          <button onClick={() => updateVendor(editingVendor)} className="flex-1 bg-blue-900 text-white py-2 rounded-lg text-sm font-semibold">Save</button>
                          <button onClick={() => setEditingVendor(null)} className="flex-1 border py-2 rounded-lg text-sm text-gray-600">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setEditingVendor({ ...vendor }) }} className="text-blue-600 text-xs hover:underline">✏️ Edit vendor info</button>
                    )}

                    {vendor.is_shared && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-900 mb-2">Split</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">{vendor.chosson_family}</p>
                            <p className="font-bold text-blue-900">{vendor.split_chosson}% = ${(revisedTotal * vendor.split_chosson / 100).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">{vendor.kallah_family}</p>
                            <p className="font-bold text-blue-900">{vendor.split_kallah}% = ${(revisedTotal * vendor.split_kallah / 100).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {vendor.notes && <p className="text-sm text-gray-600 italic">📝 {vendor.notes}</p>}

                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Documents</p>
                      {vendor.receipt_url && <a href={vendor.receipt_url} target="_blank" className="text-sm text-blue-600 hover:underline block mb-2">📎 View Document</a>}
                      <div className="flex gap-3 items-center">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold">
                          {uploadingFor === vendor.id ? 'Uploading...' : '📤 Upload File'}
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => handleFileUpload(e, vendor.id)} />
                        </label>
                        <span className="text-xs text-gray-400">or</span>
                        <input placeholder="Paste link" defaultValue={vendor.receipt_url || ''} onBlur={async e => {
                          await supabase.from('vendors').update({ receipt_url: e.target.value }).eq('id', vendor.id)
                          setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, receipt_url: e.target.value } : v))
                        }} className="flex-1 border rounded-lg px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>

                    {/* Payments section */}
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Payments</p>
                      {regularPayments.length === 0 && <p className="text-xs text-gray-400 mb-2">No payments yet.</p>}
                      {regularPayments.map(p => (
                        <div key={p.id} className={`flex items-center justify-between text-sm py-2 border-b ${isPaymentDueSoon(p.due_date, p.is_paid) ? 'text-red-600' : ''}`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">${p.amount.toLocaleString()}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPaymentTypeColor(p.payment_type)}`}>{p.payment_type}</span>
                            {p.is_check && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Check{p.check_date ? ` (${p.check_date})` : ''}</span>}
                            {p.paid_by && <span className="text-xs text-gray-400">by {p.paid_by}</span>}
                            {p.payment_method && <span className="text-xs text-gray-400">· {p.payment_method}</span>}
                          </div>
                          <div className="text-right text-xs">
                            {p.due_date && <p className="text-gray-400">Due: {p.due_date}</p>}
                            {p.is_paid ? <span className="text-green-600 font-semibold">✓ Paid {p.paid_date || ''}</span> : p.due_date ? <span className="text-orange-500">Pending</span> : null}
                          </div>
                        </div>
                      ))}

                      <div className="mt-3 bg-gray-50 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Add Payment</p>
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Amount *" type="number" value={newPayment[vendor.id]?.amount || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], amount: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <select value={newPayment[vendor.id]?.paid_by || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_by: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="">Who paid?</option>
                            <option>{chossonName}</option>
                            <option>{kallaName}</option>
                          </select>
                          <select value={newPayment[vendor.id]?.payment_method || 'Cash'} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], payment_method: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Due date</label>
                            <input type="date" value={newPayment[vendor.id]?.due_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], due_date: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Date paid</label>
                            <input type="date" value={newPayment[vendor.id]?.paid_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_date: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                        {newPayment[vendor.id]?.payment_method === 'Check' && (
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Check date</label>
                            <input type="date" value={newPayment[vendor.id]?.check_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], check_date: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        )}
                        <button onClick={() => addPayment(vendor)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 w-full">Add Payment</button>
                      </div>
                    </div>

                    {/* Additional Charges section */}
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Additional Charges {addonTotal > 0 && <span className="text-purple-600 font-normal text-xs ml-1">+${addonTotal.toLocaleString()} total</span>}</p>
                      {addons.length === 0 && <p className="text-xs text-gray-400 mb-2">No additional charges yet.</p>}
                      {addons.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">${p.amount.toLocaleString()}</span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Add-on</span>
                            {p.description && <span className="text-xs text-gray-500">{p.description}</span>}
                            {p.paid_by && <span className="text-xs text-gray-400">by {p.paid_by}</span>}
                          </div>
                          <span className={p.is_paid ? 'text-green-600 text-xs font-semibold' : 'text-xs text-gray-400'}>{p.is_paid ? `✓ Paid ${p.paid_date || ''}` : ''}</span>
                        </div>
                      ))}
                      <div className="mt-3 bg-purple-50 rounded-lg p-4 space-y-3">
                        <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Add Additional Charge</p>
                        <input placeholder="Description * (e.g. Extra hour overtime)" value={newAddon[vendor.id]?.description || ''} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], description: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <div className="grid grid-cols-2 gap-2">
                          <input placeholder="Amount *" type="number" value={newAddon[vendor.id]?.amount || ''} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], amount: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          <select value={newAddon[vendor.id]?.paid_by || ''} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_by: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                            <option value="">Who paid?</option>
                            <option>{chossonName}</option>
                            <option>{kallaName}</option>
                          </select>
                          <select value={newAddon[vendor.id]?.payment_method || 'Cash'} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], payment_method: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                          </select>
                          <div>
                            <input type="date" placeholder="Date paid" value={newAddon[vendor.id]?.paid_date || ''} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_date: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                        <button onClick={() => addAddon(vendor)} className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-800 w-full">Add Charge</button>
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Comments</p>
                      {(comments[vendor.id] || []).length === 0 && <p className="text-xs text-gray-400 mb-2">No comments yet.</p>}
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