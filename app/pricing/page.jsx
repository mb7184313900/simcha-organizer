'use client';
import { useState } from 'react';

export default function PricingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'one_time' }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-2">Get Started</h1>
      <p className="text-gray-500 mb-10">7-day free trial, then $99 for full year access</p>

      <div className="bg-white rounded-2xl shadow p-10 flex flex-col items-center max-w-sm w-full">
        <h2 className="text-xl font-bold mb-2">Full Access</h2>
        <p className="text-5xl font-bold text-blue-600 mb-1">$99</p>
        <p className="text-gray-400 mb-2">one-time payment</p>
        <p className="text-sm text-green-600 font-medium mb-6">✓ 7-day free trial included</p>
        <ul className="text-gray-600 text-sm mb-8 space-y-2 w-full">
          <li>✓ Full year of access</li>
          <li>✓ Simcha Guide</li>
          <li>✓ Budget Organizer</li>
          <li>✓ Simcha Magazine</li>
        </ul>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold"
        >
          {loading ? 'Loading...' : 'Start Free Trial'}
        </button>
      </div>
    </div>
  );
}