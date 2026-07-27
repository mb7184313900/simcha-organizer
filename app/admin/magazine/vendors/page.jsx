'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '../../../../components/Footer'
import Link from 'next/link'
import MagazineAdminNav from '../../../../components/MagazineAdminNav'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

function emptyForm() {
  return {
    id: null,
    name: '',
    category_id: '',
    phone: '',
    whatsapp: '',
    website: '',
    blurb: '',
    is_published: true,
    ad_image_url: '',
    thumbnail_image_url: '',
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
    if (!form.category_id) {
      setErrorMsg('Please choose a category.')
      return
    }

    setSaving(true)
    setErrorMsg(null)

    try {
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
        category_id: form.category_id,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        website: form.website.trim(),
        blurb: form.blurb.trim(),
        is_published: form.is_published,
        ad_image_url: adImageUrl,
        thumbnail_image_url: thumbImageUrl,
      }

      let error
      if (form.id) {
        const { error: updateError } = await supabase
          .from('magazine_vendors')
          .update(payload)
          .eq('id', form.id)
        error = updateError
      } else {
        // New vendors go to the end of their category's custom order
        const categoryVendors = vendors.filter(v => v.category_id === form.category_id)
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
      is_published: vendor.is_published,
      ad_image_url: vendor.ad_image_url || '',
      thumbnail_image_url: vendor.thumbnail_image_url || '',
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

    const { error } = await supabase
      .from('magazine_vendors')
      .update({ status: 'active', is_published: true })
      .eq('id', id)

    if (error) {
      setErrorMsg(`Failed to approve "${name}".`)
    } else {
      loadData()
    }
  }

  const handleReject = async (id, name) => {
    const confirmed = window.confirm(`Reject and remove the submission from "${name}"? This cannot be undone.`)
    if (!confirmed) return

    setErrorMsg(null)

    const { error } = await supabase
      .from('magazine_vendors')
      .delete()
      .eq('id', id)

    if (error) {
      setErrorMsg(`Failed to reject "${name}".`)
    } else {
      loadData()
    }
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
              {pendingVendors.map((vendor) => (
                <li
                  key={vendor.id}
                  className="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
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
                        {vendor.email && ` · ${vendor.email}`}
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
                      onClick={() => handleApprove(vendor.id, vendor.name)}
                      className="text-sm bg-[#141d33] text-white px-3 py-1.5 rounded-md hover:bg-[#1e2b4d]"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(vendor.id, vendor.name)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
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
              <label className="block text-sm text-gray-600 mb-1">
                Ad Image / Flyer (shown on vendor detail page)
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
                Thumbnail Image (shown on category browse cards)
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
      <Footer />
    </div>
  )
}