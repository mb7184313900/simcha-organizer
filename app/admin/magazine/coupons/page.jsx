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
    vendor_name: '',
    discount_description: '',
    coupon_code: '',
    expiration_date: '',
    terms: '',
    is_exclusive: false,
    is_published: true,
    vendor_image_url: '',
  }
}

export default function MagazineCouponsAdmin() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState(emptyForm())
  const [imageFile, setImageFile] = useState(null)

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
      loadCoupons()
    }
    checkAccess()
  }, [])

  const loadCoupons = async () => {
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg('Failed to load coupons.')
    } else {
      setCoupons(data)
    }
    setLoading(false)
  }

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `coupons/${fileName}`

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
    if (!form.vendor_name.trim()) {
      setErrorMsg('Vendor name is required.')
      return
    }
    if (!form.discount_description.trim()) {
      setErrorMsg('Discount description is required.')
      return
    }
    if (!form.coupon_code.trim()) {
      setErrorMsg('Coupon code is required.')
      return
    }

    setSaving(true)
    setErrorMsg(null)

    try {
      let imageUrl = form.vendor_image_url

      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile)
        setUploading(false)
      }

      const payload = {
        vendor_name: form.vendor_name.trim(),
        discount_description: form.discount_description.trim(),
        coupon_code: form.coupon_code.trim(),
        expiration_date: form.expiration_date || null,
        terms: form.terms.trim(),
        is_exclusive: form.is_exclusive,
        is_published: form.is_published,
        vendor_image_url: imageUrl,
      }

      let error
      if (form.id) {
        const { error: updateError } = await supabase
          .from('coupons')
          .update(payload)
          .eq('id', form.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('coupons')
          .insert(payload)
        error = insertError
      }

      if (error) {
        setErrorMsg('Failed to save coupon.')
      } else {
        setForm(emptyForm())
        setImageFile(null)
        loadCoupons()
      }
    } catch (err) {
      setErrorMsg('Image upload failed. Please try again.')
      setUploading(false)
    }

    setSaving(false)
  }

  const startEdit = (coupon) => {
    setForm({
      id: coupon.id,
      vendor_name: coupon.vendor_name || '',
      discount_description: coupon.discount_description || '',
      coupon_code: coupon.coupon_code || '',
      expiration_date: coupon.expiration_date || '',
      terms: coupon.terms || '',
      is_exclusive: coupon.is_exclusive,
      is_published: coupon.is_published,
      vendor_image_url: coupon.vendor_image_url || '',
    })
    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setForm(emptyForm())
    setImageFile(null)
  }

  const handleDelete = async (id, vendorName) => {
    const confirmed = window.confirm(`Delete coupon for "${vendorName}"? This cannot be undone.`)
    if (!confirmed) return

    setErrorMsg(null)

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) {
      setErrorMsg('Failed to delete coupon.')
    } else {
      loadCoupons()
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Back to Admin Dashboard
        </Link>

        <h1 className="text-3xl font-serif text-[#141d33] mt-4 mb-2">Magazine Coupons</h1>
        <p className="text-gray-500 mb-8">
          Add and manage regular and exclusive coupons shown in the Simcha Magazine.
        </p>
        <MagazineAdminNav />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-serif text-[#141d33] mb-4">
            {form.id ? 'Edit Coupon' : 'Add New Coupon'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vendor Name *</label>
              <input
                type="text"
                value={form.vendor_name}
                onChange={(e) => updateField('vendor_name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Discount Description *</label>
              <input
                type="text"
                value={form.discount_description}
                onChange={(e) => updateField('discount_description', e.target.value)}
                placeholder="e.g. 10% off or $50 off"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Coupon Code *</label>
              <input
                type="text"
                value={form.coupon_code}
                onChange={(e) => updateField('coupon_code', e.target.value)}
                placeholder="e.g. SIMCHA10"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Expiration Date</label>
              <input
                type="date"
                value={form.expiration_date}
                onChange={(e) => updateField('expiration_date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Terms / Fine Print</label>
              <textarea
                value={form.terms}
                onChange={(e) => updateField('terms', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Vendor Logo / Image</label>
              {form.vendor_image_url && (
                <img src={form.vendor_image_url} alt="Current" className="h-24 rounded mb-2 border border-gray-200" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_exclusive"
                checked={form.is_exclusive}
                onChange={(e) => updateField('is_exclusive', e.target.checked)}
              />
              <label htmlFor="is_exclusive" className="text-sm text-gray-600">
                Exclusive Coupon (paid members only)
              </label>
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
                {uploading ? 'Uploading image...' : saving ? 'Saving...' : form.id ? 'Save Changes' : 'Add Coupon'}
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

        {/* Coupon list */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-serif text-[#141d33]">
              Current Coupons ({coupons.length})
            </h2>
          </div>

          {loading ? (
            <p className="text-gray-400 italic p-6">Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p className="text-gray-400 italic p-6">No coupons yet. Add one above.</p>
          ) : (
            <ul>
              {coupons.map((coupon) => (
                <li
                  key={coupon.id}
                  className="px-6 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {coupon.vendor_image_url ? (
                      <img
                        src={coupon.vendor_image_url}
                        alt={coupon.vendor_name}
                        className="w-12 h-12 rounded object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 border border-gray-200" />
                    )}
                    <div>
                      <p className="text-[#141d33] font-medium">
                        {coupon.vendor_name} — {coupon.discount_description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {coupon.is_exclusive && (
                          <span className="text-[#C9A227] font-medium">Exclusive · </span>
                        )}
                        Code: {coupon.coupon_code}
                        {coupon.expiration_date && ` · Expires ${coupon.expiration_date}`}
                        {!coupon.is_published && ' · Unpublished'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => startEdit(coupon)}
                      className="text-sm text-[#C9A227] hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id, coupon.vendor_name)}
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