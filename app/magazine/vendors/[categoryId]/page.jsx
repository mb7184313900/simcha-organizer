'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Header from '../../../../components/Header'
import Footer from '../../../../components/Footer'
import Link from 'next/link'

export default function CategoryVendorsPage() {
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const [category, setCategory] = useState(null)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
      setCheckingUser(false)

      const [{ data: categoryData }, { data: vendorData }, { data: settingsData }] = await Promise.all([
        supabase
          .from('vendor_categories')
          .select('*')
          .eq('id', params.categoryId)
          .maybeSingle(),
        supabase
          .from('magazine_vendors')
          .select('*')
          .eq('category_id', params.categoryId)
          .eq('is_published', true),
        supabase
          .from('magazine_settings')
          .select('vendor_sort_mode')
          .limit(1)
          .maybeSingle(),
      ])

      let sortedVendors = [...(vendorData || [])]
      const mode = settingsData?.vendor_sort_mode || 'alphabetical'

      if (mode === 'alphabetical') {
        sortedVendors.sort((a, b) => a.name.localeCompare(b.name))
      } else if (mode === 'newest') {
        sortedVendors.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } else if (mode === 'custom') {
        sortedVendors.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      }

      setCategory(categoryData)
      setVendors(sortedVendors)
      setLoading(false)
    }
    load()
  }, [params.categoryId])

  const handleDashboardClick = () => {
    router.push('/dashboard')
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onDashboardClick={handleDashboardClick} />

      <div className="max-w-5xl mx-auto px-6 py-14 flex-1 w-full">
        <Link href="/magazine/vendors" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← All Categories
        </Link>

        <h1 className="text-4xl font-serif text-[#141d33] mt-4 mb-10">
          {category?.name || 'Vendors'}
        </h1>

        {loading ? (
          <p className="text-gray-400 italic">Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <p className="text-gray-400 italic">No vendors in this category yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/magazine/vendors/${params.categoryId}/${vendor.id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {vendor.thumbnail_image_url ? (
                  <img
                    src={vendor.thumbnail_image_url}
                    alt={vendor.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100" />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-serif text-[#141d33] group-hover:text-[#C9A227] transition-colors">
                    {vendor.name}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}