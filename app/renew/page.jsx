'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { getAccessStatus, getActiveWeddingId } from '../../lib/accessControl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Footer from '../../components/Footer';

export default function RenewPage() {
  const [loading, setLoading] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const status = await getAccessStatus(user);
      if (status.isSideB) {
        // Side B should never renew directly -- that would create a
        // separate subscription under their own user_id instead of
        // renewing the wedding owner's (Side A's) subscription.
        router.push('/dashboard');
        return;
      }

      setCheckingAccess(false);
    };
    checkAccess();
  }, []);

  const handleCheckout = async (plan) => {
    setLoading(plan);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/');
      return;
    }

    const weddingId = await getActiveWeddingId(user);
    if (!weddingId) {
      setLoading(null);
      alert('We could not find your wedding. Please contact support.');
      return;
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, user_id: user.id, email: user.email, wedding_id: weddingId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  if (checkingAccess) {
    return <div className="min-h-screen flex items-center justify-center text-blue-900">Loading...</div>;
  }

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
        <h1 className="font-serif text-3xl font-semibold text-[#141d33] mb-2">Renew Your Access</h1>
        <p className="text-[#5a5a5a] mb-10">Choose a renewal plan to continue editing</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* 6 months */}
          <div className="bg-white rounded-lg shadow-sm border border-[#e8e0cc] p-8 flex flex-col items-center">
            <h2 className="font-serif text-xl font-semibold text-[#141d33] mb-2">6 Months</h2>
            <p className="text-5xl font-bold text-[#141d33] mb-1">$29</p>
            <p className="text-[#5a5a5a] mb-6">6 months of access</p>
            <button
              onClick={() => handleCheckout('semi_annual')}
              disabled={loading === 'semi_annual'}
              className="w-full bg-[#141d33] text-white py-3 rounded-md hover:bg-[#1e2a4a] transition-colors font-semibold"
            >
              {loading === 'semi_annual' ? 'Loading...' : 'Renew for 6 Months'}
            </button>
          </div>

          {/* Annual */}
          <div className="bg-[#141d33] rounded-lg shadow-xl border border-[#C9A227]/40 p-8 flex flex-col items-center">
            <span className="text-xs bg-[#C9A227] text-[#141d33] px-3 py-1 rounded-full mb-2 font-semibold">Best Value</span>
            <h2 className="font-serif text-xl font-semibold text-white mb-2">Full Year</h2>
            <p className="text-5xl font-bold text-[#C9A227] mb-1">$49</p>
            <p className="text-[#b8c0d4] mb-6">12 months of access</p>
            <button
              onClick={() => handleCheckout('annual')}
              disabled={loading === 'annual'}
              className="w-full bg-[#C9A227] text-[#141d33] py-3 rounded-md hover:bg-[#dab53a] transition-colors font-semibold"
            >
              {loading === 'annual' ? 'Loading...' : 'Renew for Full Year'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}