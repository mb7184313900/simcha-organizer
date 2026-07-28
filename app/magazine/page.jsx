import MagazineClient from './MagazineClient';

export const metadata = {
  title: 'Simcha Magazine | Jewish Wedding Vendors, Articles & Coupons | SimchaPro',
  description: 'Explore the Simcha Magazine — articles, a trusted vendor directory, and exclusive coupons for Jewish wedding planning. Find halls, photographers, catering, and more for your simcha.',
  openGraph: {
    title: 'Simcha Magazine | Jewish Wedding Vendors, Articles & Coupons',
    description: 'Articles, a trusted vendor directory, and exclusive coupons for Jewish wedding planning — halls, photographers, catering, and more.',
    url: 'https://simchapro.com/magazine',
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

export default function MagazinePage() {
  return <MagazineClient />;
}
