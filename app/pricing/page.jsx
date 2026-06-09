'use client';
import { useState } from 'react';

export default function PricingPage() {
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
      <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
      <p className="text-gray-500 mb-10">7-day free trial on all plans</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* One-time */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">One-Time</h2>
          <p className="text-4xl font-bold text-blue-600 mb-1">$99</p>
          <p className="text-gray-400 mb-6">per wedding</p>
          <button
            onClick={() => handleCheckout('one_time')}
            disabled={loading === 'one_time'}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {loading === 'one_time' ? 'Loading...' : 'Get Started'}
          </button>
        </div>

        {/* 6 months */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">6 Months</h2>
          <p className="text-4xl font-bold text-blue-600 mb-1">$29</p>
          <p className="text-gray-400 mb-6">every 6 months</p>
          <button
            onClick={() => handleCheckout('semi_annual')}
            disabled={loading === 'semi_annual'}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {loading === 'semi_annual' ? 'Loading...' : 'Get Started'}
          </button>
        </div>

        {/* Annual */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center border-2 border-blue-600">
          <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full mb-2">Best Value</span>
          <h2 className="text-xl font-bold mb-2">Annual</h2>
          <p className="text-4xl font-bold text-blue-600 mb-1">$49</p>
          <p className="text-gray-400 mb-6">per year</p>
          <button
            onClick={() => handleCheckout('annual')}
            disabled={loading === 'annual'}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            {loading === 'annual' ? 'Loading...' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}