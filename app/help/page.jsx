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

function NoteCallout({ children, variant = 'gold' }) {
  const variantClasses =
    variant === 'warning'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-[#C9A227]/10 border-[#C9A227]/30 text-[#141d33]'

  return (
    <div className={`my-3 border rounded-lg px-4 py-3 text-sm ${variantClasses}`}>
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

function ExpenseTrackerContent() {
  return (
    <>
      <p className="mb-3">
        Keep every wedding expense organized and clear — who's paying for what, and where the money's going.
      </p>

      <p className="mb-4">
        <PaidFeatureBadge /> The entire Expense Tracker is only available for paid members.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Shared vs. private expenses</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Shared expenses — visible to both Side A and Side B, useful for costs split between families</li>
        <li>Private expenses — visible only to the side that entered them</li>
        <li>Every expense is tagged by family side, so it's always clear who added what</li>
      </ul>
      <ScreenshotPlaceholder description="Expense entry with shared/private toggle" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Vendor management</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Add vendors you're working with (photographer, caterer, hall, etc.)</li>
        <li>Track contact details and notes per vendor</li>
        <li>Link expenses and payments to the relevant vendor</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Adding a payment</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>On a vendor's page, go to Add Payment</li>
        <li>Enter the amount, who paid, payment method, and optionally a due date or date paid</li>
        <li>Click Add Payment</li>
      </ul>
      <ScreenshotPlaceholder description="Add Payment form" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Adding an additional charge</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>If a vendor adds an extra cost beyond their original amount (e.g. an overtime fee, an upgrade), go to Additional Charges on that vendor's page</li>
        <li>Enter a description and the amount, then click Add Charge</li>
        <li>This increases the vendor's total, separate from tracking payments</li>
      </ul>
      <ScreenshotPlaceholder description="Add Additional Charge form" />

      <NoteCallout>
        Payments and Additional Charges are tracked separately: Payments record money you've paid toward the vendor's total, while Additional Charges increase that total when a vendor adds a new cost.
      </NoteCallout>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Check tracker</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Keep a running record of checks written — check number, amount, date, and who it's made out to</li>
        <li>If a check is post-dated, enter the future date — the tracker shows the due date and how many days remain until then, so you can plan for when funds need to be available</li>
      </ul>
      <ScreenshotPlaceholder description="Check tracker showing a post-dated check with days remaining" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Breakdown tab</h3>
      <p>A summary view showing totals by category, so you can see the full financial picture at a glance.</p>
      <ScreenshotPlaceholder description="Breakdown tab showing category totals" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">PDF export</h3>
      <p>Click Export to PDF to download a navy/gold branded summary of your expenses.</p>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">⚠️ Important: deleting is permanent here</h3>
      <NoteCallout variant="warning">
        Unlike the Checklist (where removed items move to a Removed Items list and can be restored), deleting a vendor or payment in the Expense Tracker is permanent and cannot be undone. You'll be asked to confirm before anything is deleted.
      </NoteCallout>
    </>
  )
}

function InviteSystemContent() {
  return (
    <>
      <p className="mb-4">
        A closer look at how the invite system works technically — what happens at each step.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">The invite flow</h3>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Side A goes to the Invite page and enters Side B's email</li>
        <li>Side B receives a branded invite email with a link to accept</li>
        <li>Side B clicks the link, creates or logs into their SimchaPro account, and confirms</li>
        <li>Once accepted, Side A receives a "Mazel Tov!" notification, and Side B gets connected access to the wedding</li>
      </ol>
      <ScreenshotPlaceholder description="Invite acceptance flow" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">If Side B declines or doesn't respond</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>No changes happen to Side A's wedding or data</li>
        <li>Side A can resend the invite at any time</li>
        <li>Side A can also revoke a pending invite if needed</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">The one-year edit window</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Once a wedding is created, both sides have one year of full edit access (checking off items, entering expenses, etc.), subject to an active paid plan</li>
        <li>After one year, the wedding automatically switches to view-only — nothing is deleted, but editing is disabled until a renewal is made</li>
      </ul>

      <NoteCallout>
        This one-year window applies to editing generally, separate from trial/subscription status — see "Payments &amp; Renewals" for how those interact.
      </NoteCallout>
      <ScreenshotPlaceholder description="View-only banner after 1-year mark" />
    </>
  )
}

const PLAN_COMPARISON_ROWS = [
  { feature: 'View Checklist (all 14 tabs)', free: true, paid: true },
  { feature: 'Check off Checklist items', free: false, paid: true },
  { feature: 'Add/remove Checklist items', free: false, paid: true },
  { feature: 'Checklist dates & countdowns', free: false, paid: true },
  { feature: 'Expense Tracker (full)', free: false, paid: true },
  { feature: 'Invite Side B', free: false, paid: true },
  { feature: 'Simcha Magazine articles', free: true, paid: true },
  { feature: 'Vendor Directory', free: true, paid: true },
  { feature: 'Coupons', free: true, paid: true },
  { feature: 'Exclusive Coupons', free: false, paid: true },
]

function PlanComparisonMark({ included }) {
  return included ? (
    <span className="text-green-600 font-semibold">✓</span>
  ) : (
    <span className="text-gray-300">✗</span>
  )
}

function PaymentsContent() {
  return (
    <>
      <p className="mb-4">
        Here's exactly how SimchaPro's pricing works, from trial to renewal.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Free vs. Paid — quick comparison</h3>
      <div className="my-3 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm border-collapse min-w-[420px]">
          <thead>
            <tr className="bg-[#141d33] text-white">
              <th className="text-left px-4 py-2 font-medium">Feature</th>
              <th className="text-center px-4 py-2 font-medium">Free</th>
              <th className="text-center px-4 py-2 font-medium text-[#C9A227]">Paid</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON_ROWS.map((row, i) => (
              <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2 border-t border-gray-100">{row.feature}</td>
                <td className="px-4 py-2 border-t border-gray-100 text-center">
                  <PlanComparisonMark included={row.free} />
                </td>
                <td className="px-4 py-2 border-t border-gray-100 text-center">
                  <PlanComparisonMark included={row.paid} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">The 7-day free trial</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Every new wedding starts with a 7-day free trial</li>
        <li>Full access to all paid features during the trial — no payment required upfront</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">The one-time payment</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>After the trial, upgrade with a $99 one-time payment per wedding</li>
        <li>This is a one-time charge, not a recurring subscription — you own access to that wedding's plan going forward, subject to renewal</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Renewal options</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>After your first year, renew at $49/year or $29/6 months to keep full editing access</li>
        <li>Renewing doesn't reset your data — everything you've entered stays exactly as it is</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">What happens if your trial or access expires</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>If your trial ends without upgrading, or your paid access lapses, your account moves to view-only mode</li>
        <li>You can still see everything — your checklist, your expenses, your vendors — but editing (checking items, adding expenses, etc.) is disabled until you upgrade or renew</li>
      </ul>
      <NoteCallout>
        Your data is never deleted when access expires — it's all still there, waiting for you.
      </NoteCallout>
      <ScreenshotPlaceholder description="View-only mode banner with upgrade prompt" />
    </>
  )
}

const SECTION_CONTENT = {
  'getting-started': GettingStartedContent,
  'inviting-partner': InvitingPartnerContent,
  'checklist': ChecklistContent,
  'expense-tracker': ExpenseTrackerContent,
  'invite-system': InviteSystemContent,
  'payments': PaymentsContent,
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
