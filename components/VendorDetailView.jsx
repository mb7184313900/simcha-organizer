function isCouponActive(text, expiration) {
  if (!text) return false
  if (!expiration) return true
  return new Date(`${expiration}T23:59:59`).getTime() >= Date.now()
}

function whatsappLink(number) {
  const digitsOnly = number.replace(/\D/g, '')
  return 'https://wa.me/' + digitsOnly
}

function normalizeUrl(url) {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : 'https://' + url
}

export default function VendorDetailView({ vendor, onTrackStat }) {
  const track = (statType) => {
    if (onTrackStat) onTrackStat(vendor.id, statType)
  }

  const hasRegularCoupon = isCouponActive(vendor.regular_coupon_text, vendor.regular_coupon_expiration)
  const hasExclusiveCoupon = isCouponActive(vendor.exclusive_coupon_text, vendor.exclusive_coupon_expiration)

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {vendor.ad_image_url && (
        <img src={vendor.ad_image_url} alt={vendor.name} className="w-full object-cover" />
      )}

      <div className="p-8">
        <p className="text-xs uppercase tracking-wide text-[#C9A227] font-medium mb-1">
          {vendor.vendor_categories?.name}
        </p>
        <h1 className="text-3xl font-serif text-[#141d33] mb-4">{vendor.name}</h1>

        {vendor.blurb && (
          <p className="text-gray-600 mb-4">{vendor.blurb}</p>
        )}

        {vendor.location && (
          <p className="text-sm text-gray-500 mb-6">📍 {vendor.location}</p>
        )}

        <div className="flex flex-col gap-3">
          {vendor.phone && <a href={'tel:' + vendor.phone} onClick={() => track('phone')} className="inline-flex items-center justify-center gap-2 bg-[#141d33] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1e2b4d] transition-colors">Call {vendor.phone}</a>}

          {vendor.whatsapp && <a href={whatsappLink(vendor.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => track('whatsapp')} className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Message on WhatsApp</a>}

          {vendor.email && <a href={'mailto:' + vendor.email} className="inline-flex items-center justify-center gap-2 border border-[#141d33] text-[#141d33] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Email {vendor.email}</a>}

          {vendor.website && <a href={normalizeUrl(vendor.website)} target="_blank" rel="noopener noreferrer" onClick={() => track('website')} className="inline-flex items-center justify-center gap-2 border border-[#141d33] text-[#141d33] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Visit Website</a>}

          {vendor.instagram && <a href={normalizeUrl(vendor.instagram)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 border border-[#141d33] text-[#141d33] px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Follow on Instagram</a>}

          {hasRegularCoupon && (
            <div className="mt-2 border-2 border-dashed border-[#C9A227] rounded-lg p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-[#C9A227] font-medium mb-1">SimchaPro Member Coupon</p>
              <p className="text-[#141d33] font-medium">{vendor.regular_coupon_text}</p>
            </div>
          )}

          {hasExclusiveCoupon && (
            <div className="mt-2 border-2 border-dashed border-[#C9A227] rounded-lg p-4 text-center">
              <p className="text-xs uppercase tracking-wide text-[#C9A227] font-medium mb-1">Exclusive Member Offer</p>
              <p className="text-[#141d33] font-medium">This vendor offers an exclusive coupon for paid SimchaPro members.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
