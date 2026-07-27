'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '../../../../components/Footer'
import Link from 'next/link'
import MagazineAdminNav from '../../../../components/MagazineAdminNav'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

export default function MagazineRevenueAdmin() {
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

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

      setAuthorized(true)
      setChecking(false)
      loadData()
    }
    checkAccess()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('magazine_vendors')
      .select('id, name, status, amount_paid, created_at, vendor_categories(name)')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMsg('Failed to load vendor revenue data.')
    } else {
      setVendors(data)
    }
    setLoading(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return `$${Number(amount || 0).toFixed(2)}`
  }

  const statusBadge = (status) => {
    const styles = {
      active: 'bg-green-50 text-green-700 border-green-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    }
    const style = styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${style}`}>
        {status}
      </span>
    )
  }

  const totalVendors = vendors.length
  const totalRevenue = vendors.reduce((sum, v) => sum + Number(v.amount_paid || 0), 0)

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

        <h1 className="text-3xl font-serif text-[#141d33] mt-4 mb-2">Vendor Revenue</h1>
        <p className="text-gray-500 mb-8">
          All vendors who have advertised in the Simcha Magazine, and what they've paid.
        </p>

        <MagazineAdminNav />

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {/* Summary row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Vendors</p>
            <p className="text-3xl font-serif text-[#141d33]">{totalVendors}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-serif text-[#141d33]">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Vendor table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-serif text-[#141d33]">All Vendors</h2>
          </div>

          {loading ? (
            <p className="text-gray-400 italic p-6">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="text-gray-400 italic p-6">No vendors yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Amount Paid</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-6 py-3 text-[#141d33] font-medium">{vendor.name}</td>
                    <td className="px-6 py-3 text-gray-500">{vendor.vendor_categories?.name || '—'}</td>
                    <td className="px-6 py-3">{statusBadge(vendor.status)}</td>
                    <td className="px-6 py-3 text-gray-700">{formatCurrency(vendor.amount_paid)}</td>
                    <td className="px-6 py-3 text-gray-400">{formatDate(vendor.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}