import { supabase } from '../../../../../lib/supabase'
import VendorClient from './VendorClient'

// This runs on the server before the page loads, so link previews on
// WhatsApp, Facebook, iMessage, etc. can show the specific vendor's
// name and ad image instead of a generic SimchaPro logo.
export async function generateMetadata({ params }) {
  const { vendorId } = await params

  const { data: vendor } = await supabase
    .from('magazine_vendors')
    .select('name, ad_image_url, thumbnail_image_url, blurb, vendor_categories(name)')
    .eq('id', vendorId)
    .eq('is_published', true)
    .maybeSingle()

  if (!vendor) {
    return {
      title: 'Simcha Magazine | SimchaPro',
    }
  }

  const previewImage = vendor.ad_image_url || vendor.thumbnail_image_url
  const description = vendor.blurb || `${vendor.name} — ${vendor.vendor_categories?.name || 'Vendor'} on Simcha Magazine`

  return {
    title: `${vendor.name} | Simcha Magazine`,
    description,
    openGraph: {
      title: vendor.name,
      description,
      images: previewImage ? [{ url: previewImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: vendor.name,
      description,
      images: previewImage ? [previewImage] : [],
    },
  }
}

export default function VendorDetailPage() {
  return <VendorClient />
}