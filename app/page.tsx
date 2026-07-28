import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'SimchaPro | Jewish Wedding Planner & Simcha Checklist for the Frum Community',
  description: 'The complete simcha planner for the heimish and frum community. Organize your Chosson and Kallah planning with our wedding checklist, budget tracker, and vendor directory — built for Jewish weddings.',
  verification: {
    google: 'fmegRSGlrJkH1p3UgPLCrCuJp0X3Ybkn5Mcl9S-TX2A',
  },
  openGraph: {
    title: 'SimchaPro | Jewish Wedding Planner & Simcha Checklist',
    description: 'The complete simcha planner for the heimish and frum community. Organize your Chosson and Kallah planning with our wedding checklist, budget tracker, and vendor directory.',
    url: 'https://simchapro.com/',
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SimchaPro',
  url: 'https://simchapro.com',
  logo: 'https://simchapro.com/assets/logo/simchapro-logo-gold-transparent.png',
  description: 'The complete simcha planning platform for the heimish and frum Jewish community.',
  email: 'info@simchapro.com',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'SimchaPro',
  url: 'https://simchapro.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://simchapro.com/magazine/vendors?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SimchaPro',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '99.00',
    priceCurrency: 'USD',
  },
  description: 'A simcha planning platform for the heimish and frum Jewish community, featuring a wedding checklist, expense tracker, and vendor directory.',
  url: 'https://simchapro.com',
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <HomeClient />
    </>
  );
}
