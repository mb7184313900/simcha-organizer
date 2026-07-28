'use client'
import { useState, useEffect } from 'react'
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
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [instagram, setInstagram] = useState('')
  const [blurb, setBlurb] = useState('')
  const [selectedLocations, setSelectedLocations] = useState([])
  const [couponText, setCouponText] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

  const handleSubmit = async () => {
    setErrorMessage('')

    if (!name.trim() || !categoryId || !email.trim()) {
      setErrorMessage('Please fill in Business Name, Category, and Email — these are required.')
      return
    }

    setLoading(true)

    let imageUrl = null

    try {
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('vendor-uploads')
          .upload(fileName, photoFile)

        if (uploadError) {
          setErrorMessage('There was a problem uploading your photo. Please try again.')
          setLoading(false)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('vendor-uploads')
          .getPublicUrl(fileName)

        imageUrl = publicUrlData.publicUrl
      }

      const response = await fetch('/api/advertise/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category_id: categoryId,
          phone,
          whatsapp,
          email,
          website,
          instagram,
          blurb,
          location: selectedLocations.join(', '),
          coupon_text: couponText,
          image: imageUrl,
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
            <input
              type="text"
              placeholder="Business Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227] text-[#141d33]"
            >
              <option value="">Category *</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

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
            </div>

            <input
              type="text"
              placeholder="Optional Coupon for SimchaPro Members"
              value={couponText}
              onChange={e => setCouponText(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
            />

            <div>
              <label className="block text-sm text-[#5a5a5a] mb-1">Photo or Flyer (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhotoFile(e.target.files[0])}
                className="w-full text-sm text-[#5a5a5a]"
              />
            </div>

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