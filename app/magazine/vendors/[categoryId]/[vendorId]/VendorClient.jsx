'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Header from '../../../../../components/Header'
import Footer from '../../../../../components/Footer'
import Link from 'next/link'

export default function VendorClient() {
  const [user, setUser] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)

      const { data: vendorData, error } = await supabase
        .from('magazine_vendors')
        .select('*, vendor_categories(name)')
        .eq('id', params.vendorId)
        .eq('is_published', true)
        .maybeSingle()

      if (error || !vendorData) {
        setNotFound(true)
      } else {
        setVendor(vendorData)
        setCategory(vendorData.vendor_categories)
        trackStat(params.vendorId, 'view')
      }
      setLoading(false)
    }
    load()
  }, [params.vendorId])

  const trackStat = (vendorId, statType) => {
    fetch('/api/magazine/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, statType }),
    }).catch(() => {})
  }

  const handleDashboardClick = () => {
    router.push('/dashboard')
  }

  const whatsappLink = (number) => {
    const digitsOnly = number.replace(/\D/g, '')
    return 'https://wa.me/' + digitsOnly
  }

  const normalizeUrl = (url) => {
    if (!url) return url
    return /^https?:\/\//i.test(url) ? url : 'https://' + url
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onDashboardClick={handleDashboardClick} />

      <div className="max-w-2xl mx-auto px-6 py-14 flex-1 w-full">
        <Link href={'/magazine/vendors/' + params.categoryId} className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Back to {category?.name || 'Category'}
        </Link>

        {notFound ? (
          <p className="text-gray-400 italic mt-8">This vendor could not be found.</p>
        ) : (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {vendor.ad_image_url && (
              <img src={vendor.ad_image_url} alt={vendor.name} className="w-full object-cover" />
            )}

            <div className="p-8">
              <p className="text-xs uppercase tracking-wide text-[#C9A227] font-medium mb-1">
                {category?.name}
              </p>
              <h1 className="text-3xl font-serif text-[#141d33] mb-4">{vendor.name}</h1>

              {vendor.blurb && (
                <p className="text-gray-600 mb-4">{vendor.blurb}</p>
              )}

              {vendor.location && (
                <p className="text-sm text-gray-500 mb-6">📍 {vendor.location}</p>
              )}

              <div className="flex flex-col gap-3">
                {vendor.phone && <a href={'tel:' + vendor.phone} onClick={() => trackStat(vendor.id, 'phone')} className="inline-flex items-center justify-center gap-2 bg-[#141d33] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1e2b4d] transition-colors">Call {vendor.phone}</a>}

                {vendor.whatsapp && <a href={whatsappLink(vendor.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => trackStat(vendor.id, 'whatsapp')} className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Message on WhatsApp</a>}

                {vendor.email && <a href={'mailto:' + vendor.email} className="inline-flex items-center justify-center gap-2 border border-[#141d33] text-[#141d33] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Email {vendor.email}</a>}

                {vendor.website && <a href={normalizeUrl(vendor.website)} target="_blank" rel="noopener noreferrer" onClick={() => trackStat(vendor.id, 'website')} className="inline-flex items-center justify-center gap-2 border border-[#141d33] text-[#141d33] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Visit Website</a>}

                {vendor.instagram && <a href={normalizeUrl(vendor.instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#141d33] text-[#141d33] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Follow on Instagram</a>}

                {vendor.coupon_text && (
                  <div className="mt-2 border-2 border-dashed border-[#C9A227] rounded-lg p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-[#C9A227] font-medium mb-1">SimchaPro Member Coupon</p>
                    <p className="text-[#141d33] font-medium">{vendor.coupon_text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}