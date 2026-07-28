import SignupClient from './SignupClient';

export const metadata = {
  title: 'Sign Up | Start Your Free Trial | SimchaPro Wedding Planner',
  description: 'Create your SimchaPro account and start your 7-day free trial. Plan your Jewish wedding with our simcha checklist, budget tracker, and vendor directory.',
  openGraph: {
    title: 'Sign Up | Start Your Free Trial | SimchaPro',
    description: 'Create your SimchaPro account and start your 7-day free trial. Plan your Jewish wedding with our simcha checklist, budget tracker, and vendor directory.',
    url: 'https://simchapro.com/signup',
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

export default function SignupPage() {
  return <SignupClient />;
}
