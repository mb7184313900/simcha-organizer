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
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
      setCheckingUser(false)

      const { data } = await supabase
        .from('vendor_categories')
        .select('*')
        .order('sort_order', { ascending: true })

      setCategories(data || [])
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
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/magazine/vendors/${category.id}`}
                className="group bg-white rounded-xl border border-gray-200 px-6 py-5 shadow-sm hover:shadow-md hover:border-[#C9A227] transition-all text-center"
              >
                <span className="text-lg font-serif text-[#141d33] group-hover:text-[#C9A227] transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}