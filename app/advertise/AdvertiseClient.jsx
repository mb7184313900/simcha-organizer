'use client'
import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const LOCATIONS = [
  'Boro Park',
  'Lakewood',
  'Monsey',
  'Brooklyn',
  'Flatbush',
  'Crown Heights',
  'Williamsburg',
  'Monroe',
  'Spring Valley',
  'Online/Nationwide',
]

export default function AdvertiseClient() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategoryText, setCustomCategoryText] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [blurb, setBlurb] = useState('')
  const [selectedLocations, setSelectedLocations] = useState([])
  const [customLocations, setCustomLocations] = useState([])
  const [newCustomLocation, setNewCustomLocation] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [flyerFile, setFlyerFile] = useState(null)
  const [regularCouponText, setRegularCouponText] = useState('')
  const [regularCouponExpiration, setRegularCouponExpiration] = useState('')
  const [exclusiveCouponText, setExclusiveCouponText] = useState('')
  const [exclusiveCouponExpiration, setExclusiveCouponExpiration] = useState('')
  const [vendorNoteToAdmin, setVendorNoteToAdmin] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Spam protection: honeypot field, time-trap, and Turnstile captcha
  const [honeypot, setHoneypot] = useState('')
  const [formLoadedAt] = useState(() => Date.now())
  const [turnstileToken, setTurnstileToken] = useState('')
  const turnstileContainerRef = useRef(null)

  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from('vendor_categories')
        .select('id, name')
        .order('sort_order', { ascending: true })
      if (!error && data) {
        setCategories(data)
      }
    }
    loadCategories()
  }, [])

  const toggleLocation = (loc) => {
    setSelectedLocations(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    )
  }

  const addCustomLocation = () => {
    const trimmed = newCustomLocation.trim()
    if (!trimmed) return
    setCustomLocations(prev => [...prev, trimmed])
    setNewCustomLocation('')
  }

  const removeCustomLocation = (index) => {
    setCustomLocations(prev => prev.filter((_, i) => i !== index))
  }

  const handleCategorySelect = (value) => {
    setCategoryId(value)
    if (value) {
      setCustomCategoryText('')
    }
  }

  const handleCustomCategoryChange = (value) => {
    setCustomCategoryText(value)
    if (value) {
      setCategoryId('')
    }
  }

  const uploadToVendorUploads = async (file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('vendor-uploads')
      .upload(fileName, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = supabase.storage
      .from('vendor-uploads')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  }

  const handleSubmit = async () => {
    setErrorMessage('')

    const hasCustomCategory = customCategoryText.trim().length > 0

    if (!name.trim() || (!categoryId && !hasCustomCategory) || !email.trim()) {
      setErrorMessage('Please fill in Business Name, Category, and Email — these are required.')
      return
    }

    if (!turnstileToken) {
      setErrorMessage('Please complete the verification checkbox before submitting.')
      return
    }

    setLoading(true)

    let logoUrl = null
    let flyerUrl = null

    try {
      if (logoFile) {
        try {
          logoUrl = await uploadToVendorUploads(logoFile)
        } catch (uploadError) {
          setErrorMessage('There was a problem uploading your logo. Please try again.')
          setLoading(false)
          return
        }
      }

      if (flyerFile) {
        try {
          flyerUrl = await uploadToVendorUploads(flyerFile)
        } catch (uploadError) {
          setErrorMessage('There was a problem uploading your flyer. Please try again.')
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/advertise/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category_id: hasCustomCategory ? null : categoryId,
          customCategoryText: hasCustomCategory ? customCategoryText.trim() : null,
          phone,
          whatsapp,
          email,
          website,
          instagram,
          blurb,
          location: [...selectedLocations, ...customLocations].join(', '),
          logoUrl,
          flyerUrl,
          regularCouponText,
          regularCouponExpiration: regularCouponExpiration || null,
          exclusiveCouponText,
          exclusiveCouponExpiration: exclusiveCouponExpiration || null,
          vendorNoteToAdmin,
          honeypot,
          formLoadedAt,
          turnstileToken,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setErrorMessage(result.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setErrorMessage('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="bg-white p-10 rounded-lg shadow-sm border border-[#e8e0cc] max-w-md text-center">
            <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-4">Thank you!</h1>
            <p className="text-[#5a5a5a]">
              Your listing is pending approval. We will review it and be in touch soon.
            </p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.turnstile && turnstileContainerRef.current) {
            window.turnstile.render(turnstileContainerRef.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
              callback: (token) => setTurnstileToken(token),
              'expired-callback': () => setTurnstileToken(''),
            })
          }
        }}
      />
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-[#e8e0cc] w-full max-w-xl">
          <h1 className="font-serif text-2xl font-semibold text-[#141d33] mb-2">
            Advertise in the Simcha Magazine
          </h1>
          <p className="text-[#5a5a5a] mb-6">
            Listings are free for now. Submit your business below and we'll review it shortly.
          </p>

          <div className="space-y-4">
            {/* Honeypot field — hidden from real users, catches bots that fill every input */}
            <input
              type="text"
              name="company_website_2"
              value={honeypot}
              onChange={e => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
            />

            <input
              type="text"
              placeholder="Business Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <div>
              <select
                value={categoryId}
                onChange={e => handleCategorySelect(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-[#141d33]"
              >
                <option value="">Category *</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowCustomCategory(v => !v)}
                className="mt-2 text-sm text-[#141d33] underline hover:text-[#C9A227] transition-colors"
              >
                Don't see your category? Add your own
              </button>

              {showCustomCategory && (
                <input
                  type="text"
                  placeholder="Enter your category"
                  value={customCategoryText}
                  onChange={e => handleCustomCategoryChange(e.target.value)}
                  className="mt-2 w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              )}
            </div>

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <input
              type="text"
              placeholder="WhatsApp Number"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <input
              type="email"
              placeholder="Email Address *"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <input
              type="text"
              placeholder="Website"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <input
              type="text"
              placeholder="Instagram Link"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <textarea
              placeholder="Short Description / Blurb"
              value={blurb}
              onChange={e => setBlurb(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <div>
              <label className="block text-sm text-[#5a5a5a] mb-2">Location (optional — select all that apply)</label>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map(loc => (
                  <label key={loc} className="flex items-center gap-2 text-sm text-[#141d33]">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                    />
                    {loc}
                  </label>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  placeholder="Add custom location"
                  value={newCustomLocation}
                  onChange={e => setNewCustomLocation(e.target.value)}
                  className="flex-1 min-w-0 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
                <button
                  type="button"
                  onClick={addCustomLocation}
                  className="shrink-0 bg-[#141d33] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1e2a4a] transition-colors"
                >
                  Add
                </button>
              </div>

              {customLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {customLocations.map((loc, index) => (
                    <span
                      key={`${loc}-${index}`}
                      className="inline-flex items-center gap-2 bg-[#141d33]/5 text-[#141d33] text-sm px-3 py-1 rounded-full border border-[#141d33]/10"
                    >
                      {loc}
                      <button
                        type="button"
                        onClick={() => removeCustomLocation(index)}
                        aria-label={`Remove ${loc}`}
                        className="text-[#5a5a5a] hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-gray-200 rounded-md p-4 space-y-2">
              <p className="text-sm font-semibold text-[#141d33]">Regular Coupon (visible to everyone)</p>
              <input
                type="text"
                placeholder="Coupon text"
                value={regularCouponText}
                onChange={e => setRegularCouponText(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Expiration date (optional)</label>
                <input
                  type="date"
                  value={regularCouponExpiration}
                  onChange={e => setRegularCouponExpiration(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-md p-4 space-y-2">
              <p className="text-sm font-semibold text-[#141d33]">Exclusive Coupon (visible to paid SimchaPro members only)</p>
              <p className="text-xs text-[#5a5a5a]">
                This coupon text will never be shown publicly — only a note that an exclusive offer exists.
              </p>
              <input
                type="text"
                placeholder="Coupon text"
                value={exclusiveCouponText}
                onChange={e => setExclusiveCouponText(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Expiration date (optional)</label>
                <input
                  type="date"
                  value={exclusiveCouponExpiration}
                  onChange={e => setExclusiveCouponExpiration(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#5a5a5a] mb-1">Anything you'd like us to know? (optional)</label>
              <textarea
                placeholder="Special instructions, questions, or context for our team"
                value={vendorNoteToAdmin}
                onChange={e => setVendorNoteToAdmin(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#5a5a5a] mb-1">Logo (shown on your directory tile)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setLogoFile(e.target.files[0])}
                className="w-full text-sm text-[#5a5a5a]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#5a5a5a] mb-1">Flyer or Ad Image (shown on your detail page)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFlyerFile(e.target.files[0])}
                className="w-full text-sm text-[#5a5a5a]"
              />
            </div>

            <div ref={turnstileContainerRef} />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#141d33] text-white py-3 rounded-md font-semibold hover:bg-[#1e2a4a] transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </div>

          {errorMessage && <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>}
        </div>
      </div>
      <Footer />
    </main>
  )
}
