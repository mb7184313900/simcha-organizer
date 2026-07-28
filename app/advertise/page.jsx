import AdvertiseClient from './AdvertiseClient';

export const metadata = {
  title: 'Advertise Your Business | Simcha Magazine Vendor Directory | SimchaPro',
  description: 'List your business in the SimchaPro Simcha Magazine and reach families planning Jewish weddings in the frum and heimish community. Free listings available now.',
  openGraph: {
    title: 'Advertise Your Business | Simcha Magazine Vendor Directory',
    description: 'List your business in the SimchaPro Simcha Magazine and reach families planning Jewish weddings in the frum and heimish community.',
    url: 'https://simchapro.com/advertise',
    siteName: 'SimchaPro',
    images: [
      {
        url: 'https://simchapro.com/assets/logo/simchapro-logo-gold-transparent.png',
        width: 1200,
        height: 630,
        alt: 'SimchaPro',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function AdvertisePage() {
  return <AdvertiseClient />;
}
