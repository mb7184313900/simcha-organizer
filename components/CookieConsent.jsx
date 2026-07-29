'use client';

import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141d33] text-white px-6 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#b8c0d4] text-sm text-center md:text-left">
          We use cookies to improve your experience. By continuing to use this site, you agree to our{' '}
          <a href="/privacy" className="text-[#C9A227] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 bg-[#C9A227] hover:bg-[#b8922e] text-[#141d33] text-sm font-semibold px-5 py-2 rounded-md transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
