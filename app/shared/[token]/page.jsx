'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function SharedView() {
  const { token } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [linkData, setLinkData] = useState(null)
  const [vendors, setVendors] = useState([])
  const [payments, setPayments] = useState({})
  const [expandedVendor, setExpandedVendor] = useState(null)
  const [user, setUser] = useState(null)
  const [showSignup, setShowSignup] = useState(false)
  const [signupForm, setSignupForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: link } = await supabase.from('shared_links').select('*').eq('link_token', token).single()
      if (!link) { setLoading(false); return }
      setLinkData(link)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadSharedData(link.owner_user_id)
      } else {
        setShowSignup(true)
      }
      setLoading(false)
    }
    init()
  }, [token])

  const loadSharedData = async (ownerId) => {
    const { data } = await supabase.from('vendors').select('*').eq('user_id', ownerId).eq('is_shared', true)
    setVendors(data || [])
    const allPayments = {}
    for (const v of (data || [])) {
      const { data: p } = await supabase.from('payments').select('*').eq('vendor_id', v.id)
      allPayments[v.id] = p || []
    }
    setPayments(allPayments)
  }

  const loadPayments = async (vendorId) => {
    const { data } = await supabase.from('payments').select('*').eq('vendor_id', vendorId)
    setPayments(prev => ({ ...prev, [vendorId]: data || [] }))
  }

  const toggleExpand = async (vendorId) => {
    if (expandedVendor === vendorId) { setExpandedVendor(null); return }
    setExpandedVendor(vendorId)
    await loadPayments(vendorId)
  }

  const handleSignup = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signUp({ email: signupForm.email, password: signupForm.password })
    if (error) { setAuthError(error.message); return }
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setShowSignup(false)
    await loadSharedData(linkData.owner_user_id)
  }

  const handleLogin = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email: signupForm.email, password: signupForm.password })
    if (error) { setAuthError(error.message); return }
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setShowSignup(false)
    await loadSharedData(linkData.owner_user_id)
  }

  const getVendorAddonTotal = (vendorId) => (payments[vendorId] || []).filter(p => p.payment_type === 'Add-on').reduce((s, p) => s + p.amount, 0)
  const getVendorRevisedTotal = (vendor) => vendor.total_amount + getVendorAddonTotal(vendor.id)
  const getVendorTotalPaid = (vendorId) => (payments[vendorId] || []).filter(p => p.payment_type !== 'Add-on' && p.is_paid).reduce((s, p) => s + p.amount, 0)
  const getStatusColor = (s) => s === 'Fully Paid' ? 'bg-green-100 text-green-700' : s === 'Deposit Paid' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
  const getPaymentTypeColor = (t) => t === 'Full Payment' ? 'bg-green-100 text-green-700' : t === 'Partial Payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  if (!linkData) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">This link is invalid or has expired.</p>
    </div>
  )

  if (showSignup) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Shared Expense Viewer</h2>
        <p className="text-gray-500 mb-2">{linkData.chosson_family} & {linkData.kallah_family}</p>
        <p className="text-gray-500 mb-6 text-sm">Sign in or create a free account to view shared expenses.</p>
        <div className="space-y-3">
          <input placeholder="Email address" type="email" value={signupForm.email} onChange={e => setSignupForm(p => ({ ...p, email: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Password" type="password" value={signupForm.password} onChange={e => setSignupForm(p => ({ ...p, password: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
          <button onClick={handleSignup} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800">Create Free Account</button>
          <button onClick={handleLogin} className="w-full border border-blue-900 text-blue-900 py-3 rounded-lg font-bold hover:bg-blue-50">Sign In</button>
        </div>
      </div>
    </div>
  )

  const sharedTotal = vendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0)
  const chossonShare = vendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_chosson / 100), 0)
  const kallaShare = vendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_kallah / 100), 0)
  const paidByChosson = vendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === linkData.chosson_family && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const paidByKalla = vendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === linkData.kallah_family && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const chossonBalance = paidByChosson - chossonShare
  const kallaBalance = paidByKalla - kallaShare

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SimchaPro</h1>
        <span className="text-blue-200 text-sm">{linkData.chosson_family} & {linkData.kallah_family} — Shared Expenses</span>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2">Shared Expenses 💰</h2>
        <p className="text-gray-500 mb-6">View-only access</p>

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-4">Summary</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">Total Shared</p>
              <p className="text-xl font-bold text-blue-900">${sharedTotal.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">{linkData.chosson_family} Share</p>
              <p className="text-xl font-bold text-blue-900">${chossonShare.toLocaleString()}</p>
              <p className="text-xs text-green-600">Paid: ${paidByChosson.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-1">{linkData.kallah_family} Share</p>
              <p className="text-xl font-bold text-blue-900">${kallaShare.toLocaleString()}</p>
              <p className="text-xs text-green-600">Paid: ${paidByKalla.toLocaleString()}</p>
            </div>
          </div>
          {(paidByChosson > chossonShare || paidByKalla > kallaShare) && (
            <div className={`rounded-lg px-4 py-3 text-sm text-center font-semibold ${chossonBalance > 0 || kallaBalance > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {chossonBalance > 0 ? `${linkData.kallah_family} owes ${linkData.chosson_family} $${Math.abs(chossonBalance).toLocaleString()}`
                : kallaBalance > 0 ? `${linkData.chosson_family} owes ${linkData.kallah_family} $${Math.abs(kallaBalance).toLocaleString()}`
                : '✓ All settled'}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {vendors.map(vendor => {
            const vPayments = payments[vendor.id] || []
            const revisedTotal = getVendorRevisedTotal(vendor)
            const vendorPaid = getVendorTotalPaid(vendor.id)
            const isExpanded = expandedVendor === vendor.id

            return (
              <div key={vendor.id} className="bg-white rounded-2xl border shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 rounded-2xl" onClick={() => toggleExpand(vendor.id)}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-800">{vendor.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(vendor.status)}`}>{vendor.status}</span>
                      {vendor.occasion && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{vendor.occasion}</span>}
                    </div>
                    <p className="text-xs text-gray-400">{vendor.category}{vendor.vendor_contact ? ` · ${vendor.vendor_contact}` : ''}{vendor.vendor_phone ? ` · ${vendor.vendor_phone}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-blue-900">${revisedTotal.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">${vendorPaid.toLocaleString()} paid</p>
                    </div>
                    <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t px-6 py-4 space-y-4">
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

                    {vendor.notes && <p className="text-sm text-gray-600 italic">📝 {vendor.notes}</p>}

                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-2">Payments</p>
                      {vPayments.filter(p => p.payment_type !== 'Add-on').map(p => (
                        <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">${p.amount.toLocaleString()}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPaymentTypeColor(p.payment_type)}`}>{p.payment_type}</span>
                            {p.is_check && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Check{p.check_date ? ` (${p.check_date})` : ''}</span>}
                            {p.paid_by && <span className="text-xs text-gray-400">by {p.paid_by}</span>}
                            {p.payment_method && <span className="text-xs text-gray-400">· {p.payment_method}</span>}
                          </div>
                          <div className="text-right text-xs">
                            {p.paid_date && <span className="text-green-600 font-semibold">✓ Paid {p.paid_date}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
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