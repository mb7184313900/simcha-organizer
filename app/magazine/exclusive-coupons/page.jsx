'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getAccessStatus } from '../../../lib/accessControl'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import Link from 'next/link'

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function isCouponActive(text, expiration) {
  if (!text) return false
  if (!expiration) return true
  return new Date(`${expiration}T23:59:59`).getTime() >= Date.now()
}

function CouponCard({ coupon }) {
  const card = (
    <div className={`bg-white rounded-xl border border-[#C9A227]/40 shadow-sm overflow-hidden ${coupon.href ? 'hover:shadow-md transition-all' : ''}`}>
      {coupon.vendor_image_url && (
        <img
          src={coupon.vendor_image_url}
          alt={coupon.vendor_name}
          className="w-full h-32 object-contain bg-gray-100"
        />
      )}
      <div className="p-6">
        <h2 className="text-lg font-serif text-[#141d33] mb-1">{coupon.vendor_name}</h2>
        <p className="text-[#C9A227] font-semibold text-xl mb-3">{coupon.discount_description}</p>

        {coupon.coupon_code && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg px-4 py-2 mb-3 text-center">
            <span className="text-sm text-gray-500">Code: </span>
            <span className="font-mono font-semibold text-[#141d33]">{coupon.coupon_code}</span>
          </div>
        )}

        {coupon.expiration_date && (
          <p className="text-xs text-gray-400 mb-2">Expires {formatDate(coupon.expiration_date)}</p>
        )}

        {coupon.terms && (
          <p className="text-xs text-gray-400">{coupon.terms}</p>
        )}
      </div>
    </div>
  )

  return coupon.href ? <Link href={coupon.href}>{card}</Link> : card
}

export default function ExclusiveCouponsPage() {
  const [user, setUser] = useState(null)
  const [isPaidMember, setIsPaidMember] = useState(false)
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user || null)

      let paidMember = false

      if (user) {
        const access = await getAccessStatus(user)
        paidMember = access.state === 'active'
      }

      setIsPaidMember(paidMember)

      if (paidMember) {
        const [{ data: manualData }, { data: vendorData }] = await Promise.all([
          supabase
            .from('coupons')
            .select('*')
            .eq('is_published', true)
            .eq('is_exclusive', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('magazine_vendors')
            .select('id, name, category_id, thumbnail_image_url, exclusive_coupon_text, exclusive_coupon_expiration, created_at')
            .eq('is_published', true)
            .not('exclusive_coupon_text', 'is', null),
        ])

        const manualCoupons = (manualData || []).map((c) => ({
          id: `manual-${c.id}`,
          vendor_name: c.vendor_name,
          discount_description: c.discount_description,
          coupon_code: c.coupon_code,
          expiration_date: c.expiration_date,
          terms: c.terms,
          vendor_image_url: c.vendor_image_url,
          href: null,
          created_at: c.created_at,
        }))

        const vendorCoupons = (vendorData || [])
          .filter((v) => isCouponActive(v.exclusive_coupon_text, v.exclusive_coupon_expiration))
          .map((v) => ({
            id: `vendor-${v.id}`,
            vendor_name: v.name,
            discount_description: v.exclusive_coupon_text,
            coupon_code: null,
            expiration_date: v.exclusive_coupon_expiration,
            terms: null,
            vendor_image_url: v.thumbnail_image_url,
            href: `/magazine/vendors/${v.category_id}/${v.id}`,
            created_at: v.created_at,
          }))

        const combined = [...manualCoupons, ...vendorCoupons].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )

        setCoupons(combined)
      }

      setLoading(false)
    }
    load()
  }, [])

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

      <div className="max-w-5xl mx-auto px-6 py-14 flex-1 w-full">
        <Link href="/magazine" className="text-sm text-gray-500 hover:text-[#141d33]">
          ← Simcha Magazine
        </Link>

        <h1 className="text-4xl font-serif text-[#141d33] mt-4 mb-4">Exclusive Coupons</h1>

        <div className="bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#141d33] rounded-lg px-5 py-4 mb-10 text-sm">
          Exclusive coupons appear from time to time, first come, first served, while supplies last. Check back often!
        </div>

        {!isPaidMember ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center">
            <p className="text-xl font-serif text-[#141d33] mb-2">For Paid Members Only</p>
            <p className="text-gray-500 mb-6">
              Become a paid member to unlock exclusive vendor coupons when they become available.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-[#141d33] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1e2b4d] transition-colors"
            >
              View Plans
            </Link>
          </div>
        ) : coupons.length === 0 ? (
          <p className="text-gray-400 italic">No exclusive coupons available right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
