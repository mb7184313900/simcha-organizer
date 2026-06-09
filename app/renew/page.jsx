'use client';
import { useState } from 'react';

export default function RenewPage() {
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (plan) => {
    setLoading(plan);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Renew Your Access</h1>
      <p className="text-gray-500 mb-10">Choose a renewal plan to continue editing</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* 6 months */}
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">6 Months</h2>
          <p className="text-5xl font-bold text-blue-600 mb-1">$29</p>
          <p className="text-gray-400 mb-6">6 months of access</p>
          <button
            onClick={() => handleCheckout('semi_annual')}
            disabled={loading === 'semi_annual'}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            {loading === 'semi_annual' ? 'Loading...' : 'Renew for 6 Months'}
          </button>
        </div>

        {/* Annual */}
        <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center border-2 border-blue-600">
          <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full mb-2">Best Value</span>
          <h2 className="text-xl font-bold mb-2">Full Year</h2>
          <p className="text-5xl font-bold text-blue-600 mb-1">$49</p>
          <p className="text-gray-400 mb-6">12 months of access</p>
          <button
            onClick={() => handleCheckout('annual')}
            disabled={loading === 'annual'}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
          >
            {loading === 'annual' ? 'Loading...' : 'Renew for Full Year'}
          </button>
        </div>
      </div>
    </div>
  );
}