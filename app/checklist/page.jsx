import ChecklistClient from './ChecklistClient';

export const metadata = {
  title: 'Free Simcha Checklist | Jewish Wedding Planning Checklist | SimchaPro',
  description: 'Plan every stage of your simcha with our free wedding checklist — from Lchaim and Tnaim through the Chuppah and Sheva Brochos. Built for the frum and heimish community.',
  openGraph: {
    title: 'Free Simcha Checklist | Jewish Wedding Planning Checklist',
    description: 'Plan every stage of your simcha with our free wedding checklist — from Lchaim and Tnaim through the Chuppah and Sheva Brochos.',
    url: 'https://simchapro.com/checklist',
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

export default function ChecklistPage() {
  return <ChecklistClient />;
}
