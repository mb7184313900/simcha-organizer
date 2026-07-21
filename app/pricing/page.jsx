'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getActiveWeddingId } from '../../lib/accessControl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '../../components/Footer';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const weddingId = await getActiveWeddingId(user);
    if (!weddingId) {
      setLoading(false);
      alert('We could not find your wedding. Please contact support.');
      return;
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'one_time', user_id: user.id, email: user.email, wedding_id: weddingId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <a href="/" className="mb-6">
          <Image
            src="/images/logo.png"
            alt="SimchaPro"
            width={160}
            height={230}
            priority
            className="h-16 w-auto"
          />
        </a>
        <h1 className="font-serif text-3xl font-semibold text-[#141d33] mb-2">Get Started</h1>
        <p className="text-[#5a5a5a] mb-10">7-day free trial, then $99 for full year access</p>

        <div className="bg-[#141d33] rounded-lg shadow-xl border border-[#C9A227]/20 p-10 flex flex-col items-center max-w-sm w-full">
          <h2 className="font-serif text-xl font-semibold text-white mb-2">Full Access</h2>
          <p className="text-5xl font-bold text-[#C9A227] mb-1">$99</p>
          <p className="text-[#b8c0d4] mb-2">one-time payment</p>
          <p className="text-sm text-[#C9A227] font-medium mb-6">✓ 7-day free trial included</p>
          <ul className="text-[#d8dce8] text-sm mb-8 space-y-2 w-full">
            <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Full year of access</li>
            <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Simcha Checklist</li>
            <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Budget Organizer</li>
            <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Simcha Magazine</li>
          </ul>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-[#C9A227] text-[#141d33] py-3 rounded-md hover:bg-[#dab53a] transition-colors font-semibold"
          >
            {loading ? 'Loading...' : 'Start Free Trial'}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}