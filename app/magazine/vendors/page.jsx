'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Link from 'next/link'

export default function VendorCategoriesPage() {
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const [categories, setCategories] = useState([])
  const [counts, setCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
      setCheckingUser(false)

      const [{ data: categoryData }, { data: vendorData }] = await Promise.all([
        supabase
          .from('vendor_categories')
          .select('*')
          .order('sort_order', { ascending: true }),
        supabase
          .from('magazine_vendors')
          .select('category_id')
          .eq('is_published', true),
      ])

      // Count how many published vendors belong to each category
      const countMap = {}
      ;(vendorData || []).forEach((v) => {
        countMap[v.category_id] = (countMap[v.category_id] || 0) + 1
      })

      setCategories(categoryData || [])
      setCounts(countMap)
      setLoading(false)
    }
    load()
  }, [])

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
        <Link href="/magazine" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Simcha Magazine
        </Link>

        <h1 className="text-4xl font-serif text-[#141d33] mt-4 mb-2">Vendor Directory</h1>
        <p className="text-gray-500 mb-10">Browse vendors by category.</p>

        {loading ? (
          <p className="text-gray-400 italic">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-400 italic">No categories yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const count = counts[category.id] || 0
              return (
                <Link
                  key={category.id}
                  href={`/magazine/vendors/${category.id}`}
                  className="group bg-white rounded-xl border border-gray-200 px-6 py-5 shadow-sm hover:shadow-md hover:border-[#C9A227] transition-all text-center"
                >
                  <span className="text-lg font-serif text-[#141d33] group-hover:text-[#C9A227] transition-colors block">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {count === 0 ? 'No vendors yet' : `${count} vendor${count === 1 ? '' : 's'}`}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}