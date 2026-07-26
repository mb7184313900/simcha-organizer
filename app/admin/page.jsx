'use client'

import { useEffect, useState, useMemo } from 'react'
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

function formatDateList(dates) {
  if (!dates || dates.length === 0) return '—'
  return dates.map(formatDate).join(', ')
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

// A clickable table header that shows a sort arrow when active.
function SortableHeader({ label, columnKey, sortState, onSort }) {
  const isActive = sortState.key === columnKey
  const arrow = isActive ? (sortState.direction === 'asc' ? '▲' : '▼') : ''

  return (
    <th
      className="px-6 py-3 font-medium cursor-pointer select-none hover:text-[#141d33]"
      onClick={() => onSort(columnKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {arrow && <span className="text-[10px]">{arrow}</span>}
      </span>
    </th>
  )
}

// A small text input used under a header to filter that column.
function FilterInput({ value, onChange, placeholder }) {
  return (
    <th className="px-6 pb-3">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Filter...'}
        className="w-full text-xs font-normal border border-gray-200 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
        onClick={(e) => e.stopPropagation()}
      />
    </th>
  )
}

// Generic comparator used for sorting rows by a given key.
function compareValues(a, b, key) {
  let valA = a[key]
  let valB = b[key]

  if (key === 'signedUpAt' || key === 'date' || key === 'soonestExpiresAt' || key === 'expiresAt') {
    valA = valA ? new Date(valA).getTime() : 0
    valB = valB ? new Date(valB).getTime() : 0
    return valA - valB
  }

  if (typeof valA === 'number' && typeof valB === 'number') {
    return valA - valB
  }

  valA = (valA ?? '').toString().toLowerCase()
  valB = (valB ?? '').toString().toLowerCase()
  if (valA < valB) return -1
  if (valA > valB) return 1
  return 0
}

// Builds the display string for a row+key the same way the table shows it,
// so filtering matches what the person actually sees on screen.
function getDisplayValue(row, key) {
  switch (key) {
    case 'weddingCount':
      return `${row.weddingCount} ${row.weddingCount === 1 ? 'wedding' : 'weddings'}`
    case 'totalPaid':
      return row.totalPaid > 0 ? `$${row.totalPaid.toLocaleString()}` : ''
    case 'signedUpAt':
      return formatDate(row.signedUpAt)
    case 'soonestExpiresAt':
      return formatDateList(row.expiresAtList)
    case 'date':
      return formatDate(row.date)
    case 'expiresAt':
      return formatDate(row.expiresAt)
    case 'amount':
      return `$${row.amount}`
    default:
      return (row[key] ?? '').toString()
  }
}

function applyFilters(rows, filters) {
  return rows.filter(row =>
    Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true
      const display = getDisplayValue(row, key).toLowerCase()
      return display.includes(filterValue.toLowerCase())
    })
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

  const [signupsSort, setSignupsSort] = useState({ key: 'signedUpAt', direction: 'desc' })
  const [paymentsSort, setPaymentsSort] = useState({ key: 'date', direction: 'desc' })

  const [signupsFilters, setSignupsFilters] = useState({
    name: '', email: '', weddingCount: '', accountType: '', plan: '',
    status: '', totalPaid: '', signedUpAt: '', soonestExpiresAt: '',
  })
  const [paymentsFilters, setPaymentsFilters] = useState({
    name: '', email: '', plan: '', amount: '', date: '', expiresAt: '',
  })

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

  const handleSignupsSort = (key) => {
    setSignupsSort(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }

  const handlePaymentsSort = (key) => {
    setPaymentsSort(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    )
  }

  const updateSignupsFilter = (key, value) => {
    setSignupsFilters(prev => ({ ...prev, [key]: value }))
  }

  const updatePaymentsFilter = (key, value) => {
    setPaymentsFilters(prev => ({ ...prev, [key]: value }))
  }

  const filteredSortedSignups = useMemo(() => {
    const filtered = applyFilters(recentSignups, signupsFilters)
    const sorted = [...filtered].sort((a, b) => compareValues(a, b, signupsSort.key))
    return signupsSort.direction === 'desc' ? sorted.reverse() : sorted
  }, [recentSignups, signupsSort, signupsFilters])

  const filteredSortedPayments = useMemo(() => {
    const filtered = applyFilters(recentPayments, paymentsFilters)
    const sorted = [...filtered].sort((a, b) => compareValues(a, b, paymentsSort.key))
    return paymentsSort.direction === 'desc' ? sorted.reverse() : sorted
  }, [recentPayments, paymentsSort, paymentsFilters])

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

        <a
          href="/admin/magazine/categories"
          className="inline-block bg-[#141d33] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e2b4d] mb-8"
        >
          Simcha Magazine →
        </a>

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
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-serif text-[#141d33]">Recent Signups</h2>
                <span className="text-xs text-gray-400">
                  {filteredSortedSignups.length} of {recentSignups.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <SortableHeader label="Name" columnKey="name" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Email" columnKey="email" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Weddings" columnKey="weddingCount" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Type" columnKey="accountType" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Plan" columnKey="plan" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Status" columnKey="status" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Total Paid" columnKey="totalPaid" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Signed Up" columnKey="signedUpAt" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Expires" columnKey="soonestExpiresAt" sortState={signupsSort} onSort={handleSignupsSort} />
                    </tr>
                    <tr className="border-b border-gray-100">
                      <FilterInput value={signupsFilters.name} onChange={(v) => updateSignupsFilter('name', v)} />
                      <FilterInput value={signupsFilters.email} onChange={(v) => updateSignupsFilter('email', v)} />
                      <FilterInput value={signupsFilters.weddingCount} onChange={(v) => updateSignupsFilter('weddingCount', v)} />
                      <FilterInput value={signupsFilters.accountType} onChange={(v) => updateSignupsFilter('accountType', v)} />
                      <FilterInput value={signupsFilters.plan} onChange={(v) => updateSignupsFilter('plan', v)} />
                      <FilterInput value={signupsFilters.status} onChange={(v) => updateSignupsFilter('status', v)} />
                      <FilterInput value={signupsFilters.totalPaid} onChange={(v) => updateSignupsFilter('totalPaid', v)} />
                      <FilterInput value={signupsFilters.signedUpAt} onChange={(v) => updateSignupsFilter('signedUpAt', v)} placeholder="e.g. Jul 2026" />
                      <FilterInput value={signupsFilters.soonestExpiresAt} onChange={(v) => updateSignupsFilter('soonestExpiresAt', v)} placeholder="e.g. Jul 2026" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedSignups.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-6 text-center text-gray-400">
                          No signups match these filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSortedSignups.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-6 py-3 text-[#141d33]">{row.name || '—'}</td>
                          <td className="px-6 py-3 text-gray-600">{row.email}</td>
                          <td className="px-6 py-3 text-gray-600">
                            {row.weddingCount} {row.weddingCount === 1 ? 'wedding' : 'weddings'}
                          </td>
                          <td className="px-6 py-3 text-gray-600">{row.accountType}</td>
                          <td className="px-6 py-3 text-gray-600">{row.plan}</td>
                          <td className="px-6 py-3">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {row.totalPaid > 0 ? `$${row.totalPaid.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-6 py-3 text-gray-500">{formatDate(row.signedUpAt)}</td>
                          <td className="px-6 py-3 text-gray-500">{formatDateList(row.expiresAtList)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent payments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-serif text-[#141d33]">Recent Payments</h2>
                <span className="text-xs text-gray-400">
                  {filteredSortedPayments.length} of {recentPayments.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <SortableHeader label="Name" columnKey="name" sortState={paymentsSort} onSort={handlePaymentsSort} />
                      <SortableHeader label="Email" columnKey="email" sortState={paymentsSort} onSort={handlePaymentsSort} />
                      <SortableHeader label="Plan" columnKey="plan" sortState={paymentsSort} onSort={handlePaymentsSort} />
                      <SortableHeader label="Amount" columnKey="amount" sortState={paymentsSort} onSort={handlePaymentsSort} />
                      <SortableHeader label="Date" columnKey="date" sortState={paymentsSort} onSort={handlePaymentsSort} />
                      <SortableHeader label="Expires" columnKey="expiresAt" sortState={paymentsSort} onSort={handlePaymentsSort} />
                    </tr>
                    <tr className="border-b border-gray-100">
                      <FilterInput value={paymentsFilters.name} onChange={(v) => updatePaymentsFilter('name', v)} />
                      <FilterInput value={paymentsFilters.email} onChange={(v) => updatePaymentsFilter('email', v)} />
                      <FilterInput value={paymentsFilters.plan} onChange={(v) => updatePaymentsFilter('plan', v)} />
                      <FilterInput value={paymentsFilters.amount} onChange={(v) => updatePaymentsFilter('amount', v)} />
                      <FilterInput value={paymentsFilters.date} onChange={(v) => updatePaymentsFilter('date', v)} placeholder="e.g. Jul 2026" />
                      <FilterInput value={paymentsFilters.expiresAt} onChange={(v) => updatePaymentsFilter('expiresAt', v)} placeholder="e.g. Jul 2026" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedPayments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-6 text-center text-gray-400">
                          No payments match these filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSortedPayments.map((row, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-6 py-3 text-[#141d33]">{row.name || '—'}</td>
                          <td className="px-6 py-3 text-gray-600">{row.email}</td>
                          <td className="px-6 py-3 text-gray-600">{row.plan}</td>
                          <td className="px-6 py-3 text-gray-600">${row.amount}</td>
                          <td className="px-6 py-3 text-gray-500">{formatDate(row.date)}</td>
                          <td className="px-6 py-3 text-gray-500">{formatDate(row.expiresAt)}</td>
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