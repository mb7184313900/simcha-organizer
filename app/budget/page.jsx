'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getAccessStatus, setActiveWedding } from '../../lib/accessControl'
import Footer from '../../components/Footer'
import Image from 'next/image'

const DEFAULT_CATEGORIES = ['Hall', 'Catering', 'Music', 'Photography', 'Flowers', 'Clothing', 'Invitations', 'Transportation', 'Other']
const DEFAULT_OCCASIONS = ['Shadchen', 'Lchaim/Vort', 'Tenaim', 'Aufruf', 'Wedding', 'Shabbos Sheva Brachos', 'Sheva Brachos', 'Gifts', 'Apartment', 'Furniture', 'General']
const PAYMENT_METHODS = ['Cash', 'Check', 'Zelle', 'Wire Transfer', 'Credit Card', 'Other']

export default function ExpenseTracker() {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(null)
  const [weddingId, setWeddingId] = useState(null)
  const [tab, setTab] = useState('my')
  const [sortBy, setSortBy] = useState('name')
  const [filterOccasion, setFilterOccasion] = useState('All')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [expandedVendor, setExpandedVendor] = useState(null)
  const [editingVendor, setEditingVendor] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [familySettings, setFamilySettings] = useState(null)
  const [weddingInfo, setWeddingInfo] = useState(null)
  const [showFamilySetup, setShowFamilySetup] = useState(false)
  const [setupForm, setSetupForm] = useState({ my_side: 'chosson', my_family_name: '', other_family_name: '', wedding_name: '', wedding_date: '' })
  const [payments, setPayments] = useState({})
  const [notes, setNotes] = useState({})
  const [newNote, setNewNote] = useState({})
  const [editingNote, setEditingNote] = useState(null)
  const [newPayment, setNewPayment] = useState({})
  const [newAddon, setNewAddon] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [customCategories, setCustomCategories] = useState([])
  const [customOccasions, setCustomOccasions] = useState([])
  const [newCustomCategory, setNewCustomCategory] = useState('')
  const [newCustomOccasion, setNewCustomOccasion] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddOccasion, setShowAddOccasion] = useState(false)
  const [vendorToDelete, setVendorToDelete] = useState(null)
  const [newVendor, setNewVendor] = useState({
    name: '', category: 'Hall', occasion: '', total_amount: '', is_my_expense: true, is_shared_expense: false,
    split_chosson: 50, split_kallah: 50, vendor_phone: '', vendor_contact: '',
    notes: '', receipt_url: '',
    payment_amount: '', payment_method: 'Cash', payment_due_date: '', payment_paid_date: '', payment_check_date: ''
  })
  const router = useRouter()

  const isSideB = access?.isSideB || false
  const isRevoked = access?.state === 'revoked'
  const ownerUserId = access?.ownerUserId || null
  const canEdit = access?.canEdit || false

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]
  const allOccasions = [...DEFAULT_OCCASIONS, ...customOccasions]

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const loadWeddingInfo = async (wId) => {
    const { data } = await supabase.from('weddings').select('*').eq('id', wId).maybeSingle()
    setWeddingInfo(data || null)
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

      if (status.weddingId) {
        await loadWeddingInfo(status.weddingId)
      }

      const { data: fs } = await supabase.from('family_settings').select('*').eq('user_id', user.id).eq('wedding_id', status.weddingId).maybeSingle()
      if (fs) {
        setFamilySettings(fs)
        if (fs.custom_categories) setCustomCategories(JSON.parse(fs.custom_categories))
        if (fs.custom_occasions) setCustomOccasions(JSON.parse(fs.custom_occasions))
        if (status.isSideB) {
          if (status.state === 'revoked') {
            await loadVendors(user.id, status.weddingId)
          } else {
            await loadVendorsSideB(user.id, status.ownerUserId, status.weddingId)
          }
        } else {
          await loadVendors(user.id, status.weddingId)
        }
      } else {
        setShowFamilySetup(true)
      }
      setLoading(false)
    }
    init()
  }, [])

  const saveFamilySettings = async () => {
    if (!setupForm.my_family_name || !setupForm.other_family_name) return

    let currentWeddingId = weddingId

    // Create the weddings row — Side A only. Side B gets linked in via the invite accept API instead.
    if (!isSideB && !currentWeddingId) {
      const { data: newWedding } = await supabase.from('weddings').insert({
        side_a_user_id: user.id,
        chosson_family: setupForm.my_side === 'chosson' ? setupForm.my_family_name : setupForm.other_family_name,
        kallah_family: setupForm.my_side === 'kallah' ? setupForm.my_family_name : setupForm.other_family_name,
        wedding_name: setupForm.wedding_name || null,
        wedding_date: setupForm.wedding_date || null
      }).select().single()
      currentWeddingId = newWedding.id
      setWeddingId(currentWeddingId)
      await setActiveWedding(user, currentWeddingId)
      await loadWeddingInfo(currentWeddingId)
    }

    const { data } = await supabase.from('family_settings').insert({
      user_id: user.id,
      wedding_id: currentWeddingId,
      my_side: setupForm.my_side,
      my_family_name: setupForm.my_family_name,
      other_family_name: setupForm.other_family_name
    }).select()
    setFamilySettings(data[0])
    setShowFamilySetup(false)

    await loadVendors(user.id, currentWeddingId)
  }

  const addCustomCategory = async () => {
    if (!canEdit) return
    if (!newCustomCategory.trim()) return
    const updated = [...customCategories, newCustomCategory.trim()]
    setCustomCategories(updated)
    await supabase.from('family_settings').update({ custom_categories: JSON.stringify(updated) }).eq('user_id', user.id).eq('wedding_id', weddingId)
    setNewCustomCategory('')
    setShowAddCategory(false)
  }

  const addCustomOccasion = async () => {
    if (!canEdit) return
    if (!newCustomOccasion.trim()) return
    const updated = [...customOccasions, newCustomOccasion.trim()]
    setCustomOccasions(updated)
    await supabase.from('family_settings').update({ custom_occasions: JSON.stringify(updated) }).eq('user_id', user.id).eq('wedding_id', weddingId)
    setNewCustomOccasion('')
    setShowAddOccasion(false)
  }

  const loadVendors = async (userId, wId) => {
    const { data: myVendors } = await supabase.from('vendors').select('*').eq('user_id', userId).eq('wedding_id', wId)

    // Also load shared vendors entered by Side B (if they accepted an invite from us)
    const { data: invite } = await supabase
      .from('wedding_invites')
      .select('*')
      .eq('owner_user_id', userId)
      .eq('wedding_id', wId)
      .eq('status', 'accepted')
      .maybeSingle()

    let sideBVendors = []
    if (invite?.accepted_by_user_id) {
      const { data: bVendors } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', invite.accepted_by_user_id)
        .eq('wedding_id', wId)
        .eq('is_shared', true)
        .eq('entered_by_user_id', invite.accepted_by_user_id)
      sideBVendors = bVendors || []
    }

    const combined = [...(myVendors || []), ...sideBVendors]
    setVendors(combined)
    const allPayments = {}
    for (const v of combined) {
      const { data: p } = await supabase.from('payments').select('*').eq('vendor_id', v.id)
      allPayments[v.id] = p || []
    }
    setPayments(allPayments)
  }

  const loadVendorsSideB = async (sideBUserId, sideAUserId, wId) => {
    const { data: sideAVendors } = await supabase.from('vendors').select('*').eq('user_id', sideAUserId).eq('wedding_id', wId).eq('is_shared', true)
    const { data: sideBVendors } = await supabase.from('vendors').select('*').eq('user_id', sideBUserId).eq('wedding_id', wId)
    const combined = [...(sideAVendors || []), ...(sideBVendors || [])]
    setVendors(combined)
    const allPayments = {}
    for (const v of combined) {
      const { data: p } = await supabase.from('payments').select('*').eq('vendor_id', v.id)
      allPayments[v.id] = p || []
    }
    setPayments(allPayments)
  }

  const loadPayments = async (vendorId) => {
    const { data } = await supabase.from('payments').select('*').eq('vendor_id', vendorId)
    setPayments(prev => ({ ...prev, [vendorId]: data || [] }))
  }

  const loadNotes = async (vendorId) => {
    const { data } = await supabase.from('vendor_comments').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: true })
    setNotes(prev => ({ ...prev, [vendorId]: data || [] }))
  }

  const loadAllPayments = async (vendorList) => {
    for (const v of vendorList) await loadPayments(v.id)
  }

  const toggleExpand = async (vendorId) => {
    if (expandedVendor === vendorId) { setExpandedVendor(null); return }
    setExpandedVendor(vendorId)
    await loadPayments(vendorId)
    await loadNotes(vendorId)
  }

  const chossonName = familySettings?.my_side === 'chosson' ? familySettings?.my_family_name : familySettings?.other_family_name
  const kallaName = familySettings?.my_side === 'kallah' ? familySettings?.my_family_name : familySettings?.other_family_name
  const myFamilyName = familySettings?.my_family_name

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

  const addNote = async (vendorId) => {
    if (!canEdit) return
    const text = newNote[vendorId]
    if (!text?.trim()) return
    const { data } = await supabase.from('vendor_comments').insert({
      vendor_id: vendorId, user_id: user.id, family_name: myFamilyName, comment: text.trim()
    }).select()
    setNotes(prev => ({ ...prev, [vendorId]: [...(prev[vendorId] || []), data[0]] }))
    setNewNote(prev => ({ ...prev, [vendorId]: '' }))
    showSuccess('Note added!')
  }

  const updateNote = async (note) => {
    if (!canEdit) return
    if (!editingNote?.comment?.trim()) return
    await supabase.from('vendor_comments').update({ comment: editingNote.comment }).eq('id', note.id)
    setNotes(prev => ({
      ...prev,
      [note.vendor_id]: prev[note.vendor_id].map(n => n.id === note.id ? { ...n, comment: editingNote.comment } : n)
    }))
    setEditingNote(null)
    showSuccess('Note updated!')
  }

  const deleteNote = async (noteId, vendorId) => {
    if (!canEdit) return
    await supabase.from('vendor_comments').delete().eq('id', noteId)
    setNotes(prev => ({ ...prev, [vendorId]: prev[vendorId].filter(n => n.id !== noteId) }))
    showSuccess('Note deleted!')
  }

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [existingInvite, setExistingInvite] = useState(null)

  useEffect(() => {
    const loadInvite = async () => {
      if (!user || !weddingId) return
      const { data } = await supabase.from('wedding_invites').select('*').eq('owner_user_id', user.id).eq('wedding_id', weddingId).maybeSingle()
      if (data) setExistingInvite(data)
    }
    loadInvite()
  }, [user, weddingId])

  // Note: Invite management (send/revoke/reinstate) is intentionally NOT gated by canEdit.
  // Side A can always manage shared access for the other family, even after edit access has expired.
  const sendInvite = async () => {
    if (!inviteEmail || !weddingId) return
    setInviteStatus('sending')

    // Delete any existing invite first so we start fresh
    await supabase.from('wedding_invites').delete().eq('owner_user_id', user.id).eq('wedding_id', weddingId)

    const res = await fetch('/api/invite/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invitedEmail: inviteEmail,
        ownerUserId: user.id,
        weddingId: weddingId,
        ownerFamilyName: myFamilyName,
        ownerSide: familySettings.my_side,
        chossonFamily: chossonName,
        kallahFamily: kallaName
      })
    })
    const result = await res.json()
    if (result.success) {
      setInviteStatus('sent')
      setShowInviteForm(false)
      const { data } = await supabase.from('wedding_invites').select('*').eq('owner_user_id', user.id).eq('wedding_id', weddingId).maybeSingle()
      setExistingInvite(data)
    } else {
      setInviteStatus('error')
    }
  }

  const revokeInvite = async () => {
    await supabase.from('wedding_invites').update({ status: 'revoked' }).eq('owner_user_id', user.id).eq('wedding_id', weddingId)
    setExistingInvite(prev => ({ ...prev, status: 'revoked' }))
    showSuccess('Access revoked.')
  }

  const reinstateInvite = async () => {
    await supabase.from('wedding_invites').update({ status: 'accepted' }).eq('owner_user_id', user.id).eq('wedding_id', weddingId)
    setExistingInvite(prev => ({ ...prev, status: 'accepted' }))
    showSuccess('Access reinstated.')
  }

  const exportPDF = async (type) => {
    // Fetch fresh data directly from Supabase — guarantees accuracy even if a vendor
    // was never expanded on screen (React state can otherwise be stale/incomplete).
    const freshPayments = {}
    const freshNotes = {}
    for (const v of vendors) {
      const { data: p } = await supabase.from('payments').select('*').eq('vendor_id', v.id)
      freshPayments[v.id] = p || []
      const { data: n } = await supabase.from('vendor_comments').select('*').eq('vendor_id', v.id).order('created_at', { ascending: true })
      freshNotes[v.id] = n || []
    }
    setPayments(freshPayments)
    setNotes(freshNotes)

    const isSharedOnly = type === 'shared'

    const getFreshRegularPayments = (vendorId) => (freshPayments[vendorId] || []).filter(p => p.payment_type !== 'Add-on')
    const getFreshAddons = (vendorId) => (freshPayments[vendorId] || []).filter(p => p.payment_type === 'Add-on')
    const getFreshAddonTotal = (vendorId) => getFreshAddons(vendorId).reduce((s, p) => s + p.amount, 0)
    const getFreshRevisedTotal = (vendor) => vendor.total_amount + getFreshAddonTotal(vendor.id)
    const getFreshPaidBy = (vendorId, name) => getFreshRegularPayments(vendorId).filter(p => p.paid_by === name && p.is_paid).reduce((s, p) => s + p.amount, 0)
    const getFreshTotalPaid = (vendorId) => getFreshRegularPayments(vendorId).filter(p => p.is_paid).reduce((s, p) => s + p.amount, 0)

    // Recompute shared totals from the fresh data (component state may not have re-rendered yet)
    const freshSharedTotal = allSharedVendors.reduce((s, v) => s + getFreshRevisedTotal(v), 0)
    const freshChossonShare = allSharedVendors.reduce((s, v) => s + (getFreshRevisedTotal(v) * v.split_chosson / 100), 0)
    const freshKallaShare = allSharedVendors.reduce((s, v) => s + (getFreshRevisedTotal(v) * v.split_kallah / 100), 0)
    const freshPaidByChosson = allSharedVendors.reduce((sum, v) => sum + getFreshPaidBy(v.id, chossonName), 0)
    const freshPaidByKalla = allSharedVendors.reduce((sum, v) => sum + getFreshPaidBy(v.id, kallaName), 0)
    const freshChossonBalance = freshPaidByChosson - freshChossonShare
    const freshKallaBalance = freshPaidByKalla - freshKallaShare

    const weddingDateDisplay = weddingInfo?.wedding_date
      ? new Date(weddingInfo.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : ''

    const renderVendorBlock = (vendor, isShared) => {
      const revisedTotal = getFreshRevisedTotal(vendor)
      const vPayments = getFreshRegularPayments(vendor.id)
      const vAddons = getFreshAddons(vendor.id)
      const totalPaid = getFreshTotalPaid(vendor.id)
      const balanceDue = Math.max(0, revisedTotal - totalPaid)
      const vNotes = freshNotes[vendor.id] || []

      let summaryLine
      if (isShared) {
        const chossonPaid = getFreshPaidBy(vendor.id, chossonName)
        const kallaPaid = getFreshPaidBy(vendor.id, kallaName)
        summaryLine = `${chossonName} Paid: $${chossonPaid.toLocaleString()} &nbsp;|&nbsp; ${kallaName} Paid: $${kallaPaid.toLocaleString()} &nbsp;|&nbsp; Balance Due: $${balanceDue.toLocaleString()}`
      } else {
        summaryLine = `Total Paid: $${totalPaid.toLocaleString()} &nbsp;|&nbsp; Balance Due: $${balanceDue.toLocaleString()}`
      }

      return `
        <div class="${isShared ? 'vendor-header' : 'private-vendor-header'}">
          ${vendor.name} | ${vendor.category} | For: ${vendor.occasion || 'General'} | Total: $${revisedTotal.toLocaleString()}
        </div>
        <div class="vendor-summary-line">${summaryLine}</div>
        <table><tr><th>Type</th><th>Amount</th><th>Paid By</th><th>Method</th><th>Date</th></tr>
        ${vPayments.length > 0 ? vPayments.map(p => `<tr><td>${p.payment_type||''}</td><td>$${p.amount.toLocaleString()}</td><td>${p.paid_by||''}</td><td>${p.payment_method||''}</td><td>${p.paid_date||p.due_date||''}</td></tr>`).join('') : '<tr><td colspan="5" style="color:#999">No payments recorded</td></tr>'}
        ${vAddons.map(p => `<tr><td>Add-on</td><td>$${p.amount.toLocaleString()}</td><td colspan="3">${p.description||''}</td></tr>`).join('')}
        </table>
        ${vNotes.length > 0 ? `<div class="notes-box"><strong>Notes:</strong><ul>${vNotes.map(n => `<li>${n.comment}</li>`).join('')}</ul></div>` : ''}
      `
    }

    const reportVendors = isSharedOnly ? allSharedVendors : vendors
    const grandTotalBudget = reportVendors.reduce((s, v) => s + getFreshRevisedTotal(v), 0)
    const grandTotalPaid = reportVendors.reduce((s, v) => s + getFreshTotalPaid(v.id), 0)
    const grandTotalRemaining = Math.max(0, grandTotalBudget - grandTotalPaid)

    const printWindow = window.open('', '_blank')
    const html = `
      <html><head>
        <title>SimchaPro ${isSharedOnly ? 'Shared Expense Report' : 'Full Expense Report'}</title>
        <style>
        @page { size: portrait; margin: 0.5in; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; }
          .logo-bar { text-align: center; padding: 16px 0 14px; border-bottom: 3px solid #C9A227; margin-bottom: 10px; background: #141d33; border-radius: 8px 8px 0 0; }
          .logo-img { height: 56px; width: auto; }
          .logo-tagline { font-size: 12px; color: #C9A227; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 6px; }
          h1 { color: #141d33; text-align: center; margin: 15px 0 5px; font-size: 22px; }
          h2 { color: #141d33; margin-top: 30px; border-bottom: 2px solid #C9A227; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #141d33; color: #C9A227; padding: 8px; text-align: left; }
          td { padding: 6px 8px; border-bottom: 1px solid #eee; }
          .summary-box { background: #f5f2e8; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #C9A227; }
          .balance { font-size: 15px; font-weight: bold; color: #c00; margin: 10px 0 0; }
          .settled { font-size: 15px; font-weight: bold; color: green; margin: 10px 0 0; }
          .vendor-header { background: #eceef3; padding: 8px 12px; margin-top: 15px; border-radius: 6px; font-weight: bold; font-size: 13px; border-left: 4px solid #141d33; }
          .private-vendor-header { background: #f5f2e8; padding: 8px 12px; margin-top: 15px; border-radius: 6px; font-weight: bold; font-size: 13px; border-left: 4px solid #C9A227; }
          .vendor-summary-line { font-size: 12px; color: #444; padding: 6px 12px; background: #fafafa; border-left: 3px solid #141d33; margin-top: 4px; }
          .notes-box { background: #fffbea; border-left: 3px solid #C9A227; padding: 8px 12px; margin-top: 6px; font-size: 12px; }
          .notes-box ul { margin: 4px 0 0 18px; padding: 0; }
          .subtitle { text-align: center; color: #666; margin: 3px 0; }
          .wedding-name { text-align: center; font-size: 18px; font-weight: bold; color: #141d33; margin: 8px 0 0; }
          .wedding-date { text-align: center; font-size: 13px; color: #888; margin: 2px 0 10px; }
          .notice { background: #fff3cd; padding: 8px 15px; border-radius: 6px; text-align: center; font-size: 12px; color: #856404; margin: 10px 0; }
          .print-btn { position: fixed; top: 20px; right: 20px; background: #C9A227; color: #141d33; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; }
          .grand-summary { background: #141d33; color: white; padding: 20px; border-radius: 10px; margin-top: 40px; border: 2px solid #C9A227; }
          .grand-summary h2 { color: #C9A227; border-bottom: 2px solid rgba(201,162,39,0.4); margin-top: 0; }
          .grand-summary table { font-size: 14px; }
          .grand-summary th { background: rgba(201,162,39,0.15); color: #C9A227; }
          .grand-summary td { border-bottom: 1px solid rgba(255,255,255,0.2); color: white; }
          @media print { .print-btn { display: none; } }
        </style>
      </head><body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <div class="logo-bar">
          <img class="logo-img" src="${window.location.origin}/images/logo.png" alt="SimchaPro" />
          <div class="logo-tagline">Simcha Planning Made Simple</div>
        </div>
        <h1>${isSharedOnly ? 'Shared Expense Report' : 'Full Expense Report'}</h1>
        ${weddingInfo?.wedding_name ? `<p class="wedding-name">${weddingInfo.wedding_name}</p>` : ''}
        ${weddingDateDisplay ? `<p class="wedding-date">📅 ${weddingDateDisplay}</p>` : ''}
        <p class="subtitle">${chossonName} & ${kallaName}</p>
        <p class="subtitle">Generated: ${new Date().toLocaleDateString()}</p>
        ${isSharedOnly ? '<p class="notice">This report contains shared expenses only</p>' : '<p class="notice">Confidential — For personal use only</p>'}
        <h2>Shared Expenses Summary</h2>
        <div class="summary-box">
          <table>
            <tr><th></th><th>${chossonName}</th><th>${kallaName}</th><th>Total</th></tr>
            <tr><td>Share</td><td>$${freshChossonShare.toLocaleString()}</td><td>$${freshKallaShare.toLocaleString()}</td><td>$${freshSharedTotal.toLocaleString()}</td></tr>
            <tr><td>Paid</td><td>$${freshPaidByChosson.toLocaleString()}</td><td>$${freshPaidByKalla.toLocaleString()}</td><td>$${(freshPaidByChosson + freshPaidByKalla).toLocaleString()}</td></tr>
          </table>
          <p class="${freshChossonBalance > 0 || freshKallaBalance > 0 ? 'balance' : 'settled'}">${freshChossonBalance > 0 ? `${kallaName} owes ${chossonName} $${Math.abs(freshChossonBalance).toLocaleString()}` : freshKallaBalance > 0 ? `${chossonName} owes ${kallaName} $${Math.abs(freshKallaBalance).toLocaleString()}` : 'All settled between families'}</p>
        </div>
        <h2>Shared Expenses — Detail</h2>
        ${allSharedVendors.map(vendor => renderVendorBlock(vendor, true)).join('')}
        ${!isSharedOnly && allMyVendors.length > 0 ? `<h2>${myFamilyName} — Private Expenses</h2>
        ${allMyVendors.map(vendor => renderVendorBlock(vendor, false)).join('')}` : ''}
        <div class="grand-summary">
          <h2>Grand Summary</h2>
          <table>
            <tr><th>Total Budget</th><th>Total Paid</th><th>Total Remaining</th></tr>
            <tr><td>$${grandTotalBudget.toLocaleString()}</td><td>$${grandTotalPaid.toLocaleString()}</td><td>$${grandTotalRemaining.toLocaleString()}</td></tr>
          </table>
        </div>
      </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const addVendor = async () => {
    if (!canEdit) return
    if (!newVendor.name || !newVendor.total_amount) return
    if (!newVendor.category) { alert('Please select a Category'); return }
    if (!newVendor.occasion) { alert('Please select a For occasion'); return }
    if (!newVendor.is_my_expense && !newVendor.is_shared_expense) { alert('Please check either My Expense or Shared Expense'); return }
    const isShared = newVendor.is_shared_expense

    const { data } = await supabase.from('vendors').insert({
      name: newVendor.name, category: newVendor.category, occasion: newVendor.occasion,
      total_amount: parseFloat(newVendor.total_amount), is_shared: isShared,
      split_chosson: parseFloat(newVendor.split_chosson), split_kallah: parseFloat(newVendor.split_kallah),
      vendor_phone: newVendor.vendor_phone, vendor_contact: newVendor.vendor_contact,
      notes: newVendor.notes, user_id: (isSideB && newVendor.is_shared_expense) ? ownerUserId : user.id,
      wedding_id: weddingId,
      entered_by_user_id: user.id,
      chosson_family: chossonName, kallah_family: kallaName, status: 'Booked'
    }).select()

    const vendorId = data[0].id
    let finalStatus = 'Booked'

    if (newVendor.payment_amount && newVendor.payment_paid_by) {
      const newAmount = parseFloat(newVendor.payment_amount)
      const totalAmount = parseFloat(newVendor.total_amount)
      const paymentType = newAmount >= totalAmount ? 'Full Payment' : 'Partial Payment'
      await supabase.from('payments').insert({
        vendor_id: vendorId, amount: newAmount,
        due_date: newVendor.payment_due_date || null, paid_date: newVendor.payment_paid_date || null,
        paid_by: newVendor.payment_paid_by, payment_method: newVendor.payment_method || 'Cash',
        is_deposit: false, is_check: newVendor.payment_method === 'Check',
        check_date: newVendor.payment_method === 'Check' ? (newVendor.payment_check_date || null) : null,
        is_paid: true, payment_type: paymentType, description: '',
        created_by: user.id
      })
      finalStatus = getAutoStatus(totalAmount, newAmount)
      await supabase.from('vendors').update({ status: finalStatus }).eq('id', vendorId)
    }

    const updatedVendor = { ...data[0], status: finalStatus }
    setVendors(prev => [...prev, updatedVendor])
    await loadPayments(vendorId)
    setShowAddVendor(false)
    setNewVendor({
      name: '', category: 'Hall', occasion: '', total_amount: '', is_my_expense: true, is_shared_expense: false,
      split_chosson: 50, split_kallah: 50, vendor_phone: '', vendor_contact: '',
      notes: '', receipt_url: '',
      payment_amount: '', payment_method: 'Cash', payment_due_date: '', payment_paid_date: '', payment_check_date: '', payment_paid_by: ''
    })
    showSuccess('Vendor added successfully!')
  }

  const updateVendor = async (vendor) => {
    if (!canEdit) return
    await supabase.from('vendors').update({
      name: vendor.name, category: vendor.category, occasion: vendor.occasion,
      total_amount: parseFloat(vendor.total_amount),
      is_shared: vendor.is_shared,
      vendor_phone: vendor.vendor_phone, vendor_contact: vendor.vendor_contact,
      notes: vendor.notes, split_chosson: parseFloat(vendor.split_chosson), split_kallah: parseFloat(vendor.split_kallah)
    }).eq('id', vendor.id)
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, ...vendor } : v))
    setEditingVendor(null)
    showSuccess('Vendor updated successfully!')
  }

  const deleteVendor = async (id) => {
    if (!canEdit) return
    await supabase.from('vendors').delete().eq('id', id)
    setVendors(prev => prev.filter(v => v.id !== id))
    setExpandedVendor(null)
  }

  const confirmDeleteVendor = async () => {
    if (!vendorToDelete) return
    await deleteVendor(vendorToDelete.id)
    setVendorToDelete(null)
    showSuccess('Vendor deleted.')
  }

  const addPayment = async (vendor) => {
    if (!canEdit) return
    const p = newPayment[vendor.id]
    if (!p?.amount) return
    if (!p?.paid_by) { alert('Who Paid is required'); return }
    const revisedTotal = getVendorRevisedTotal(vendor)
    const totalPaidSoFar = getVendorTotalPaid(vendor.id)
    const newAmount = parseFloat(p.amount)
    const paymentType = totalPaidSoFar + newAmount >= revisedTotal ? 'Full Payment' : 'Partial Payment'
    const { data } = await supabase.from('payments').insert({
      vendor_id: vendor.id, amount: newAmount,
      due_date: p.due_date || null, paid_date: p.paid_date || null,
      paid_by: p.paid_by, payment_method: p.payment_method || 'Cash',
      is_deposit: false, is_check: p.payment_method === 'Check',
      check_date: p.payment_method === 'Check' ? (p.check_date || null) : null,
      is_paid: true, payment_type: paymentType, description: '',
      created_by: user.id
    }).select()
    const updatedPayments = [...(payments[vendor.id] || []), data[0]]
    setPayments(prev => ({ ...prev, [vendor.id]: updatedPayments }))
    const newTotalPaid = updatedPayments.filter(x => x.payment_type !== 'Add-on' && x.is_paid).reduce((s, x) => s + x.amount, 0)
    const newStatus = getAutoStatus(revisedTotal, newTotalPaid)
    await supabase.from('vendors').update({ status: newStatus }).eq('id', vendor.id)
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: newStatus } : v))
    setNewPayment(prev => ({ ...prev, [vendor.id]: {} }))
    showSuccess(`Payment of $${newAmount.toLocaleString()} recorded successfully!`)
  }

  const updatePayment = async (payment) => {
    if (!canEdit) return
    await supabase.from('payments').update({
      amount: parseFloat(payment.amount), paid_by: payment.paid_by,
      payment_method: payment.payment_method, due_date: payment.due_date || null,
      paid_date: payment.paid_date || null, is_check: payment.payment_method === 'Check',
      check_date: payment.payment_method === 'Check' ? (payment.check_date || null) : null,
      updated_at: new Date().toISOString(), last_edited_by: user.id
    }).eq('id', payment.id)
    setPayments(prev => ({ ...prev, [payment.vendor_id]: prev[payment.vendor_id].map(p => p.id === payment.id ? { ...p, ...payment, amount: parseFloat(payment.amount) } : p) }))
    setEditingPayment(null)
    showSuccess('Payment updated successfully!')
  }

  const deletePayment = async (paymentId, vendorId) => {
    if (!canEdit) return
    await supabase.from('payments').delete().eq('id', paymentId)
    setPayments(prev => ({ ...prev, [vendorId]: prev[vendorId].filter(x => x.id !== paymentId) }))
  }

  const addAddon = async (vendor) => {
    if (!canEdit) return
    const a = newAddon[vendor.id]
    if (!a?.amount || !a?.description) return
    const { data } = await supabase.from('payments').insert({
      vendor_id: vendor.id, amount: parseFloat(a.amount),
      due_date: null, paid_date: null, paid_by: '', payment_method: 'Cash',
      is_deposit: false, is_check: false, check_date: null,
      is_paid: true, payment_type: 'Add-on', description: a.description,
      created_by: user.id
    }).select()
    const updatedPayments = [...(payments[vendor.id] || []), data[0]]
    setPayments(prev => ({ ...prev, [vendor.id]: updatedPayments }))
    const newRevisedTotal = vendor.total_amount + updatedPayments.filter(p => p.payment_type === 'Add-on').reduce((s, p) => s + p.amount, 0)
    const newStatus = getAutoStatus(newRevisedTotal, getVendorTotalPaid(vendor.id))
    await supabase.from('vendors').update({ status: newStatus }).eq('id', vendor.id)
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: newStatus } : v))
    setNewAddon(prev => ({ ...prev, [vendor.id]: {} }))
    showSuccess(`Additional charge of $${parseFloat(a.amount).toLocaleString()} recorded successfully!`)
  }

  const isPaymentDueSoon = (due_date, is_paid) => {
    if (!due_date || is_paid) return false
    const diff = (new Date(due_date) - new Date()) / (1000 * 60 * 60 * 24)
    return diff <= 30 && diff >= 0
  }

  const allChecks = vendors.flatMap(v =>
    (payments[v.id] || []).filter(p => p.is_check).map(p => ({ ...p, vendorName: v.name }))
  ).sort((a, b) => new Date(a.check_date) - new Date(b.check_date))

  const getSortedVendors = (list) => [...list].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'price') return b.total_amount - a.total_amount
    if (sortBy === 'status') return a.status.localeCompare(b.status)
    if (sortBy === 'category') return a.category.localeCompare(b.category)
    if (sortBy === 'occasion') return (a.occasion || '').localeCompare(b.occasion || '')
    return 0
  })

  const baseFilteredVendors = vendors.filter(v => tab === 'my' ? !v.is_shared : v.is_shared)
  const filteredVendors = getSortedVendors(
    filterOccasion === 'All' ? baseFilteredVendors : baseFilteredVendors.filter(v => v.occasion === filterOccasion)
  )

  const allSharedVendors = vendors.filter(v => v.is_shared)
  const allMyVendors = vendors.filter(v => !v.is_shared)

  const myPrivateTotal = allMyVendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0)
  const mySharedTotal = allSharedVendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_chosson / 100), 0)
  const myTotalResponsibility = myPrivateTotal + mySharedTotal
  const myTotalPaid = vendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === myFamilyName && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const myStillOwe = Math.max(0, myTotalResponsibility - myTotalPaid)

  const sharedTotal = allSharedVendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0)
  const chossonShare = allSharedVendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_chosson / 100), 0)
  const kallaShare = allSharedVendors.reduce((s, v) => s + (getVendorRevisedTotal(v) * v.split_kallah / 100), 0)
  const paidByChosson = allSharedVendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === chossonName && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const paidByKalla = allSharedVendors.reduce((sum, v) => sum + (payments[v.id] || []).filter(p => p.paid_by === kallaName && p.is_paid).reduce((s, p) => s + p.amount, 0), 0)
  const chossonBalance = paidByChosson - chossonShare
  const kallaBalance = paidByKalla - kallaShare

  const occasionTotals = allOccasions.map(occ => {
    const occVendors = vendors.filter(v => v.occasion === occ)
    const total = occVendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0)
    return { occ, total, count: occVendors.length }
  }).filter(x => x.total > 0)

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
              <button onClick={() => setSetupForm(p => ({ ...p, my_side: 'chosson' }))} className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${setupForm.my_side === 'chosson' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600'}`}>Chosson's Side</button>
              <button onClick={() => setSetupForm(p => ({ ...p, my_side: 'kallah' }))} className={`py-3 rounded-lg border-2 font-semibold text-sm transition-all ${setupForm.my_side === 'kallah' ? 'border-blue-900 bg-blue-900 text-white' : 'border-gray-200 text-gray-600'}`}>Kallah's Side</button>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Your Family Name</label>
            <input placeholder="e.g. Weiss" value={setupForm.my_family_name} onChange={e => setSetupForm(p => ({ ...p, my_family_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Other Family's Name</label>
            <input placeholder="e.g. Schwartz" value={setupForm.other_family_name} onChange={e => setSetupForm(p => ({ ...p, other_family_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Wedding Name (optional)</label>
            <input placeholder="e.g. Weiss-Schwartz Wedding" value={setupForm.wedding_name} onChange={e => setSetupForm(p => ({ ...p, wedding_name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Wedding Date (optional)</label>
            <input type="date" value={setupForm.wedding_date} onChange={e => setSetupForm(p => ({ ...p, wedding_date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={saveFamilySettings} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800">Get Started</button>
        </div>
      </div>
    </div>
  )

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
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-[#b8c0d4] text-sm hidden sm:inline">{myFamilyName} · {familySettings?.my_side === 'chosson' ? "Chosson's Side" : "Kallah's Side"}</span>

          <button onClick={() => exportPDF('shared')} className="bg-white text-[#141d33] px-3 py-2 rounded-md text-sm font-semibold hover:bg-[#f0ebe0] transition-colors">📄 Shared Report</button>
          <button onClick={() => exportPDF('full')} className="bg-[#C9A227] text-[#141d33] px-3 py-2 rounded-md text-sm font-semibold hover:bg-[#dab53a] transition-colors">📄 My Full Report</button>
        </div>
      </div>

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold">
          {successMessage}
        </div>
      )}

      {/* Vendor delete confirmation modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Delete Vendor?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{vendorToDelete.name}</span>? This will also delete all payments associated with it. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setVendorToDelete(null)} className="flex-1 border py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDeleteVendor} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-8 py-10">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
          <span>Expense Tracker 💰</span>
          <a
            href="/help#expense-tracker"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get help with the Expense Tracker"
            title="Get help with the Expense Tracker"
            className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-[#C9A227] text-[#141d33] text-sm font-bold leading-none hover:opacity-80 hover:scale-110 transition-all"
          >
            ?
          </a>
        </h2>
        <p className="text-gray-500 mb-6">Track all your simcha expenses</p>

        {/* Read-only banner — edit access expired (1-year window passed, or trial ended) */}
        {(access?.state === 'expired' || access?.state === 'trial_expired') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-yellow-800">
                ⏰ {access.state === 'trial_expired'
                  ? (isSideB ? 'Free trial has ended' : 'Your free trial has ended')
                  : (isSideB ? 'Edit access has expired' : 'Your edit access has expired')}
              </p>
              <p className="text-yellow-700 text-sm">
                {access.state === 'trial_expired'
                  ? (isSideB
                      ? "The wedding owner's free trial has ended. Ask them to activate to make changes again."
                      : "You're viewing this expense tracker in read-only mode. Activate for $99 to add or edit expenses.")
                  : (isSideB
                      ? "You're viewing this expense tracker in read-only mode. Ask the wedding owner to renew to make changes again."
                      : "You're viewing this expense tracker in read-only mode. Renew to add or edit expenses.")}
              </p>
            </div>
            {!isSideB && (
              <a
                href={access.state === 'trial_expired' ? '/pricing' : '/renew'}
                className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 whitespace-nowrap text-center"
              >
                {access.state === 'trial_expired' ? 'Activate for $99' : 'Renew Now'}
              </a>
            )}
          </div>
        )}

        {/* Revoked Side B banner */}
        {isRevoked && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
            <h3 className="font-bold text-red-700 mb-1">⚠️ Your access has been revoked</h3>
            <p className="text-red-600 text-sm mb-4">The other family has revoked your shared access. You can still view your own private expenses below, but you cannot add or edit anything. To regain full access, contact the other family or get your own SimchaPro account.</p>
            <a href="/pricing" className="inline-block bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">Get Full Access — $99</a>
          </div>
        )}

        {/* Invite Side B Panel — always manageable by Side A, even with expired edit access */}
        {!isSideB && <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-900">👨‍👩‍👧 Other Family Access</h3>
            {existingInvite && (
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${existingInvite.status === 'accepted' ? 'bg-green-100 text-green-700' : existingInvite.status === 'revoked' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                {existingInvite.status === 'accepted' ? '✓ Connected' : existingInvite.status === 'revoked' ? 'Revoked' : '⏳ Pending'}
              </span>
            )}
          </div>
          {!existingInvite && (
            <>
              <p className="text-sm text-gray-500 mb-3">Invite the other family to view and add shared expenses.</p>
              {!showInviteForm ? (
                <button onClick={() => setShowInviteForm(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Invite Other Family</button>
              ) : (
                <div className="flex gap-2">
                  <input type="email" placeholder="Their email address" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={sendInvite} disabled={inviteStatus === 'sending'} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                    {inviteStatus === 'sending' ? 'Sending...' : 'Send Invite'}
                  </button>
                  <button onClick={() => setShowInviteForm(false)} className="border px-3 py-2 rounded-lg text-sm text-gray-600">Cancel</button>
                </div>
              )}
              {inviteStatus === 'sent' && <p className="text-green-600 text-sm mt-2">✓ Invitation sent!</p>}
              {inviteStatus === 'error' && <p className="text-red-500 text-sm mt-2">Something went wrong. Please try again.</p>}
            </>
          )}
          {existingInvite && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Invited: <span className="font-semibold">{existingInvite.invited_email}</span></p>
              <div className="flex gap-2 flex-wrap">
                {existingInvite.status === 'revoked' && (
                  <>
                    <button onClick={reinstateInvite} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">Reinstate Access</button>
                    <button onClick={() => { setExistingInvite(null); setInviteEmail(''); setInviteStatus('') }} className="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800">Send New Invite</button>
                  </>
                )}
                {existingInvite.status !== 'revoked' && (
                  <button onClick={revokeInvite} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600">Revoke Access</button>
                )}
              </div>
            </div>
          )}
        </div>}

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setTab('my')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'my' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>My Expenses</button>
          {!isRevoked && <button onClick={() => setTab('shared')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'shared' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>Shared Expenses</button>}
          {!isRevoked && <button onClick={async () => { setTab('checks'); await loadAllPayments(vendors) }} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'checks' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>📋 Check Tracker</button>}
          {!isRevoked && <button onClick={() => setTab('breakdown')} className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${tab === 'breakdown' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-blue-900 border-blue-900 hover:bg-blue-50'}`}>📊 Breakdown</button>}
        </div>

        {tab === 'checks' && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold text-blue-900 mb-4">All Post-Dated Checks</h3>
            {allChecks.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No checks recorded yet.</p>}
            {allChecks.map(c => (
              <div key={c.id} className={`flex items-center justify-between py-3 border-b text-sm ${isPaymentDueSoon(c.check_date, false) ? 'bg-red-50 px-3 rounded-lg' : ''}`}>
                <div>
                  <p className="font-bold text-gray-800">{c.vendorName}</p>
                  <p className="text-xs text-gray-400">{c.paid_by} · ${c.amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-900">📅 {c.check_date ? new Date(c.check_date + 'T00:00:00').toLocaleDateString('en-US') : 'No date'}</p>
                  {isPaymentDueSoon(c.check_date, false) && <p className="text-xs text-red-600 font-semibold">⚠️ Coming up soon!</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'breakdown' && (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="font-bold text-blue-900 mb-6">Expense Breakdown by "For"</h3>
            {occasionTotals.length === 0 && <p className="text-gray-400 text-sm text-center py-8">No expenses yet.</p>}
            <div className="space-y-3">
              {occasionTotals.map(({ occ, total, count }) => (
                <div key={occ} className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-semibold text-gray-800">{occ}</p>
                    <p className="text-xs text-gray-400">{count} vendor{count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-900">${total.toLocaleString()}</p>
                    <button onClick={() => { setTab('my'); setFilterOccasion(occ) }} className="text-xs text-blue-600 hover:underline">View expenses →</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between">
              <span className="font-bold text-gray-700">Total All Expenses</span>
              <span className="font-bold text-blue-900">${vendors.reduce((s, v) => s + getVendorRevisedTotal(v), 0).toLocaleString()}</span>
            </div>
          </div>
        )}

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
              <div className="bg-blue-900 h-2 rounded-full" style={{ width: `${myTotalResponsibility > 0 ? (myTotalPaid / myTotalResponsibility) * 100 : 0}%` }}></div>
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
            {(paidByChosson > chossonShare || paidByKalla > kallaShare) && (
              <div className={`rounded-lg px-4 py-3 text-sm text-center font-semibold ${chossonBalance > 0 || kallaBalance > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {chossonBalance > 0 ? `${kallaName} owes ${chossonName} $${Math.abs(chossonBalance).toLocaleString()}` : kallaBalance > 0 ? `${chossonName} owes ${kallaName} $${Math.abs(kallaBalance).toLocaleString()}` : 'All settled'}
              </div>
            )}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-900 h-2 rounded-full" style={{ width: `${sharedTotal > 0 ? ((paidByChosson + paidByKalla) / sharedTotal) * 100 : 0}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{sharedTotal > 0 ? Math.round(((paidByChosson + paidByKalla) / sharedTotal) * 100) : 0}% paid</p>
          </div>
        )}

        {(tab === 'my' || tab === 'shared') && (
          <>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-blue-900">{filteredVendors.length} {tab === 'my' ? 'Private' : 'Shared'} Expenses</h3>
              <div className="flex gap-2 items-center flex-wrap">
                <select value={filterOccasion} onChange={e => setFilterOccasion(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="All">All Occasions</option>
                  {allOccasions.map(o => <option key={o}>{o}</option>)}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="name">Sort: Name</option>
                  <option value="price">Sort: Price</option>
                  <option value="status">Sort: Status</option>
                  <option value="category">Sort: Category</option>
                  <option value="occasion">Sort: For</option>
                </select>
                {!isRevoked && canEdit && <button onClick={() => setShowAddVendor(true)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">+ Add Vendor</button>}
              </div>
            </div>

            {showAddVendor && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto overflow-x-hidden">
                <div className="flex items-start justify-center min-h-full py-4 px-2">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl overflow-x-hidden">
                    <h3 className="text-xl font-bold text-blue-900 mb-6">Add Vendor</h3>
                    <div className="space-y-3">
                      <input placeholder="Vendor name *" value={newVendor.name} onChange={e => setNewVendor(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Category *</label>
                        <div className="flex gap-2">
                          <select value={newVendor.category} onChange={e => setNewVendor(p => ({ ...p, category: e.target.value }))} className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select category...</option>
                            {allCategories.map(c => <option key={c}>{c}</option>)}
                          </select>
                          <button onClick={() => setShowAddCategory(!showAddCategory)} className="shrink-0 text-blue-600 text-xs border border-blue-300 px-2 rounded-lg hover:bg-blue-50">+ New</button>
                        </div>
                        {showAddCategory && (
                          <div className="flex gap-2 mt-2">
                            <input placeholder="New category name" value={newCustomCategory} onChange={e => setNewCustomCategory(e.target.value)} className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={addCustomCategory} className="shrink-0 bg-blue-900 text-white px-3 py-1 rounded-lg text-sm">Add</button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">For *</label>
                        <div className="flex gap-2">
                          <select value={newVendor.occasion} onChange={e => setNewVendor(p => ({ ...p, occasion: e.target.value }))} className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select occasion...</option>
                            {allOccasions.map(o => <option key={o}>{o}</option>)}
                          </select>
                          <button onClick={() => setShowAddOccasion(!showAddOccasion)} className="shrink-0 text-blue-600 text-xs border border-blue-300 px-2 rounded-lg hover:bg-blue-50">+ New</button>
                        </div>
                        {showAddOccasion && (
                          <div className="flex gap-2 mt-2">
                            <input placeholder="New occasion name" value={newCustomOccasion} onChange={e => setNewCustomOccasion(e.target.value)} className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            <button onClick={addCustomOccasion} className="shrink-0 bg-blue-900 text-white px-3 py-1 rounded-lg text-sm">Add</button>
                          </div>
                        )}
                      </div>
                      <input placeholder="Total contracted price *" type="number" value={newVendor.total_amount} onChange={e => setNewVendor(p => ({ ...p, total_amount: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input placeholder="Vendor phone" value={newVendor.vendor_phone} onChange={e => setNewVendor(p => ({ ...p, vendor_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input placeholder="Contact name" value={newVendor.vendor_contact} onChange={e => setNewVendor(p => ({ ...p, vendor_contact: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <textarea placeholder="Notes (optional)" value={newVendor.notes} onChange={e => setNewVendor(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
                      <div className="border rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expense Type *</p>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={newVendor.is_my_expense} onChange={e => setNewVendor(p => ({ ...p, is_my_expense: e.target.checked, is_shared_expense: e.target.checked ? false : p.is_shared_expense }))} className="accent-blue-900" />
                          My Expense
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={newVendor.is_shared_expense} onChange={e => setNewVendor(p => ({ ...p, is_shared_expense: e.target.checked, is_my_expense: e.target.checked ? false : p.is_my_expense }))} className="accent-blue-900" />
                          Shared Expense
                        </label>
                      </div>
                      {newVendor.is_shared_expense && (
                        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                          <p className="text-sm font-semibold text-blue-900">Split %</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="min-w-0">
                              <label className="text-xs text-gray-500">{chossonName} %</label>
                              <input type="number" value={newVendor.split_chosson} onChange={e => setNewVendor(p => ({ ...p, split_chosson: parseFloat(e.target.value), split_kallah: 100 - parseFloat(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <label className="text-xs text-gray-500">{kallaName} %</label>
                              <input type="number" value={newVendor.split_kallah} onChange={e => setNewVendor(p => ({ ...p, split_kallah: parseFloat(e.target.value), split_chosson: 100 - parseFloat(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3 border">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment (optional)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input placeholder="Amount" type="number" value={newVendor.payment_amount} onChange={e => setNewVendor(p => ({ ...p, payment_amount: e.target.value }))} className="min-w-0 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          <select value={newVendor.payment_paid_by || ''} onChange={e => setNewVendor(p => ({ ...p, payment_paid_by: e.target.value }))} className="min-w-0 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Who Paid? *</option>
                            <option>{chossonName}</option>
                            <option>{kallaName}</option>
                          </select>
                          <select value={newVendor.payment_method} onChange={e => setNewVendor(p => ({ ...p, payment_method: e.target.value }))} className="min-w-0 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="min-w-0">
                            <label className="text-xs text-gray-500 block mb-1">Due date</label>
                            <input type="date" value={newVendor.payment_due_date} onChange={e => setNewVendor(p => ({ ...p, payment_due_date: e.target.value }))} className="w-full min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <label className="text-xs text-gray-500 block mb-1">Date paid</label>
                            <input type="date" value={newVendor.payment_paid_date} onChange={e => setNewVendor(p => ({ ...p, payment_paid_date: e.target.value }))} className="w-full min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        </div>
                        {newVendor.payment_method === 'Check' && (
                          <div className="min-w-0">
                            <label className="text-xs text-gray-500 block mb-1">Check date</label>
                            <input type="date" value={newVendor.payment_check_date} onChange={e => setNewVendor(p => ({ ...p, payment_check_date: e.target.value }))} className="w-full min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button onClick={addVendor} className="flex-1 bg-blue-900 text-white py-2 rounded-lg font-semibold">Add Vendor</button>
                      <button onClick={() => setShowAddVendor(false)} className="flex-1 border py-2 rounded-lg text-gray-600">Cancel</button>
                    </div>
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
                const vendorNotes = notes[vendor.id] || []

                return (
                  <div key={vendor.id} className={`bg-white rounded-2xl border shadow-sm ${hasDueSoon ? 'border-red-300' : ''}`}>
                    <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 rounded-2xl" onClick={() => !isEditing && toggleExpand(vendor.id)}>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-gray-800">{vendor.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(vendor.status)}`}>{vendor.status}</span>
                          {vendor.occasion && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{vendor.occasion}</span>}
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
                        {/* Entered by tag */}
                        {vendor.is_shared && (
                          <p className="text-xs text-gray-400 mb-1">
                            Entered by: <span className="font-semibold text-blue-800">
                              {vendor.entered_by_user_id === user.id ? `${myFamilyName} (you)` : familySettings?.other_family_name}
                            </span>
                          </p>
                        )}

                        {isEditing ? (
                          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-bold text-blue-900">Edit Vendor</p>
                            <input value={editingVendor.name} onChange={e => setEditingVendor(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Vendor name" />
                            <input value={editingVendor.total_amount} type="number" onChange={e => setEditingVendor(p => ({ ...p, total_amount: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Total contracted price" />
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Category</label>
                              <select value={editingVendor.category} onChange={e => setEditingVendor(p => ({ ...p, category: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {allCategories.map(c => <option key={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">For</label>
                              <select value={editingVendor.occasion || 'General'} onChange={e => setEditingVendor(p => ({ ...p, occasion: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {allOccasions.map(o => <option key={o}>{o}</option>)}
                              </select>
                            </div>
                            <input value={editingVendor.vendor_phone || ''} onChange={e => setEditingVendor(p => ({ ...p, vendor_phone: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Phone" />
                            <input value={editingVendor.vendor_contact || ''} onChange={e => setEditingVendor(p => ({ ...p, vendor_contact: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contact name" />
                            <textarea value={editingVendor.notes || ''} onChange={e => setEditingVendor(p => ({ ...p, notes: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Notes" />
                            <div className="border rounded-lg p-3 space-y-2 bg-white">
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Expense Type</p>
                              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="edit_expense_type" checked={!editingVendor.is_shared} onChange={() => setEditingVendor(p => ({ ...p, is_shared: false }))} className="accent-blue-900" />
                                My Expense (Private)
                              </label>
                              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="edit_expense_type" checked={!!editingVendor.is_shared} onChange={() => setEditingVendor(p => ({ ...p, is_shared: true }))} className="accent-blue-900" />
                                Shared Expense
                              </label>
                            </div>
                            {editingVendor.is_shared && (
                              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                                <p className="text-sm font-semibold text-blue-900">Split %</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs text-gray-500">{chossonName} %</label>
                                    <input type="number" value={editingVendor.split_chosson} onChange={e => setEditingVendor(p => ({ ...p, split_chosson: parseFloat(e.target.value), split_kallah: 100 - parseFloat(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500">{kallaName} %</label>
                                    <input type="number" value={editingVendor.split_kallah} onChange={e => setEditingVendor(p => ({ ...p, split_kallah: parseFloat(e.target.value), split_chosson: 100 - parseFloat(e.target.value) }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button onClick={() => updateVendor(editingVendor)} className="flex-1 bg-blue-900 text-white py-2 rounded-lg text-sm font-semibold">Save</button>
                              <button onClick={() => setEditingVendor(null)} className="flex-1 border py-2 rounded-lg text-sm text-gray-600">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          canEdit && (!isSideB || vendor.entered_by_user_id === user.id) ? (
                            <button onClick={e => { e.stopPropagation(); setEditingVendor({ ...vendor }) }} className="text-blue-600 text-xs hover:underline">✏️ Edit vendor info</button>
                          ) : isSideB && vendor.entered_by_user_id !== user.id ? (
                            <p className="text-xs text-gray-400">✏️ Entered by the other family</p>
                          ) : null
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

                        {/* Notes Section */}
                        <div>
                          <p className="text-sm font-bold text-blue-900 mb-2">Notes</p>
                          {vendorNotes.length === 0 && <p className="text-xs text-gray-400 mb-2">No notes yet.</p>}
                          {vendorNotes.map(n => (
                            <div key={n.id} className="py-2 border-b">
                              {editingNote?.id === n.id ? (
                                <div className="flex gap-2 items-center">
                                  <input value={editingNote.comment} onChange={e => setEditingNote(x => ({ ...x, comment: e.target.value }))} className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                  <button onClick={() => updateNote(n)} className="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Save</button>
                                  <button onClick={() => setEditingNote(null)} className="border px-3 py-1.5 rounded-lg text-xs text-gray-600">Cancel</button>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm text-gray-700 flex-1">📝 {n.comment}</p>
                                  {canEdit && (
                                    <div className="flex gap-2 shrink-0">
                                      <button onClick={() => setEditingNote({ ...n })} className="text-blue-500 text-xs hover:underline">✏️</button>
                                      <button onClick={() => deleteNote(n.id, vendor.id)} className="text-red-400 text-xs hover:text-red-600">🗑️</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {canEdit && (
                            <div className="flex gap-2 mt-2">
                              <input placeholder="Add a note..." value={newNote[vendor.id] || ''} onChange={e => setNewNote(p => ({ ...p, [vendor.id]: e.target.value }))} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <button onClick={() => addNote(vendor.id)} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800">Add</button>
                            </div>
                          )}
                        </div>

                        {/* Payments Section */}
                        <div>
                          <p className="text-sm font-bold text-blue-900 mb-2">Payments</p>
                          {regularPayments.length === 0 && <p className="text-xs text-gray-400 mb-2">No payments yet.</p>}
                          {regularPayments.map(p => (
                            <div key={p.id}>
                              {editingPayment?.id === p.id ? (
                                <div className="bg-blue-50 rounded-lg p-3 space-y-2 mb-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input type="number" value={editingPayment.amount} onChange={e => setEditingPayment(x => ({ ...x, amount: e.target.value }))} className="border rounded px-2 py-1 text-sm" placeholder="Amount" />
                                    <select value={editingPayment.paid_by} onChange={e => setEditingPayment(x => ({ ...x, paid_by: e.target.value }))} className="border rounded px-2 py-1 text-sm">
                                      <option value="">Who paid?</option>
                                      <option>{chossonName}</option>
                                      <option>{kallaName}</option>
                                    </select>
                                    <select value={editingPayment.payment_method} onChange={e => setEditingPayment(x => ({ ...x, payment_method: e.target.value }))} className="border rounded px-2 py-1 text-sm">
                                      {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                    <input type="date" value={editingPayment.paid_date || ''} onChange={e => setEditingPayment(x => ({ ...x, paid_date: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                                    <input type="date" value={editingPayment.due_date || ''} onChange={e => setEditingPayment(x => ({ ...x, due_date: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                                    {editingPayment.payment_method === 'Check' && (
                                      <input type="date" value={editingPayment.check_date || ''} onChange={e => setEditingPayment(x => ({ ...x, check_date: e.target.value }))} className="border rounded px-2 py-1 text-sm" />
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => updatePayment(editingPayment)} className="flex-1 bg-blue-900 text-white py-1 rounded text-sm font-semibold">Save</button>
                                    <button onClick={() => setEditingPayment(null)} className="flex-1 border py-1 rounded text-sm">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <div className={`flex items-center justify-between text-sm py-2 border-b ${isPaymentDueSoon(p.due_date, p.is_paid) ? 'text-red-600' : ''}`}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold">${p.amount.toLocaleString()}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getPaymentTypeColor(p.payment_type)}`}>{p.payment_type}</span>
                                    {p.is_check && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Check{p.check_date ? ` (${new Date(p.check_date + 'T00:00:00').toLocaleDateString('en-US')})` : ''}</span>}
                                    {p.paid_by && <span className="text-xs text-gray-400">by {p.paid_by}</span>}
                                    {p.payment_method && <span className="text-xs text-gray-400">· {p.payment_method}</span>}
                                    {canEdit && (
                                      <>
                                        <button onClick={() => setEditingPayment({ ...p })} className="text-blue-500 text-xs hover:underline">✏️</button>
                                        <button onClick={() => deletePayment(p.id, vendor.id)} className="text-red-400 text-xs hover:text-red-600">🗑️</button>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-right text-xs">
                                    {p.due_date && <p className="text-gray-400">Due: {new Date(p.due_date + 'T00:00:00').toLocaleDateString('en-US')}</p>}
                                    {p.paid_date && <span className="text-green-600 font-semibold">✓ Paid {new Date(p.paid_date + 'T00:00:00').toLocaleDateString('en-US')}</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {canEdit && (
                            <div className="mt-3 bg-gray-50 rounded-lg p-4 space-y-3">
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Add Payment</p>
                              <div className="grid grid-cols-2 gap-2">
                                <input placeholder="Amount *" type="number" value={newPayment[vendor.id]?.amount || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], amount: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <select value={newPayment[vendor.id]?.paid_by || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], paid_by: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  <option value="">Who Paid? *</option>
                                  <option>{chossonName}</option>
                                  <option>{kallaName}</option>
                                </select>
                                <select value={newPayment[vendor.id]?.payment_method || 'Cash'} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], payment_method: e.target.value } }))} className="border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                                </select>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Due date (optional)</label>
                                  <input type="date" value={newPayment[vendor.id]?.due_date || ''} onChange={e => setNewPayment(p => ({ ...p, [vendor.id]: { ...p[vendor.id], due_date: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Date paid (optional)</label>
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
                          )}
                        </div>

                        {/* Additional Charges */}
                        <div>
                          <p className="text-sm font-bold text-blue-900 mb-2">Additional Charges {addonTotal > 0 && <span className="text-purple-600 font-normal text-xs ml-1">+${addonTotal.toLocaleString()} total</span>}</p>
                          {addons.length === 0 && <p className="text-xs text-gray-400 mb-2">No additional charges yet.</p>}
                          {addons.map(p => (
                            <div key={p.id} className="flex items-center justify-between text-sm py-2 border-b">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">${p.amount.toLocaleString()}</span>
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Add-on</span>
                                {p.description && <span className="text-xs text-gray-500">{p.description}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 text-xs font-semibold">✓ Recorded</span>
                                {canEdit && (
                                  <button onClick={() => deletePayment(p.id, vendor.id)} className="text-red-400 text-xs hover:text-red-600">🗑️</button>
                                )}
                              </div>
                            </div>
                          ))}
                          {canEdit && (
                            <div className="mt-3 bg-purple-50 rounded-lg p-4 space-y-3">
                              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Add Additional Charge</p>
                              <input placeholder="Description * (e.g. Extra hour overtime)" value={newAddon[vendor.id]?.description || ''} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], description: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <input placeholder="Amount *" type="number" value={newAddon[vendor.id]?.amount || ''} onChange={e => setNewAddon(p => ({ ...p, [vendor.id]: { ...p[vendor.id], amount: e.target.value } }))} className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                              <button onClick={() => addAddon(vendor)} className="bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-800 w-full">Add Charge</button>
                            </div>
                          )}
                        </div>

                        {canEdit && (!isSideB || vendor.entered_by_user_id === user.id) && (
                          <button onClick={() => setVendorToDelete(vendor)} className="text-red-400 hover:text-red-600 text-xs">Delete vendor</button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}