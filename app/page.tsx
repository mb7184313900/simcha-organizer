import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'SimchaPro | Jewish Wedding Planner & Simcha Checklist for the Frum Community',
  description: 'The complete simcha planner for the heimish and frum community. Organize your Chosson and Kallah planning with our wedding checklist, budget tracker, and vendor directory — built for Jewish weddings.',
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

export default function Home() {
  return <HomeClient />;
}
