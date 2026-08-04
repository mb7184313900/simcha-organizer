'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import Script from 'next/script'
import { supabase } from '../../lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import VendorTile from '../../components/VendorTile'
import VendorDetailView from '../../components/VendorDetailView'
import { LOCATIONS } from '../../lib/vendorLocations'

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
  const [regularCouponPercentOff, setRegularCouponPercentOff] = useState(false)
  const [regularCouponPercentValue, setRegularCouponPercentValue] = useState('')
  const [regularCouponDollarOff, setRegularCouponDollarOff] = useState(false)
  const [regularCouponDollarValue, setRegularCouponDollarValue] = useState('')
  const [regularCouponSpecialOffer, setRegularCouponSpecialOffer] = useState('')
  const [regularCouponTerms, setRegularCouponTerms] = useState('')
  const [regularCouponCode, setRegularCouponCode] = useState('')
  const [regularCouponExpiration, setRegularCouponExpiration] = useState('')
  const [exclusiveCouponPercentOff, setExclusiveCouponPercentOff] = useState(false)
  const [exclusiveCouponPercentValue, setExclusiveCouponPercentValue] = useState('')
  const [exclusiveCouponDollarOff, setExclusiveCouponDollarOff] = useState(false)
  const [exclusiveCouponDollarValue, setExclusiveCouponDollarValue] = useState('')
  const [exclusiveCouponSpecialOffer, setExclusiveCouponSpecialOffer] = useState('')
  const [exclusiveCouponTerms, setExclusiveCouponTerms] = useState('')
  const [exclusiveCouponCode, setExclusiveCouponCode] = useState('')
  const [exclusiveCouponExpiration, setExclusiveCouponExpiration] = useState('')
  const [vendorNoteToAdmin, setVendorNoteToAdmin] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

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

  // Local object URLs so the preview can show the logo/flyer before they're uploaded
  const logoPreviewUrl = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : null), [logoFile])
  const flyerPreviewUrl = useMemo(() => (flyerFile ? URL.createObjectURL(flyerFile) : null), [flyerFile])

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl)
    }
  }, [logoPreviewUrl])

  useEffect(() => {
    return () => {
      if (flyerPreviewUrl) URL.revokeObjectURL(flyerPreviewUrl)
    }
  }, [flyerPreviewUrl])

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
          regularCouponPercentOff,
          regularCouponPercentValue,
          regularCouponDollarOff,
          regularCouponDollarValue,
          regularCouponSpecialOffer,
          regularCouponTerms,
          regularCouponCode,
          regularCouponExpiration: regularCouponExpiration || null,
          exclusiveCouponPercentOff,
          exclusiveCouponPercentValue,
          exclusiveCouponDollarOff,
          exclusiveCouponDollarValue,
          exclusiveCouponSpecialOffer,
          exclusiveCouponTerms,
          exclusiveCouponCode,
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

  // Preview reflects whatever's currently in the form, blanks and all — no validation
  const previewCategoryName = customCategoryText.trim()
    ? customCategoryText.trim()
    : (categories.find(c => c.id === categoryId)?.name || '')

  const previewLocation = [...selectedLocations, ...customLocations].join(', ')

  const previewTileVendor = {
    name: name || 'Your Business Name',
    thumbnail_image_url: logoPreviewUrl,
    regular_coupon_expiration: regularCouponExpiration,
  }

  const previewDetailVendor = {
    id: 'preview',
    name: name || 'Your Business Name',
    vendor_categories: { name: previewCategoryName },
    blurb,
    location: previewLocation,
    phone,
    whatsapp,
    email,
    website,
    instagram,
    ad_image_url: flyerPreviewUrl,
    regular_coupon_expiration: regularCouponExpiration,
    exclusive_coupon_expiration: exclusiveCouponExpiration,
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

            <div className="border border-gray-200 rounded-md p-4 space-y-3">
              <p className="text-sm font-semibold text-[#141d33]">Regular Coupon (visible to everyone)</p>

              <div>
                <label className="flex items-center gap-2 text-sm text-[#141d33]">
                  <input
                    type="checkbox"
                    checked={regularCouponPercentOff}
                    onChange={e => setRegularCouponPercentOff(e.target.checked)}
                  />
                  Offer a percentage off
                </label>
                {regularCouponPercentOff && (
                  <div className="mt-2">
                    <label className="block text-xs text-[#5a5a5a] mb-1">How much? (e.g. 10 for 10% off)</label>
                    <input
                      type="number"
                      value={regularCouponPercentValue}
                      onChange={e => setRegularCouponPercentValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-[#141d33]">
                  <input
                    type="checkbox"
                    checked={regularCouponDollarOff}
                    onChange={e => setRegularCouponDollarOff(e.target.checked)}
                  />
                  Offer a dollar amount off
                </label>
                {regularCouponDollarOff && (
                  <div className="mt-2">
                    <label className="block text-xs text-[#5a5a5a] mb-1">How much? (e.g. 15 for $15 off)</label>
                    <input
                      type="number"
                      value={regularCouponDollarValue}
                      onChange={e => setRegularCouponDollarValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Special offer (optional)</label>
                <p className="text-xs text-[#5a5a5a] mb-1">
                  Use this for anything that doesn't fit above — like "Buy one get one free" or "Free upgrade with any package".
                </p>
                <input
                  type="text"
                  value={regularCouponSpecialOffer}
                  onChange={e => setRegularCouponSpecialOffer(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Terms (optional)</label>
                <p className="text-xs text-[#5a5a5a] mb-1">
                  Any conditions for this offer, e.g. "Valid on purchases over $200" or "Weekends only".
                </p>
                <input
                  type="text"
                  value={regularCouponTerms}
                  onChange={e => setRegularCouponTerms(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Coupon code (optional)</label>
                <p className="text-xs text-[#5a5a5a] mb-1">
                  Only needed if customers redeem this on your website at checkout.
                </p>
                <input
                  type="text"
                  value={regularCouponCode}
                  onChange={e => setRegularCouponCode(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

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

            <div className="border border-gray-200 rounded-md p-4 space-y-3">
              <p className="text-sm font-semibold text-[#141d33]">Exclusive Coupon (visible to paid SimchaPro members only)</p>
              <p className="text-xs text-[#5a5a5a]">
                This coupon text will never be shown publicly — only a note that an exclusive offer exists.
              </p>

              <div>
                <label className="flex items-center gap-2 text-sm text-[#141d33]">
                  <input
                    type="checkbox"
                    checked={exclusiveCouponPercentOff}
                    onChange={e => setExclusiveCouponPercentOff(e.target.checked)}
                  />
                  Offer a percentage off
                </label>
                {exclusiveCouponPercentOff && (
                  <div className="mt-2">
                    <label className="block text-xs text-[#5a5a5a] mb-1">How much? (e.g. 10 for 10% off)</label>
                    <input
                      type="number"
                      value={exclusiveCouponPercentValue}
                      onChange={e => setExclusiveCouponPercentValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-[#141d33]">
                  <input
                    type="checkbox"
                    checked={exclusiveCouponDollarOff}
                    onChange={e => setExclusiveCouponDollarOff(e.target.checked)}
                  />
                  Offer a dollar amount off
                </label>
                {exclusiveCouponDollarOff && (
                  <div className="mt-2">
                    <label className="block text-xs text-[#5a5a5a] mb-1">How much? (e.g. 15 for $15 off)</label>
                    <input
                      type="number"
                      value={exclusiveCouponDollarValue}
                      onChange={e => setExclusiveCouponDollarValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Special offer (optional)</label>
                <p className="text-xs text-[#5a5a5a] mb-1">
                  Use this for anything that doesn't fit above — like "Buy one get one free" or "Free upgrade with any package".
                </p>
                <input
                  type="text"
                  value={exclusiveCouponSpecialOffer}
                  onChange={e => setExclusiveCouponSpecialOffer(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Terms (optional)</label>
                <p className="text-xs text-[#5a5a5a] mb-1">
                  Any conditions for this offer, e.g. "Valid on purchases over $200" or "Weekends only".
                </p>
                <input
                  type="text"
                  value={exclusiveCouponTerms}
                  onChange={e => setExclusiveCouponTerms(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#5a5a5a] mb-1">Coupon code (optional)</label>
                <p className="text-xs text-[#5a5a5a] mb-1">
                  Only needed if customers redeem this on your website at checkout.
                </p>
                <input
                  type="text"
                  value={exclusiveCouponCode}
                  onChange={e => setExclusiveCouponCode(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                />
              </div>

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
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full border border-[#141d33] text-[#141d33] py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors"
            >
              Preview Listing
            </button>

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

      {showPreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div className="flex items-start justify-center min-h-full py-8 px-4">
            <div
              className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#141d33]">Listing Preview</h3>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  aria-label="Close preview"
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                    How your tile will look in the category directory
                  </p>
                  <div className="max-w-xs pointer-events-none">
                    <VendorTile vendor={previewTileVendor} href="#" />
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                    How your full listing will look
                  </p>
                  <VendorDetailView vendor={previewDetailVendor} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="mt-6 w-full border border-gray-300 text-gray-600 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
