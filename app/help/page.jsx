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

// Reusable content-block helpers, shared across accordion sections.
function ScreenshotPlaceholder({ description }) {
  return (
    <div className="my-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-8 px-4 text-center">
      <p className="text-2xl mb-1">🖼️</p>
      <p className="text-sm text-gray-400 italic">Screenshot coming soon — {description}</p>
    </div>
  )
}

function NoteCallout({ children }) {
  return (
    <div className="my-3 bg-[#C9A227]/10 border border-[#C9A227]/30 rounded-lg px-4 py-3 text-sm text-[#141d33]">
      {children}
    </div>
  )
}

function PaidFeatureBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
      🔒 Paid Feature
    </span>
  )
}

function GettingStartedContent() {
  return (
    <>
      <p className="mb-4">
        Welcome to SimchaPro! Here's everything you need to know to get your wedding planning up and running.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Signing up</h3>
      <ul className="list-disc pl-5 space-y-1 mb-4">
        <li>Go to the SimchaPro homepage and click Sign Up</li>
        <li>Enter your name, email, and password</li>
        <li>Check the box agreeing to the Terms &amp; Conditions</li>
        <li>Click Create Account</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2">Creating your wedding</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Once logged in, click New Wedding</li>
        <li>Enter the wedding name and wedding date</li>
        <li>This starts your 7-day free trial — full access to explore the Checklist, Expense Tracker, and everything else, no payment required upfront</li>
      </ul>
      <ScreenshotPlaceholder description="New Wedding creation screen" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Understanding Side A and Side B</h3>
      <p className="mb-2">SimchaPro is built for both families to plan together:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Side A is whoever creates the wedding first (the "owner" of that wedding's account)</li>
        <li>Side B is the other family, invited in afterward by Side A</li>
      </ul>
      <ScreenshotPlaceholder description="Dashboard showing Side A/Side B labels" />

      <NoteCallout>
        📌 Only Side A can create the wedding and manage the subscription. Side B joins by invitation — see the "Inviting Your Partner's Side" section below.
      </NoteCallout>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">After your trial ends</h3>
      <p>
        If you don't upgrade to a paid plan, your account moves to view-only mode — your data is never deleted, but checking off items, adding expenses, and other editing actions require a paid membership. See the "Payments &amp; Renewals" section for full details.
      </p>
    </>
  )
}

function InvitingPartnerContent() {
  return (
    <>
      <p className="mb-3">
        Planning a wedding is a two-family affair — SimchaPro lets you bring the other side in to collaborate.
      </p>

      <p className="mb-4">
        <PaidFeatureBadge /> Inviting Side B is only available for paid members.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">How Side A invites Side B</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Go to the Invite page</li>
        <li>Enter the email address of your contact on the other side</li>
        <li>Click Send Invite</li>
        <li>They'll receive a branded email invitation to join</li>
      </ul>
      <ScreenshotPlaceholder description="Invite page — enter email screen" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">What happens after you send the invite</h3>
      <ul className="list-disc pl-5 space-y-1 mb-4">
        <li>If they accept: Side A gets a "Mazel Tov!" notification, and Side B now has free connected access to the wedding — no separate payment needed</li>
        <li>If they don't respond or decline: nothing changes on your end; you can resend the invite anytime</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2">What Side B can see and do once connected</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Full access to the Checklist and Expense Tracker for this wedding</li>
        <li>Their own private expenses (only visible to their side)</li>
        <li>Shared expenses (visible to both sides)</li>
      </ul>

      <NoteCallout>
        📌 Side B's access mirrors Side A's plan automatically — Side B never pays directly. If Side A's membership expires or is cancelled, Side B's access changes too.
      </NoteCallout>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Shared vs. private expenses</h3>
      <ul className="list-disc pl-5 space-y-1 mb-2">
        <li>Shared expenses — visible to both Side A and Side B, useful for costs split between families</li>
        <li>Private expenses — visible only to the side that entered them</li>
      </ul>
      <p>Every expense is tagged by family side, so it's always clear who added what.</p>
      <ScreenshotPlaceholder description="Expense entry showing shared/private toggle" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Revoking and reinstating Side B's access</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Side A can revoke Side B's access at any time from the Invite page</li>
        <li>Revoking doesn't delete any data — it just removes Side B's ability to view/edit</li>
        <li>Side A can reinstate access later, and everything picks back up where it left off</li>
      </ul>
    </>
  )
}

function ChecklistContent() {
  return (
    <>
      <p className="mb-4">
        Stay on top of every wedding to-do with a checklist built specifically for the details of a frum wedding.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">The 14 tabs</h3>
      <p>
        The checklist is organized into 14 tabs covering every stage of planning (venue, catering, clothing, and more), so you can focus on one area at a time.
      </p>
      <ScreenshotPlaceholder description="Checklist tab navigation" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Viewing vs. checking off items</h3>
      <p className="mb-2">
        <PaidFeatureBadge /> Checking and unchecking items is only available for paid members.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Free members can view the full checklist across all 14 tabs</li>
        <li>Paid members can check items off as they're completed</li>
      </ul>

      <NoteCallout>
        Side A and Side B see the same list of items, but checking is individual to each side. When Side A checks off an item, it only shows as checked for Side A — Side B's copy of that same item stays unchecked, and vice versa. Each side tracks their own progress separately, even on shared items.
      </NoteCallout>
      <ScreenshotPlaceholder description="Same item shown checked on one side, unchecked on the other" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Adding a custom item</h3>
      <p className="mb-2">
        <PaidFeatureBadge />
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Go to the relevant tab</li>
        <li>Click Add Item</li>
        <li>Type in your custom item and save — it appears in that tab alongside the built-in items</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Removing an item from your list</h3>
      <p className="mb-2">
        <PaidFeatureBadge />
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Click the remove/delete icon next to any item you don't need</li>
        <li>The item is not deleted — it moves to a Removed Items list</li>
        <li>Chosson-side items can be removed by whichever side doesn't need them, and the same goes for Kallah-side items — each side can trim the list down to what's actually relevant to them</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Restoring a removed item</h3>
      <p className="mb-2">
        <PaidFeatureBadge />
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Go to Removed Items</li>
        <li>Click Restore next to any item to bring it back to its original tab</li>
      </ul>
      <ScreenshotPlaceholder description="Removed Items list with Restore button" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Adding a date / countdown timer</h3>
      <p className="mb-2">
        <PaidFeatureBadge />
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Click on an item and add a target date</li>
        <li>The item will show a countdown so you know how much time is left to complete it</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">PDF export</h3>
      <p>
        Click Export to PDF to download your checklist (navy/gold branded) — useful for printing or sharing with a vendor or family member.
      </p>
    </>
  )
}

const SECTION_CONTENT = {
  'getting-started': GettingStartedContent,
  'inviting-partner': InvitingPartnerContent,
  'checklist': ChecklistContent,
}

function AccordionSection({ id, title, isOpen, onToggle }) {
  const Content = SECTION_CONTENT[id]

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
          {Content ? <Content /> : <p className="text-gray-400 italic">Content coming soon.</p>}
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
