'use client';
import { useState } from 'react';

export default function Home() {
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);
  const [showMagazinePopup, setShowMagazinePopup] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* Budget Popup */}
      {showBudgetPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowBudgetPopup(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Paid Subscribers Only</h3>
            <p className="text-gray-500 text-sm mb-6">The Budget Organizer is available to SimchaPro subscribers. Log in or sign up to get started.</p>
            <div className="flex flex-col gap-3">
              <a href="/login" className="block bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800">Log In</a>
              <a href="/signup" className="block border border-blue-900 text-blue-900 py-3 rounded-xl font-bold hover:bg-blue-50">Sign Up</a>
            </div>
            <button onClick={() => setShowBudgetPopup(false)} className="mt-4 text-sm text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Magazine Popup */}
      {showMagazinePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMagazinePopup(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">🎊</div>
            <h3 className="text-xl font-bold text-blue-900 mb-2">Coming Soon!</h3>
            <p className="text-gray-500 text-sm mb-6">Simcha Magazine is on its way — exclusive deals and coupons from top simcha vendors, only for our members.</p>
            <button onClick={() => setShowMagazinePopup(false)} className="bg-blue-900 text-white py-3 px-8 rounded-xl font-bold hover:bg-blue-800">Got It</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">SimchaPro</h1>
        <nav className="flex gap-6">
          <a href="/checklist" className="hover:text-yellow-300">Checklist</a>
          <a href="/budget" className="hover:text-yellow-300">Organizer</a>
          <a href="#" className="hover:text-yellow-300">Magazine</a>
          <a href="/login" className="hover:text-yellow-300">Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-800 text-white text-center py-24 px-6">
        <h2 className="text-5xl font-bold mb-4">Plan Your Simcha With Confidence</h2>
        <p className="text-xl mb-8 text-blue-200">The complete guide and organizer for the heimish community</p>
        <div className="flex justify-center gap-4">
          <a href="/signup" className="bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-yellow-300">
            Start Free Trial
          </a>
          <a href="#pricing" className="border border-white px-8 py-3 rounded-lg hover:bg-blue-700">
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center text-blue-900 mb-12">Everything You Need For Your Simcha</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a href="/checklist" className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <h4 className="text-xl font-bold mb-2">Simcha Checklist</h4>
            <p className="text-gray-600">Practical checklists for every stage — Lchaim, Tenaim, Wedding, Sheva Brachos and more</p>
          </a>
          <div onClick={() => setShowBudgetPopup(true)} className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="text-xl font-bold mb-2">Budget Organizer</h4>
            <p className="text-gray-600">Track shared expenses between both families, manage vendors, and stay on budget</p>
          </div>
          <div onClick={() => setShowMagazinePopup(true)} className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="text-4xl mb-4">🎊</div>
            <h4 className="text-xl font-bold mb-2">Simcha Magazine</h4>
            <p className="text-gray-600">Exclusive deals and coupons from top simcha vendors, only for our members</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20 px-6 text-center">
        <h3 className="text-3xl font-bold text-blue-900 mb-4">Simple Pricing</h3>
        <p className="text-gray-600 mb-12">Start free, pay only when you are ready</p>
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="bg-blue-900 text-white rounded-xl p-8 w-72 shadow-sm">
            <h4 className="text-xl font-bold mb-2">Full Access</h4>
            <p className="text-4xl font-bold mb-2">$99<span className="text-lg text-blue-300"> one-time</span></p>
            <p className="text-blue-300 mb-6">7-day free trial included</p>
            <ul className="text-left text-sm text-blue-200 mb-6 space-y-2">
              <li>✓ Full year of access</li>
              <li>✓ Simcha Checklist</li>
              <li>✓ Budget Organizer</li>
              <li>✓ Simcha Magazine</li>
            </ul>
            <a href="/pricing" className="block bg-yellow-400 text-blue-900 font-bold py-3 rounded-lg hover:bg-yellow-300">Start Free Trial</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-blue-300 text-sm">© 2026 SimchaPro. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="/contact" className="text-blue-200 hover:text-yellow-300 text-sm">
              Contact
            </a>
            <a href="mailto:info@simchapro.com" className="text-blue-200 hover:text-yellow-300 text-sm">
              info@simchapro.com
            </a>
            <a
              href="https://wa.me/19292443318"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.876.514 3.634 1.41 5.144L2 22l4.955-1.379A9.947 9.947 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.153a8.116 8.116 0 01-4.145-1.135l-.297-.176-3.075.856.83-3.007-.194-.309a8.116 8.116 0 01-1.256-4.35c0-4.492 3.654-8.146 8.147-8.146 4.492 0 8.146 3.654 8.146 8.146-.001 4.493-3.655 8.147-8.146 8.147z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}