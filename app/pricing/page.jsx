import PricingClient from './PricingClient';

export const metadata = {
  title: 'Pricing | Simcha Planner & Wedding Budget Tracker | SimchaPro',
  description: 'Simple, transparent pricing for SimchaPro — $99 one-time for full year access to the Simcha Checklist, Expense Tracker, and Simcha Magazine. 7-day free trial included.',
  openGraph: {
    title: 'Pricing | Simcha Planner & Wedding Budget Tracker',
    description: '$99 one-time for full year access to the Simcha Checklist, Expense Tracker, and Simcha Magazine. 7-day free trial included.',
    url: 'https://simchapro.com/pricing',
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

export default function PricingPage() {
  return <PricingClient />;
}
