import LoginClient from './LoginClient';

export const metadata = {
  title: 'Log In | SimchaPro Wedding Planner',
  description: 'Sign in to your SimchaPro account to access your simcha checklist, expense tracker, and wedding planning tools.',
  openGraph: {
    title: 'Log In | SimchaPro Wedding Planner',
    description: 'Sign in to your SimchaPro account to access your simcha checklist, expense tracker, and wedding planning tools.',
    url: 'https://simchapro.com/login',
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

export default function LoginPage() {
  return <LoginClient />;
}
