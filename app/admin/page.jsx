'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Footer from '../../components/Footer'

const ADMIN_EMAIL = 'mb7184313900@gmail.com'

function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-serif text-[#141d33]">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-blue-100 text-blue-700',
    trial_expired: 'bg-gray-100 text-gray-600',
    expired: 'bg-yellow-100 text-yellow-700',
    revoked: 'bg-red-100 text-red-700',
  }
  const style = colors[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${style}`}>
      {status || '—'}
    </span>
  )
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null)
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const [metrics, setMetrics] = useState(null)
  const [recentSignups, setRecentSignups] = useState([])
  const [recentPayments, setRecentPayments] = useState([])

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
      loadDashboardData()
    }
    checkAccess()
  }, [])

  const loadDashboardData = async () => {
    setLoadingData(true)
    setErrorMsg(null)

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token

    if (!token) {
      setErrorMsg('No active session. Please log in again.')
      setLoadingData(false)
      return
    }

    try {
      const [metricsRes, recentRes] = await Promise.all([
        fetch('/api/admin/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/recent', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!metricsRes.ok || !recentRes.ok) {
        setErrorMsg('Failed to load dashboard data.')
        setLoadingData(false)
        return
      }

      const metricsData = await metricsRes.json()
      const recentData = await recentRes.json()

      setMetrics(metricsData)
      setRecentSignups(recentData.recentSignups)
      setRecentPayments(recentData.recentPayments)
    } catch (err) {
      setErrorMsg('Something went wrong loading dashboard data.')
    }

    setLoadingData(false)
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
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif text-[#141d33] mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Signed in as {user.email}</p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {loadingData ? (
          <p className="text-gray-400 italic">Loading metrics...</p>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total Signups" value={metrics?.totalSignups ?? '—'} />
              <StatCard label="Trial Users" value={metrics?.totalTrialUsers ?? '—'} />
              <StatCard label="Paid Users" value={metrics?.totalPaidUsers ?? '—'} />
              <StatCard
                label="Total Revenue"
                value={metrics ? `$${metrics.totalRevenue.toLocaleString()}` : '—'}
              />
            </div>

            {/* Recent signups */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-10">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-serif text-[#141d33]">Recent Signups</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Weddings</th>
                      <th className="px-6 py-3 font-medium">Plan</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Signed Up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSignups.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-gray-400">
                          No signups yet.
                        </td>
                      </tr>
                    ) : (
                      recentSignups.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-6 py-3 text-[#141d33]">{row.name || '—'}</td>
                          <td className="px-6 py-3 text-gray-600">{row.email}</td>
                          <td className="px-6 py-3 text-gray-600">
                            {row.weddingCount} {row.weddingCount === 1 ? 'wedding' : 'weddings'}
                          </td>
                          <td className="px-6 py-3 text-gray-600">{row.plan}</td>
                          <td className="px-6 py-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-6 py-3 text-gray-500">{formatDate(row.signedUpAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent payments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-serif text-[#141d33]">Recent Payments</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">Plan</th>
                      <th className="px-6 py-3 font-medium">Amount</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-gray-400">
                          No payments yet.
                        </td>
                      </tr>
                    ) : (
                      recentPayments.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-6 py-3 text-[#141d33]">{row.name || '—'}</td>
                          <td className="px-6 py-3 text-gray-600">{row.email}</td>
                          <td className="px-6 py-3 text-gray-600">{row.plan}</td>
                          <td className="px-6 py-3 text-gray-600">${row.amount}</td>
                          <td className="px-6 py-3 text-gray-500">{formatDate(row.date)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}