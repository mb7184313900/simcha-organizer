'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SECTIONS = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'inviting-partner', title: "Inviting Your Partner's Side" },
  { id: 'checklist', title: 'Simcha Checklist' },
  { id: 'expense-tracker', title: 'Expense Tracker' },
  { id: 'invite-system', title: 'Wedding Invite System' },
  { id: 'payments', title: 'Payments & Renewals' },
  { id: 'magazine', title: 'Simcha Magazine' },
  { id: 'vendor-submission', title: 'Vendor Self-Submission' },
  { id: 'account-settings', title: 'Account Settings' },
  { id: 'dashboard', title: 'Dashboard' },
  { id: 'faq', title: 'FAQ / Troubleshooting' },
]

function AccordionSection({ id, title, isOpen, onToggle }) {
  return (
    <div
      id={id}
      className="scroll-mt-40 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <h2
          className="text-lg sm:text-xl"
          style={{ fontFamily: "'Playfair Display', serif", color: '#141d33' }}
        >
          {title}
        </h2>
        <span
          className={`shrink-0 text-[#C9A227] text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 text-gray-600 leading-relaxed">
          <p className="text-gray-400 italic">Content coming soon.</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [openSections, setOpenSections] = useState(() => new Set())

  const toggleSection = (id) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1
          className="text-3xl sm:text-4xl mb-3"
          style={{ fontFamily: "'Playfair Display', serif", color: '#141d33' }}
        >
          Help Center
        </h1>
        <p className="text-gray-500 mb-8">
          Answers to common questions about planning your simcha with SimchaPro.
        </p>

        <nav className="sticky top-14 md:top-16 z-30 bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-10">
          <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Jump to section</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm text-[#141d33] hover:text-[#C9A227] underline underline-offset-2 transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <AccordionSection
              key={section.id}
              id={section.id}
              title={section.title}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
