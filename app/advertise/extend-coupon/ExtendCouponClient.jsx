'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'

export default function ExtendCouponClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const type = searchParams.get('type') === 'exclusive' ? 'exclusive' : 'regular'

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [vendorName, setVendorName] = useState('')
  const [couponText, setCouponText] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setNotFound(true)
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/advertise/extend-coupon?token=${encodeURIComponent(token)}&type=${type}`)
        const result = await res.json()

        if (!res.ok) {
          setNotFound(true)
        } else {
          setVendorName(result.vendorName)
          setCouponText(result.couponText)
          setExpirationDate(result.expirationDate)
        }
      } catch (err) {
        setNotFound(true)
      }

      setLoading(false)
    }
    load()
  }, [token, type])

  const handleSubmit = async () => {
    setErrorMessage('')

    if (!couponText.trim()) {
      setErrorMessage('Please enter your coupon text.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/advertise/extend-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type, couponText, expirationDate: expirationDate || null }),
      })

      const result = await res.json()

      if (!res.ok) {
        setErrorMessage(result.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.')
    }

    setSubmitting(false)
  }

  const label = type === 'exclusive' ? 'Exclusive' : 'Regular'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141d33]">
        <p className="text-[#C9A227] font-serif text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-xl">
          {notFound ? (
            <>
              <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Link Not Valid</h1>
              <p className="text-[#5a5a5a]">This link is invalid or has expired.</p>
            </>
          ) : submitted ? (
            <>
              <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">Thank you!</h1>
              <p className="text-[#5a5a5a]">Your coupon update is pending admin approval.</p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">
                Extend Your {label} Coupon
              </h1>
              <p className="text-[#5a5a5a] mb-6">
                Update the coupon text or expiration date for {vendorName}. Your update will be reviewed before it goes live.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#5a5a5a] mb-1">Coupon Text</label>
                  <input
                    type="text"
                    value={couponText}
                    onChange={e => setCouponText(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#5a5a5a] mb-1">Expiration Date (optional)</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={e => setExpirationDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Update'}
                </button>
              </div>

              {errorMessage && <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>}
            </>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
