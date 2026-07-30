'use client';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default function HomeClient() {
  const [showBudgetPopup, setShowBudgetPopup] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAF7F0]">
      {/* Budget Popup */}
      {showBudgetPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowBudgetPopup(false)}>
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-sm w-full text-center border border-[#C9A227]/20" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#141d33]/5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" className="w-6 h-6">
                <rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            </div>
            <h3 className="font-serif text-xl font-semibold text-[#141d33] mb-2">Subscribers Only</h3>
            <p className="text-[#5a5a5a] text-sm mb-6 leading-relaxed">The Expense Tracker is available to SimchaPro subscribers. Log in or sign up to get started.</p>
            <div className="flex flex-col gap-3">
              <a href="/login" className="block bg-[#141d33] text-white py-3 rounded-md font-medium hover:bg-[#1e2a4a] transition-colors">Log In</a>
              <a href="/signup" className="block border border-[#141d33] text-[#141d33] py-3 rounded-md font-medium hover:bg-[#141d33]/5 transition-colors">Sign Up</a>
            </div>
            <button onClick={() => setShowBudgetPopup(false)} className="mt-4 text-sm text-[#9a9a9a] hover:text-[#5a5a5a]">Cancel</button>
          </div>
        </div>
      )}

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#141d33] to-[#1c2947] text-white text-center py-28 px-6">
        <h2 className="font-serif text-5xl md:text-6xl font-semibold mb-6 leading-tight">
          Plan Your Simcha<br />With Confidence
        </h2>
        <div className="w-16 h-px bg-[#C9A227] mx-auto mb-6" />
        <p className="text-lg mb-10 text-[#b8c0d4] max-w-xl mx-auto">
          The complete guide and organizer for the heimish community
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a href="/signup" className="bg-[#C9A227] text-[#141d33] font-semibold px-8 py-3 rounded-md hover:bg-[#dab53a] transition-colors">
            Start Free Trial
          </a>
          <a href="#pricing" className="border border-[#b8c0d4]/40 text-white px-8 py-3 rounded-md hover:border-[#C9A227] hover:text-[#C9A227] transition-colors">
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h3 className="font-serif text-3xl font-semibold text-center text-[#141d33] mb-2">Everything You Need For Your Simcha</h3>
        <div className="w-16 h-px bg-[#C9A227] mx-auto mb-14" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <a href="/checklist" className="group text-center p-8 bg-white border border-[#e8e0cc] rounded-lg shadow-sm hover:shadow-lg hover:border-[#C9A227] transition-all cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#141d33]/5 flex items-center justify-center group-hover:bg-[#C9A227]/10 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" className="w-6 h-6">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <h4 className="font-serif text-xl font-semibold text-[#141d33] mb-2">Simcha Checklist</h4>
            <p className="text-[#5a5a5a] text-sm leading-relaxed">Practical checklists for every stage — L&apos;chaim, Tenaim, Wedding, Sheva Brachos and more</p>
          </a>
          <div onClick={() => setShowBudgetPopup(true)} className="group text-center p-8 bg-white border border-[#e8e0cc] rounded-lg shadow-sm hover:shadow-lg hover:border-[#C9A227] transition-all cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#141d33]/5 flex items-center justify-center group-hover:bg-[#C9A227]/10 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" className="w-6 h-6">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v10M9 9.5c0-1.5 1.5-2 3-2s3 .8 3 2-1.5 2-3 2-3 .8-3 2 1.5 2 3 2 3-.5 3-2"/>
              </svg>
            </div>
            <h4 className="font-serif text-xl font-semibold text-[#141d33] mb-2">Expense Tracker</h4>
            <p className="text-[#5a5a5a] text-sm leading-relaxed">Track shared expenses between both families, manage vendors, and stay on budget</p>
          </div>
          <a href="/magazine" className="group text-center p-8 bg-white border border-[#e8e0cc] rounded-lg shadow-sm hover:shadow-lg hover:border-[#C9A227] transition-all cursor-pointer block">
            <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[#141d33]/5 flex items-center justify-center group-hover:bg-[#C9A227]/10 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" className="w-6 h-6">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <h4 className="font-serif text-xl font-semibold text-[#141d33] mb-2">Simcha Magazine</h4>
            <p className="text-[#5a5a5a] text-sm leading-relaxed">Exclusive deals and coupons from top simcha vendors, only for our members</p>
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-[#f0ebe0] py-24 px-6 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#141d33] mb-2">Simple Pricing</h3>
        <div className="w-16 h-px bg-[#C9A227] mx-auto mb-4" />
        <p className="text-[#5a5a5a] mb-14">Start free, pay only when you are ready</p>
        <div className="flex justify-center gap-8 flex-wrap">
          <div className="bg-[#141d33] text-white rounded-lg p-10 w-80 shadow-xl border border-[#C9A227]/20">
            <h4 className="font-serif text-xl font-semibold mb-3">Full Access</h4>
            <p className="text-4xl font-bold mb-1 text-[#C9A227]">$99<span className="text-base font-normal text-[#b8c0d4]"> one-time</span></p>
            <p className="text-[#b8c0d4] text-sm mb-8">7-day free trial included</p>
            <ul className="text-left text-sm text-[#d8dce8] mb-8 space-y-3">
              <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Full year of access</li>
              <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Simcha Checklist</li>
              <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Expense Tracker</li>
              <li className="flex items-center gap-2"><span className="text-[#C9A227]">✓</span> Simcha Magazine</li>
            </ul>
            <a href="/pricing" className="block bg-[#C9A227] text-[#141d33] font-semibold py-3 rounded-md hover:bg-[#dab53a] transition-colors">Start Free Trial</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}