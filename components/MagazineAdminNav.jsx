'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Categories', href: '/admin/magazine/categories' },
  { label: 'Vendors', href: '/admin/magazine/vendors' },
  { label: 'Articles', href: '/admin/magazine/articles' },
  { label: 'Coupons', href: '/admin/magazine/coupons' },
]

export default function MagazineAdminNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              isActive
                ? 'bg-[#141d33] text-white border-[#141d33]'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}