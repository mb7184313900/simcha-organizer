'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '../../../../components/Footer'
import Link from 'next/link'
import MagazineAdminNav from '../../../../components/MagazineAdminNav'
import VendorTile from '../../../../components/VendorTile'
import VendorDetailView from '../../../../components/VendorDetailView'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

function resolveCategoryName(vendor) {
  if (vendor.category_id) {
    return vendor.vendor_categories?.name || 'No category'
  }
  return vendor.custom_category_text || 'No category'
}

function couponSummary(text, expiration) {
  if (!text) return ''
  return expiration ? `${text} (expires ${expiration})` : text
}

// Builds the list of fields that differ between the live vendor row and a
// pending edit request against it, for the admin's side-by-side comparison.
function buildVendorDiff(original, pending) {
  if (!original) return []

  const rows = []
  const addRow = (label, currentVal, requestedVal, isImage = false) => {
    const currentNorm = (currentVal ?? '').toString().trim()
    const requestedNorm = (requestedVal ?? '').toString().trim()
    if (currentNorm === requestedNorm) return
    rows.push({ label, current: currentVal, requested: requestedVal, isImage })
  }

  addRow('Name', original.name, pending.name)
  addRow('Category', resolveCategoryName(original), resolveCategoryName(pending))
  addRow('Phone', original.phone, pending.phone)
  addRow('WhatsApp', original.whatsapp, pending.whatsapp)
  addRow('Website', original.website, pending.website)
  addRow('Instagram', original.instagram, pending.instagram)
  addRow('Blurb', original.blurb, pending.blurb)
  addRow('Location', original.location, pending.location)
  addRow('Logo', original.thumbnail_image_url, pending.thumbnail_image_url, true)
  addRow('Flyer', original.ad_image_url, pending.ad_image_url, true)
  addRow(
    'Regular Coupon',
    couponSummary(original.regular_coupon_text, original.regular_coupon_expiration),
    couponSummary(pending.regular_coupon_text, pending.regular_coupon_expiration)
  )
  addRow(
    'Exclusive Coupon',
    couponSummary(original.exclusive_coupon_text, original.exclusive_coupon_expiration),
    couponSummary(pending.exclusive_coupon_text, pending.exclusive_coupon_expiration)
  )

  return rows
}

function emptyForm() {
  return {
    id: null,
    name: '',
    category_id: '',
    phone: '',
    whatsapp: '',
    website: '',
    blurb: '',
    location: '',
    regular_coupon_text: '',
    regular_coupon_expiration: '',
    exclusive_coupon_text: '',
    exclusive_coupon_expiration: '',
    is_published: true,
    ad_image_url: '',
    thumbnail_image_url: '',
    admin_note: '',
    custom_category_text: '',
  }
}

export default function MagazineVendorsAdmin() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  const [categories, setCategories] = useState([])
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const [adImageFile, setAdImageFile] = useState(null)
  const [thumbImageFile, setThumbImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [filterCategoryId, setFilterCategoryId] = useState('all')
  const [vendorSortMode, setVendorSortMode] = useState('alphabetical')

  const [approvingId, setApprovingId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)

  // Custom-category assignment (pending vendors that submitted a category name
  // instead of picking one from the dropdown)
  const [categoryPromptVendorId, setCategoryPromptVendorId] = useState(null)
  const [categoryAssignments, setCategoryAssignments] = useState({})
  const [newCategoryNameByVendor, setNewCategoryNameByVendor] = useState({})
  const [assigningCategoryId, setAssigningCategoryId] = useState(null)

  const [previewVendorId, setPreviewVendorId] = useState(null)

  const router = useRouter()

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setAuthorized(true)
      setChecking(false)
      loadData()
    }
    checkAccess()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)

    const [{ data: categoryData, error: categoryError }, { data: vendorData, error: vendorError }, { data: settingsData }] = await Promise.all([
      supabase.from('vendor_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('magazine_vendors').select('*, vendor_categories(name)').order('created_at', { ascending: false }),
      supabase.from('magazine_settings').select('*').limit(1).maybeSingle(),
    ])

    if (categoryError || vendorError) {
      setErrorMsg('Failed to load data.')
    } else {
      setCategories(categoryData)
      setVendors(vendorData)
      if (settingsData?.vendor_sort_mode) {
        setVendorSortMode(settingsData.vendor_sort_mode)
      }
    }
    setLoading(false)
  }

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `vendors/${fileName}`

    const { error } = await supabase.storage
      .from('magazine-images')
      .upload(filePath, file)

    if (error) {
      throw error
    }

    const { data } = supabase.storage
      .from('magazine-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setErrorMsg('Vendor name is required.')
      return
    }

    const typedCustomCategory = form.category_id ? '' : form.custom_category_text.trim()

    if (!form.category_id && !typedCustomCategory) {
      setErrorMsg('Please choose a category.')
      return
    }

    setSaving(true)
    setErrorMsg(null)

    try {
      let resolvedCategoryId = form.category_id

      // Confirmed/edited custom category text: match it to an existing category
      // by name, or create a new one, then use that category going forward.
      if (!resolvedCategoryId && typedCustomCategory) {
        const existingMatch = categories.find(
          (c) => c.name.toLowerCase() === typedCustomCategory.toLowerCase()
        )

        if (existingMatch) {
          resolvedCategoryId = existingMatch.id
        } else {
          const nextSortOrder = categories.length > 0
            ? Math.max(...categories.map(c => c.sort_order || 0)) + 1
            : 1

          const { data: newCategory, error: categoryError } = await supabase
            .from('vendor_categories')
            .insert({ name: typedCustomCategory, sort_order: nextSortOrder })
            .select()
            .single()

          if (categoryError || !newCategory) {
            setErrorMsg('Failed to create the new category.')
            setSaving(false)
            return
          }
          resolvedCategoryId = newCategory.id
        }
      }

      let adImageUrl = form.ad_image_url
      let thumbImageUrl = form.thumbnail_image_url

      if (adImageFile || thumbImageFile) {
        setUploading(true)
        if (adImageFile) {
          adImageUrl = await uploadImage(adImageFile)
        }
        if (thumbImageFile) {
          thumbImageUrl = await uploadImage(thumbImageFile)
        }
        setUploading(false)
      }

      const payload = {
        name: form.name.trim(),
        category_id: resolvedCategoryId,
        custom_category_text: null,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        website: form.website.trim(),
        blurb: form.blurb.trim(),
        location: form.location.trim(),
        regular_coupon_text: form.regular_coupon_text.trim() || null,
        regular_coupon_expiration: form.regular_coupon_expiration || null,
        exclusive_coupon_text: form.exclusive_coupon_text.trim() || null,
        exclusive_coupon_expiration: form.exclusive_coupon_expiration || null,
        is_published: form.is_published,
        ad_image_url: adImageUrl,
        thumbnail_image_url: thumbImageUrl,
        admin_note: form.admin_note.trim(),
      }

      let error
      if (form.id) {
        // If either coupon's text or expiration actually changed, reset its
        // reminder flag so the cron job can notify the vendor again later.
        const originalVendor = vendors.find(v => v.id === form.id)
        if (originalVendor) {
          if (
            (originalVendor.regular_coupon_text || '') !== (payload.regular_coupon_text || '') ||
            (originalVendor.regular_coupon_expiration || '') !== (payload.regular_coupon_expiration || '')
          ) {
            payload.regular_coupon_reminder_sent = false
          }
          if (
            (originalVendor.exclusive_coupon_text || '') !== (payload.exclusive_coupon_text || '') ||
            (originalVendor.exclusive_coupon_expiration || '') !== (payload.exclusive_coupon_expiration || '')
          ) {
            payload.exclusive_coupon_reminder_sent = false
          }
        }

        const { error: updateError } = await supabase
          .from('magazine_vendors')
          .update(payload)
          .eq('id', form.id)
        error = updateError
      } else {
        // New vendors go to the end of their category's custom order
        const categoryVendors = vendors.filter(v => v.category_id === resolvedCategoryId)
        const nextSortOrder = categoryVendors.length > 0
          ? Math.max(...categoryVendors.map(v => v.sort_order || 0)) + 1
          : 1

        const { error: insertError } = await supabase
          .from('magazine_vendors')
          .insert({ ...payload, sort_order: nextSortOrder, status: 'active' })
        error = insertError
      }

      if (error) {
        setErrorMsg('Failed to save vendor.')
      } else {
        setForm(emptyForm())
        setAdImageFile(null)
        setThumbImageFile(null)
        loadData()
      }
    } catch (err) {
      setErrorMsg('Image upload failed. Please try again.')
      setUploading(false)
    }

    setSaving(false)
  }

  const startEdit = (vendor) => {
    setForm({
      id: vendor.id,
      name: vendor.name || '',
      category_id: vendor.category_id || '',
      phone: vendor.phone || '',
      whatsapp: vendor.whatsapp || '',
      website: vendor.website || '',
      blurb: vendor.blurb || '',
      location: vendor.location || '',
      regular_coupon_text: vendor.regular_coupon_text || '',
      regular_coupon_expiration: vendor.regular_coupon_expiration || '',
      exclusive_coupon_text: vendor.exclusive_coupon_text || '',
      exclusive_coupon_expiration: vendor.exclusive_coupon_expiration || '',
      is_published: vendor.is_published,
      ad_image_url: vendor.ad_image_url || '',
      thumbnail_image_url: vendor.thumbnail_image_url || '',
      admin_note: vendor.admin_note || '',
      custom_category_text: vendor.custom_category_text || '',
    })
    setAdImageFile(null)
    setThumbImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setForm(emptyForm())
    setAdImageFile(null)
    setThumbImageFile(null)
  }

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete vendor "${name}"? This cannot be undone.`)
    if (!confirmed) return

    setErrorMsg(null)

    const { error } = await supabase
      .from('magazine_vendors')
      .delete()
      .eq('id', id)

    if (error) {
      setErrorMsg('Failed to delete vendor.')
    } else {
      loadData()
    }
  }

  const handleApprove = async (id, name) => {
    setErrorMsg(null)
    setApprovingId(id)

    try {
      const res = await fetch('/api/admin/magazine/vendors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const result = await res.json()

      if (!res.ok) {
        setErrorMsg(result.error || `Failed to approve "${name}".`)
      } else {
        loadData()
      }
    } catch (err) {
      setErrorMsg(`Failed to approve "${name}".`)
    }

    setApprovingId(null)
  }

  // Edit requests overwrite the original vendor row instead of flipping status
  // on the pending row itself; handled server-side so the confirmation email
  // can be sent via Resend, same pattern as handleApprove/handleReject.
  const handleApproveEditRequest = async (vendor) => {
    setErrorMsg(null)
    setApprovingId(vendor.id)

    try {
      const res = await fetch('/api/admin/magazine/vendors/approve-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendor.id }),
      })

      const result = await res.json()

      if (!res.ok) {
        setErrorMsg(result.error || `Failed to approve edit request for "${vendor.name}".`)
      } else {
        loadData()
      }
    } catch (err) {
      setErrorMsg(`Failed to approve edit request for "${vendor.name}".`)
    }

    setApprovingId(null)
  }

  const finalizeApproval = (vendor) => {
    return vendor.edit_of_vendor_id
      ? handleApproveEditRequest(vendor)
      : handleApprove(vendor.id, vendor.name)
  }

  // Vendors that already picked a real category go straight through; vendors
  // that typed a custom category name need it resolved to a real category first.
  const handleApproveClick = (vendor) => {
    if (!vendor.category_id && vendor.custom_category_text) {
      setCategoryPromptVendorId(vendor.id)
      return
    }
    finalizeApproval(vendor)
  }

  const handleAssignExistingCategory = async (vendor) => {
    const selectedCategoryId = categoryAssignments[vendor.id]
    if (!selectedCategoryId) {
      setErrorMsg('Please choose a category to assign.')
      return
    }

    setErrorMsg(null)
    setAssigningCategoryId(vendor.id)

    const { error } = await supabase
      .from('magazine_vendors')
      .update({ category_id: selectedCategoryId, custom_category_text: null })
      .eq('id', vendor.id)

    setAssigningCategoryId(null)

    if (error) {
      setErrorMsg(`Failed to assign a category for "${vendor.name}".`)
      return
    }

    setCategoryPromptVendorId(null)
    await finalizeApproval(vendor)
  }

  const handleCreateCategoryAndApprove = async (vendor) => {
    const categoryName = (newCategoryNameByVendor[vendor.id] ?? vendor.custom_category_text ?? '').trim()

    if (!categoryName) {
      setErrorMsg('Please enter a category name.')
      return
    }

    setErrorMsg(null)
    setAssigningCategoryId(vendor.id)

    const nextSortOrder = categories.length > 0
      ? Math.max(...categories.map(c => c.sort_order || 0)) + 1
      : 1

    const { data: newCategory, error: categoryError } = await supabase
      .from('vendor_categories')
      .insert({ name: categoryName, sort_order: nextSortOrder })
      .select()
      .single()

    if (categoryError || !newCategory) {
      setErrorMsg(`Failed to create category for "${vendor.name}".`)
      setAssigningCategoryId(null)
      return
    }

    const { error: updateError } = await supabase
      .from('magazine_vendors')
      .update({ category_id: newCategory.id, custom_category_text: null })
      .eq('id', vendor.id)

    setAssigningCategoryId(null)

    if (updateError) {
      setErrorMsg(`Failed to assign the new category for "${vendor.name}".`)
      return
    }

    setCategoryPromptVendorId(null)
    await finalizeApproval(vendor)
  }

  const handleReject = async (id, name) => {
    const reason = window.prompt(
      `Why is "${name}"'s listing being rejected? This reason will be included in the email sent to them.`
    )

    // Admin clicked Cancel, or left it blank
    if (reason === null) return
    if (!reason.trim()) {
      setErrorMsg('A rejection reason is required.')
      return
    }

    setErrorMsg(null)
    setRejectingId(id)

    try {
      const res = await fetch('/api/admin/magazine/vendors/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reason: reason.trim() }),
      })

      const result = await res.json()

      if (!res.ok) {
        setErrorMsg(result.error || `Failed to reject "${name}".`)
      } else {
        loadData()
      }
    } catch (err) {
      setErrorMsg(`Failed to reject "${name}".`)
    }

    setRejectingId(null)
  }

  const handleVendorSortModeChange = async (mode) => {
    setVendorSortMode(mode)
    setErrorMsg(null)

    const { data: settingsRow } = await supabase.from('magazine_settings').select('id').limit(1).maybeSingle()

    if (settingsRow) {
      await supabase
        .from('magazine_settings')
        .update({ vendor_sort_mode: mode, updated_at: new Date().toISOString() })
        .eq('id', settingsRow.id)
    }
  }

  const moveVendor = async (categoryVendorList, index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categoryVendorList.length) return

    const current = categoryVendorList[index]
    const target = categoryVendorList[targetIndex]

    const { error: error1 } = await supabase
      .from('magazine_vendors')
      .update({ sort_order: target.sort_order || 0 })
      .eq('id', current.id)

    const { error: error2 } = await supabase
      .from('magazine_vendors')
      .update({ sort_order: current.sort_order || 0 })
      .eq('id', target.id)

    if (error1 || error2) {
      setErrorMsg('Failed to reorder vendors.')
    } else {
      loadData()
    }
  }

  const pendingVendors = vendors.filter(v => v.status === 'pending')
  const nonPendingVendors = vendors.filter(v => v.status !== 'pending')

  // Filter vendors by selected category, then sort them for display
  const displayedVendors = () => {
    let list = filterCategoryId === 'all'
      ? [...nonPendingVendors]
      : nonPendingVendors.filter(v => v.category_id === filterCategoryId)

    if (vendorSortMode === 'alphabetical') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (vendorSortMode === 'newest') {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (vendorSortMode === 'custom') {
      list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }

    return list
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Checking access...</p>
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  const sortedVendors = displayedVendors()
  const canUseCustomArrows = vendorSortMode === 'custom' && filterCategoryId !== 'all'

  const previewVendor = previewVendorId ? vendors.find(v => v.id === previewVendorId) : null
  const previewDetailVendor = previewVendor && {
    ...previewVendor,
    vendor_categories: previewVendor.category_id
      ? previewVendor.vendor_categories
      : { name: previewVendor.custom_category_text || 'No category' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl font-serif text-[#141d33] mt-4 mb-2">Magazine Vendors</h1>
        <p className="text-gray-500 mb-8">
          Add and manage vendor ads shown in the Simcha Magazine Vendor Directory.
        </p>

        <MagazineAdminNav />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Pending Approval section */}
        {pendingVendors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-[#C9A227] mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#fdf7e7] rounded-t-lg">
              <h2 className="text-lg font-serif text-[#141d33]">
                Pending Approval ({pendingVendors.length})
              </h2>
            </div>
            <ul>
              {pendingVendors.map((vendor) => {
                const originalVendor = vendor.edit_of_vendor_id
                  ? vendors.find((v) => v.id === vendor.edit_of_vendor_id)
                  : null
                const diffRows = originalVendor ? buildVendorDiff(originalVendor, vendor) : []

                return (
                <li
                  key={vendor.id}
                  className="px-6 py-4 border-b border-gray-50 last:border-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex gap-2 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Logo</p>
                          {vendor.thumbnail_image_url ? (
                            <img
                              src={vendor.thumbnail_image_url}
                              alt={`${vendor.name} logo`}
                              className="w-12 h-12 rounded object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Flyer</p>
                          {vendor.ad_image_url ? (
                            <img
                              src={vendor.ad_image_url}
                              alt={`${vendor.name} flyer`}
                              className="w-12 h-12 rounded object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200" />
                          )}
                        </div>
                      </div>
                      <div className="min-w-0">
                        {vendor.edit_of_vendor_id && (
                          originalVendor ? (
                            <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1">
                              Edit Request for: {originalVendor.name}
                            </span>
                          ) : (
                            <span className="inline-block bg-red-100 text-red-700 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1">
                              Edit Request (original vendor not found)
                            </span>
                          )
                        )}
                        <p className="text-[#141d33] font-medium">{vendor.name}</p>
                        <p className="text-xs text-gray-500">
                          {vendor.category_id
                            ? (vendor.vendor_categories?.name || 'No category')
                            : vendor.custom_category_text
                              ? `Custom category: ${vendor.custom_category_text}`
                              : 'No category'}
                          {vendor.email && ` · ${vendor.email}`}
                        </p>
                        {vendor.location && (
                          <p className="text-xs text-gray-400 mt-1">📍 {vendor.location}</p>
                        )}
                        {vendor.regular_coupon_text && (
                          <p className="text-xs text-gray-500 mt-1">
                            Regular coupon: {vendor.regular_coupon_text}
                            {vendor.regular_coupon_expiration && ` (expires ${vendor.regular_coupon_expiration})`}
                          </p>
                        )}
                        {vendor.exclusive_coupon_text && (
                          <p className="text-xs text-gray-500 mt-1">
                            Exclusive coupon: {vendor.exclusive_coupon_text}
                            {vendor.exclusive_coupon_expiration && ` (expires ${vendor.exclusive_coupon_expiration})`}
                          </p>
                        )}
                        {vendor.vendor_note_to_admin && (
                          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                            <p className="text-xs text-blue-900">
                              <span className="font-semibold">Vendor's note:</span> {vendor.vendor_note_to_admin}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <button
                        onClick={() => setPreviewVendorId(vendor.id)}
                        className="text-sm text-gray-500 hover:text-[#141d33] hover:underline"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => startEdit(vendor)}
                        className="text-sm text-[#C9A227] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleApproveClick(vendor)}
                        disabled={approvingId === vendor.id}
                        className="text-sm bg-[#141d33] text-white px-3 py-1.5 rounded-md hover:bg-[#1e2b4d] disabled:opacity-50"
                      >
                        {approvingId === vendor.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(vendor.id, vendor.name)}
                        disabled={rejectingId === vendor.id}
                        className="text-sm text-red-500 hover:underline disabled:opacity-50"
                      >
                        {rejectingId === vendor.id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>

                  {categoryPromptVendorId === vendor.id && (
                    <div className="mt-3 bg-[#fdf7e7] border border-[#C9A227]/40 rounded-md p-3 space-y-2">
                      <p className="text-xs text-gray-600">
                        This vendor submitted a custom category (<strong>{vendor.custom_category_text}</strong>). Assign a real category before approving.
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={categoryAssignments[vendor.id] || ''}
                          onChange={(e) => setCategoryAssignments(prev => ({ ...prev, [vendor.id]: e.target.value }))}
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs"
                        >
                          <option value="">Assign to existing category...</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignExistingCategory(vendor)}
                          disabled={!categoryAssignments[vendor.id] || assigningCategoryId === vendor.id}
                          className="text-xs bg-[#141d33] text-white px-3 py-1.5 rounded-md hover:bg-[#1e2b4d] disabled:opacity-50"
                        >
                          {assigningCategoryId === vendor.id ? 'Assigning...' : 'Assign & Approve'}
                        </button>
                        <span className="text-xs text-gray-400">or</span>
                        <input
                          type="text"
                          value={newCategoryNameByVendor[vendor.id] ?? vendor.custom_category_text ?? ''}
                          onChange={(e) => setNewCategoryNameByVendor(prev => ({ ...prev, [vendor.id]: e.target.value }))}
                          placeholder="New category name"
                          className="border border-gray-300 rounded-md px-2 py-1.5 text-xs min-w-0"
                        />
                        <button
                          onClick={() => handleCreateCategoryAndApprove(vendor)}
                          disabled={assigningCategoryId === vendor.id || !(newCategoryNameByVendor[vendor.id] ?? vendor.custom_category_text ?? '').trim()}
                          className="text-xs border border-blue-300 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-50 disabled:opacity-50 shrink-0"
                        >
                          {assigningCategoryId === vendor.id ? 'Creating...' : 'Create & Approve'}
                        </button>
                        <button
                          onClick={() => setCategoryPromptVendorId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {originalVendor && diffRows.length > 0 && (
                    <div className="mt-3 border border-blue-200 rounded-md overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-blue-50 text-gray-500">
                            <th className="text-left px-3 py-2 font-medium">Field</th>
                            <th className="text-left px-3 py-2 font-medium">Current</th>
                            <th className="text-left px-3 py-2 font-medium">Requested</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diffRows.map((row) => (
                            <tr key={row.label} className="border-t border-gray-100">
                              <td className="px-3 py-2 text-gray-500 align-top whitespace-nowrap">{row.label}</td>
                              <td className="px-3 py-2 text-gray-700 align-top">
                                {row.isImage ? (
                                  row.current ? (
                                    <img src={row.current} alt="" className="w-12 h-12 object-cover rounded border border-gray-200" />
                                  ) : (
                                    <span className="text-gray-300 italic">None</span>
                                  )
                                ) : (
                                  row.current || <span className="text-gray-300 italic">Empty</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-blue-900 font-medium align-top">
                                {row.isImage ? (
                                  row.requested ? (
                                    <img src={row.requested} alt="" className="w-12 h-12 object-cover rounded border border-gray-200" />
                                  ) : (
                                    <span className="text-gray-300 italic">None</span>
                                  )
                                ) : (
                                  row.requested || <span className="text-gray-300 italic">Empty</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-serif text-[#141d33] mb-4">
            {form.id ? 'Edit Vendor' : 'Add New Vendor'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vendor Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Category *</label>
              <select
                value={form.category_id}
                onChange={(e) => updateField('category_id', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              >
                <option value="">Choose a category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {!form.category_id && form.custom_category_text && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-500 mb-1">
                    This vendor submitted a custom category. Confirm or edit the name below — it will be matched to an existing category of this name, or created as new, when you save.
                  </label>
                  <input
                    type="text"
                    value={form.custom_category_text}
                    onChange={(e) => updateField('custom_category_text', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="e.g. (718) 555-1234"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="e.g. 17185551234 (no dashes or symbols)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Website</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Blurb / Description (optional)</label>
              <textarea
                value={form.blurb}
                onChange={(e) => updateField('blurb', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Boro Park, Lakewood"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Regular Coupon (visible to everyone)</p>
              <input
                type="text"
                value={form.regular_coupon_text}
                onChange={(e) => updateField('regular_coupon_text', e.target.value)}
                placeholder="Coupon text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Expiration date (optional)</label>
                <input
                  type="date"
                  value={form.regular_coupon_expiration}
                  onChange={(e) => updateField('regular_coupon_expiration', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Exclusive Coupon (visible to paid SimchaPro members only)</p>
              <input
                type="text"
                value={form.exclusive_coupon_text}
                onChange={(e) => updateField('exclusive_coupon_text', e.target.value)}
                placeholder="Coupon text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Expiration date (optional)</label>
                <input
                  type="date"
                  value={form.exclusive_coupon_expiration}
                  onChange={(e) => updateField('exclusive_coupon_expiration', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Flyer (shown on vendor's detail page)
              </label>
              {form.ad_image_url && (
                <img src={form.ad_image_url} alt="Current ad" className="h-24 rounded mb-2 border border-gray-200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAdImageFile(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Logo (shown on vendor's directory tile)
              </label>
              {form.thumbnail_image_url && (
                <img src={form.thumbnail_image_url} alt="Current thumbnail" className="h-24 rounded mb-2 border border-gray-200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbImageFile(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={(e) => updateField('is_published', e.target.checked)}
              />
              <label htmlFor="is_published" className="text-sm text-gray-600">
                Published (visible to users)
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Note to SimchaPro Admin — not shown publicly
              </label>
              <textarea
                value={form.admin_note}
                onChange={(e) => updateField('admin_note', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-[#141d33] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e2b4d] disabled:opacity-50"
              >
                {uploading ? 'Uploading images...' : saving ? 'Saving...' : form.id ? 'Save Changes' : 'Add Vendor'}
              </button>
              {form.id && (
                <button
                  onClick={cancelEdit}
                  className="text-gray-500 px-6 py-2 rounded-lg hover:text-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sort & filter controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-serif text-[#141d33] mb-4">Vendor Order</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Filter by Category</label>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Sort Vendors By</label>
              <select
                value={vendorSortMode}
                onChange={(e) => handleVendorSortModeChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              >
                <option value="alphabetical">Alphabetical (A-Z)</option>
                <option value="newest">Newest First</option>
                <option value="custom">Custom Order</option>
              </select>
            </div>
          </div>

          {vendorSortMode === 'custom' && filterCategoryId === 'all' && (
            <p className="text-xs text-gray-400 mt-3">
              Select a specific category above to reorder vendors within it.
            </p>
          )}
          {vendorSortMode === 'custom' && filterCategoryId !== 'all' && (
            <p className="text-xs text-gray-400 mt-3">
              Use the ↑ and ↓ buttons below to arrange vendors in your preferred order.
            </p>
          )}
        </div>

        {/* Vendor list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-serif text-[#141d33]">
              Current Vendors ({sortedVendors.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-400 italic p-6">Loading vendors...</p>
          ) : sortedVendors.length === 0 ? (
            <p className="text-gray-400 italic p-6">No vendors yet. Add one above.</p>
          ) : (
            <ul>
              {sortedVendors.map((vendor, index) => (
                <li
                  key={vendor.id}
                  className="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {canUseCustomArrows && (
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveVendor(sortedVendors, index, 'up')}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-[#141d33] disabled:opacity-20 text-xs leading-none px-1"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveVendor(sortedVendors, index, 'down')}
                          disabled={index === sortedVendors.length - 1}
                          className="text-gray-400 hover:text-[#141d33] disabled:opacity-20 text-xs leading-none px-1"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                    {vendor.thumbnail_image_url ? (
                      <img
                        src={vendor.thumbnail_image_url}
                        alt={vendor.name}
                        className="w-12 h-12 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200" />
                    )}
                    <div>
                      <p className="text-[#141d33] font-medium">{vendor.name}</p>
                      <p className="text-xs text-gray-500">
                        {vendor.vendor_categories?.name || 'No category'}
                        {!vendor.is_published && ' · Unpublished'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        👁 {vendor.view_count || 0} views · 📞 {vendor.click_phone || 0} · 💬 {vendor.click_whatsapp || 0} · 🌐 {vendor.click_website || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => startEdit(vendor)}
                      className="text-sm text-[#C9A227] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id, vendor.name)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {previewVendor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={() => setPreviewVendorId(null)}
        >
          <div className="flex items-start justify-center min-h-full py-8 px-4">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#141d33]">Listing Preview</h3>
                <button
                  type="button"
                  onClick={() => setPreviewVendorId(null)}
                  aria-label="Close preview"
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Directory tile</p>
                  <div className="max-w-xs pointer-events-none">
                    <VendorTile vendor={previewVendor} href="#" />
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Full listing page</p>
                  <VendorDetailView vendor={previewDetailVendor} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewVendorId(null)}
                className="mt-6 w-full border border-gray-300 text-gray-600 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
