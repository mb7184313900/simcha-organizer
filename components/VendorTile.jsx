import Link from 'next/link'
import { hasActiveCoupon } from '../lib/couponHelpers'

export default function VendorTile({ vendor, href }) {
  const hasCoupon = hasActiveCoupon(vendor, 'regular')

  return (
    <Link
      href={href}
      className="group relative block w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
    >
      {hasCoupon && (
        <span className="absolute top-2 right-2 z-10 bg-[#C9A227] text-[#141d33] text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full shadow">
          Coupon available
        </span>
      )}
      {vendor.thumbnail_image_url ? (
        <img
          src={vendor.thumbnail_image_url}
          alt={vendor.name}
          className="w-full h-40 object-contain bg-gray-100"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100" />
      )}
      <div className="p-5">
        <h2 className="text-lg font-serif text-[#141d33] group-hover:text-[#C9A227] transition-colors">
          {vendor.name}
        </h2>
      </div>
    </Link>
  )
}
