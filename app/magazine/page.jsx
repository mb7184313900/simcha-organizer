'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'

const SECTIONS = [
  {
    href: '/magazine/articles',
    title: 'Articles',
    description: 'Tips, guides, and inspiration for planning your simcha.',
  },
  {
    href: '/magazine/vendors',
    title: 'Vendor Directory',
    description: 'Browse trusted vendors by category — halls, photographers, catering, and more.',
  },
  {
    href: '/magazine/coupons',
    title: 'Coupons',
    description: 'Special discounts from vendors in our directory.',
  },
  {
    href: '/magazine/exclusive-coupons',
    title: 'Exclusive Coupons',
    description: 'Extra-special offers for paid members, available from time to time.',
    badge: 'Paid Members',
  },
]

export default function MagazinePage() {
  const [user, setUser] = useState(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)
      setCheckingUser(false)
    }
    loadUser()
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-[#141d33] mb-3">Simcha Magazine</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Articles, vendors, and exclusive offers to help you plan your simcha — all in one place.
          </p>
        </div>

        <Link href="/advertise" className="block bg-[#141d33] rounded-xl px-8 py-6 mb-12 text-center hover:bg-[#1e2b4d] transition-colors">
          <p className="text-[#C9A227] font-serif text-xl mb-1">Are you a vendor?</p>
          <p className="text-white text-sm">Advertise your business in the Simcha Magazine — free for a limited time →</p>
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-[#C9A227] transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-serif text-[#141d33] group-hover:text-[#C9A227] transition-colors">
                  {section.title}
                </h2>
                {section.badge && (
                  <span className="text-xs font-medium bg-[#C9A227]/10 text-[#C9A227] px-2 py-1 rounded">
                    {section.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}