'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../../lib/supabase'
import { getAccessStatus } from '../../../../../lib/accessControl'
import { useRouter, useParams } from 'next/navigation'
import Header from '../../../../../components/Header'
import Footer from '../../../../../components/Footer'
import VendorDetailView from '../../../../../components/VendorDetailView'
import Link from 'next/link'

export default function VendorClient() {
  const [user, setUser] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isPaidMember, setIsPaidMember] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)

      if (user) {
        const access = await getAccessStatus(user)
        setIsPaidMember(access.state === 'active')
      }

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
          <VendorDetailView vendor={vendor} onTrackStat={trackStat} isPaidMember={isPaidMember} />
        )}
      </div>

      <Footer />
    </div>
  )
}