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

function compareValues(a, b, key) {
  let valA = a[key]
  let valB = b[key]

  if (key === 'signedUpAt' || key === 'date' || key === 'soonestExpiresAt' || key === 'expiresAt' || key === 'lastLogin') {
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
    case 'lastLogin':
      return row.lastLogin ? formatDate(row.lastLogin) : 'Never'
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
    status: '', totalPaid: '', signedUpAt: '', soonestExpiresAt: '', lastLogin: '',
  })
  const [paymentsFilters, setPaymentsFilters] = useState({
    name: '', email: '', plan: '', amount: '', date: '', expiresAt: '',
  })

  // Manage Access modal
  const [manageAccessRow, setManageAccessRow] = useState(null)
  const [selectedWedding, setSelectedWedding] = useState(null)
  const [customExpiresAt, setCustomExpiresAt] = useState('')
  const [isFreeGrant, setIsFreeGrant] = useState(false)
  const [savingAccess, setSavingAccess] = useState(false)
  const [manageAccessError, setManageAccessError] = useState('')

  // Delete Test Signups
  const [selectedUserIds, setSelectedUserIds] = useState(new Set())
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteResults, setDeleteResults] = useState(null)
  const [deleteError, setDeleteError] = useState('')

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

  const openManageAccess = (row) => {
    setManageAccessRow(row)
    setManageAccessError('')
    setCustomExpiresAt('')
    setIsFreeGrant(false)
    setSelectedWedding(row.weddings && row.weddings.length === 1 ? row.weddings[0] : null)
  }

  const closeManageAccess = () => {
    setManageAccessRow(null)
    setSelectedWedding(null)
    setCustomExpiresAt('')
    setIsFreeGrant(false)
    setManageAccessError('')
  }

  // Computes the new date from the wedding's CURRENT expires_at, not from today.
  const applyPreset = (amount, unit) => {
    if (!selectedWedding) return
    const base = selectedWedding.expiresAt ? new Date(selectedWedding.expiresAt) : new Date()
    const result = new Date(base)
    if (unit === 'year') result.setFullYear(result.getFullYear() + amount)
    if (unit === 'month') result.setMonth(result.getMonth() + amount)
    if (unit === 'week') result.setDate(result.getDate() + amount * 7)
    setCustomExpiresAt(result.toISOString().slice(0, 10))
  }

  const handleSaveAccess = async () => {
    setManageAccessError('')

    if (!selectedWedding) {
      setManageAccessError('Please select a wedding.')
      return
    }
    if (!customExpiresAt) {
      setManageAccessError('Please choose an expiration date.')
      return
    }

    setSavingAccess(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch('/api/admin/manage-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId: selectedWedding.subscriptionId,
          newExpiresAt: new Date(`${customExpiresAt}T23:59:59`).toISOString(),
          isFreeGrant,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setManageAccessError(result.error || 'Failed to update access.')
        setSavingAccess(false)
        return
      }

      closeManageAccess()
      await loadDashboardData()
    } catch (err) {
      setManageAccessError('Something went wrong. Please try again.')
    }

    setSavingAccess(false)
  }

  // Re-derived client-side purely for disabling the checkbox in the UI —
  // the server independently re-checks this from the database before deleting anything.
  const isRowProtected = (row) =>
    (row.weddings || []).some(
      (w) => (w.amountPaid !== null && w.amountPaid !== undefined && Number(w.amountPaid) > 0) || w.isFreeGrant
    )

  const toggleSelected = (userId) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const openDeleteModal = () => {
    setDeleteResults(null)
    setDeleteError('')
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setDeleteResults(null)
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    setDeleteError('')
    setDeleting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch('/api/admin/delete-signups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds: Array.from(selectedUserIds) }),
      })

      const result = await res.json()

      if (!res.ok) {
        setDeleteError(result.error || 'Failed to delete signups.')
        setDeleting(false)
        return
      }

      setDeleteResults(result.results)
      setSelectedUserIds(new Set())
      await loadDashboardData()
    } catch (err) {
      setDeleteError('Something went wrong. Please try again.')
    }

    setDeleting(false)
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

        <div className="flex gap-3 mb-8">
          <a href="/admin/magazine/categories" className="inline-block bg-[#141d33] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1e2b4d]">Simcha Magazine →</a>
          <a href="/admin/magazine/revenue" className="inline-block bg-white text-[#141d33] border border-[#141d33] px-6 py-2 rounded-lg font-medium hover:bg-gray-50">Vendor Revenue →</a>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {errorMsg}
          </div>
        )}

        {loadingData ? (
          <p className="text-gray-400 italic">Loading metrics...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard label="Total Signups" value={metrics?.totalSignups ?? '—'} />
              <StatCard label="Trial Users" value={metrics?.totalTrialUsers ?? '—'} />
              <StatCard label="Paid Users" value={metrics?.totalPaidUsers ?? '—'} />
              <StatCard
                label="Total Revenue"
                value={metrics ? `$${metrics.totalRevenue.toLocaleString()}` : '—'}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-10">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-serif text-[#141d33]">Recent Signups</h2>
                <div className="flex items-center gap-4">
                  {selectedUserIds.size > 0 && (
                    <button
                      onClick={openDeleteModal}
                      className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-md font-medium hover:bg-red-700"
                    >
                      Delete Selected ({selectedUserIds.size})
                    </button>
                  )}
                  <span className="text-xs text-gray-400">
                    {filteredSortedSignups.length} of {recentSignups.length}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="px-6 py-3"></th>
                      <SortableHeader label="Name" columnKey="name" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Email" columnKey="email" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Weddings" columnKey="weddingCount" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Type" columnKey="accountType" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Plan" columnKey="plan" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Status" columnKey="status" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Total Paid" columnKey="totalPaid" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Signed Up" columnKey="signedUpAt" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Expires" columnKey="soonestExpiresAt" sortState={signupsSort} onSort={handleSignupsSort} />
                      <SortableHeader label="Last Login" columnKey="lastLogin" sortState={signupsSort} onSort={handleSignupsSort} />
                      <th className="px-6 py-3"></th>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 pb-3"></th>
                      <FilterInput value={signupsFilters.name} onChange={(v) => updateSignupsFilter('name', v)} />
                      <FilterInput value={signupsFilters.email} onChange={(v) => updateSignupsFilter('email', v)} />
                      <FilterInput value={signupsFilters.weddingCount} onChange={(v) => updateSignupsFilter('weddingCount', v)} />
                      <FilterInput value={signupsFilters.accountType} onChange={(v) => updateSignupsFilter('accountType', v)} />
                      <FilterInput value={signupsFilters.plan} onChange={(v) => updateSignupsFilter('plan', v)} />
                      <FilterInput value={signupsFilters.status} onChange={(v) => updateSignupsFilter('status', v)} />
                      <FilterInput value={signupsFilters.totalPaid} onChange={(v) => updateSignupsFilter('totalPaid', v)} />
                      <FilterInput value={signupsFilters.signedUpAt} onChange={(v) => updateSignupsFilter('signedUpAt', v)} placeholder="e.g. Jul 2026" />
                      <FilterInput value={signupsFilters.soonestExpiresAt} onChange={(v) => updateSignupsFilter('soonestExpiresAt', v)} placeholder="e.g. Jul 2026" />
                      <FilterInput value={signupsFilters.lastLogin} onChange={(v) => updateSignupsFilter('lastLogin', v)} placeholder="e.g. Jul 2026" />
                      <th className="px-6 pb-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSortedSignups.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-6 py-6 text-center text-gray-400">
                          No signups match these filters.
                        </td>
                      </tr>
                    ) : (
                      filteredSortedSignups.map((row, i) => {
                        const protectedRow = isRowProtected(row)
                        return (
                        <tr key={i} className="border-b border-gray-50 last:border-0">
                          <td className="px-6 py-3">
                            {protectedRow ? (
                              <span className="text-[11px] text-gray-400 italic whitespace-nowrap">Paid — protected</span>
                            ) : (
                              <input
                                type="checkbox"
                                checked={selectedUserIds.has(row.userId)}
                                onChange={() => toggleSelected(row.userId)}
                                className="accent-red-600"
                              />
                            )}
                          </td>
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
                          <td className="px-6 py-3 text-gray-500">{row.lastLogin ? formatDate(row.lastLogin) : 'Never'}</td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => openManageAccess(row)}
                              className="text-sm text-[#C9A227] hover:underline whitespace-nowrap"
                            >
                              Manage Access
                            </button>
                          </td>
                        </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

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

      {manageAccessRow && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={closeManageAccess}
        >
          <div className="flex items-start justify-center min-h-full py-8 px-4">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#141d33]">Manage Access</h3>
                <button
                  onClick={closeManageAccess}
                  aria-label="Close"
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{manageAccessRow.email}</p>

              {!selectedWedding ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">Select a wedding:</p>
                  {(manageAccessRow.weddings || []).map((w) => (
                    <button
                      key={w.weddingId}
                      onClick={() => setSelectedWedding(w)}
                      className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 hover:border-[#C9A227] hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-[#141d33]">{w.label}</p>
                      <p className="text-xs text-gray-500">
                        {w.date
                          ? new Date(`${w.date}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'No date set'}
                        {' · Expires '}
                        {w.expiresAt ? formatDate(w.expiresAt) : '—'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <p className="font-medium text-[#141d33]">{selectedWedding.label}</p>
                    <p className="text-xs text-gray-500">
                      Current expiration: {selectedWedding.expiresAt ? formatDate(selectedWedding.expiresAt) : '—'}
                    </p>
                    {manageAccessRow.weddings && manageAccessRow.weddings.length > 1 && (
                      <button
                        onClick={() => setSelectedWedding(null)}
                        className="text-xs text-[#C9A227] hover:underline mt-1"
                      >
                        ← Choose a different wedding
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Quick extend (from current expiration)</label>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => applyPreset(1, 'year')}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
                      >
                        +1 Year
                      </button>
                      <button
                        onClick={() => applyPreset(1, 'month')}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
                      >
                        +1 Month
                      </button>
                      <button
                        onClick={() => applyPreset(1, 'week')}
                        className="text-sm border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50"
                      >
                        +1 Week
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Or set a custom expiration date</label>
                    <input
                      type="date"
                      value={customExpiresAt}
                      onChange={(e) => setCustomExpiresAt(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFreeGrant}
                      onChange={(e) => setIsFreeGrant(e.target.checked)}
                      className="accent-[#141d33]"
                    />
                    Free grant (no payment received)
                  </label>

                  {manageAccessError && <p className="text-sm text-red-600">{manageAccessError}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveAccess}
                      disabled={savingAccess}
                      className="flex-1 bg-[#141d33] text-white py-2 rounded-lg font-semibold hover:bg-[#1e2b4d] disabled:opacity-50"
                    >
                      {savingAccess ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={closeManageAccess}
                      className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={deleting ? undefined : closeDeleteModal}
        >
          <div className="flex items-start justify-center min-h-full py-8 px-4">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#141d33]">
                  {deleteResults ? 'Delete Results' : 'Delete Test Signups'}
                </h3>
                {!deleting && (
                  <button
                    onClick={closeDeleteModal}
                    aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                )}
              </div>

              {!deleteResults ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    This will permanently delete the following {selectedUserIds.size === 1 ? 'signup' : `${selectedUserIds.size} signups`}, including their weddings, vendors, expenses, checklist data, and login accounts. This cannot be undone.
                  </p>

                  <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                    {recentSignups
                      .filter(row => selectedUserIds.has(row.userId))
                      .map(row => {
                        const hasSideB = (row.weddings || []).some(w => w.sideBUserId)
                        return (
                          <div key={row.userId} className="border border-gray-200 rounded-lg px-4 py-3">
                            <p className="font-medium text-[#141d33]">{row.name || '—'}</p>
                            <p className="text-xs text-gray-500">{row.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {row.weddingCount} {row.weddingCount === 1 ? 'wedding' : 'weddings'}
                              {row.totalPaid > 0 && ` · $${row.totalPaid.toLocaleString()} paid`}
                              {hasSideB && ' · Side B account attached'}
                            </p>
                          </div>
                        )
                      })}
                  </div>

                  {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}

                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirmDelete}
                      disabled={deleting}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      onClick={closeDeleteModal}
                      disabled={deleting}
                      className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                    {deleteResults.map(result => {
                      const row = recentSignups.find(r => r.userId === result.userId)
                      const label = row ? `${row.name || '—'} (${row.email})` : result.userId

                      let style = 'bg-gray-50 border-gray-200 text-gray-700'
                      let statusText = result.status
                      if (result.status === 'deleted') {
                        style = 'bg-green-50 border-green-200 text-green-700'
                        statusText = 'Deleted'
                      } else if (result.status === 'skipped_protected') {
                        style = 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        statusText = `Skipped (protected)${result.reason ? ` — ${result.reason}` : ''}`
                      } else if (result.status === 'failed') {
                        style = 'bg-red-50 border-red-200 text-red-700'
                        statusText = `Failed${result.reason ? `: ${result.reason}` : ''}`
                      }

                      return (
                        <div key={result.userId} className={`border rounded-lg px-4 py-3 ${style}`}>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs">{statusText}</p>
                        </div>
                      )
                    })}
                  </div>

                  <button
                    onClick={closeDeleteModal}
                    className="w-full bg-[#141d33] text-white py-2 rounded-lg font-semibold hover:bg-[#1e2b4d]"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}