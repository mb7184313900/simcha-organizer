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
      <img src="/help-screenshots/wedding-profile.png" alt="Wedding Profile setup screen" className="my-3 rounded-lg border border-gray-200 max-w-full mx-auto block" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Understanding Side A and Side B</h3>
      <p className="mb-2">SimchaPro is built for both families to plan together:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Side A is whoever creates the wedding first (the "owner" of that wedding's account)</li>
        <li>Side B is the other family, invited in afterward by Side A</li>
      </ul>
      <img src="/help-screenshots/my-weddings.png" alt="My Weddings page showing Owner (Side A) label" className="my-3 rounded-lg border border-gray-200 max-w-full mx-auto block" />

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
      <img src="/help-screenshots/invite-panel.png" alt="Other Family Access invite panel" className="my-3 rounded-lg border border-gray-200 max-w-full mx-auto block" />

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
      <img src="/help-screenshots/shared-expenses.png" alt="Shared Expenses tab showing family split" className="my-3 rounded-lg border border-gray-200 max-w-full mx-auto block" />

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

function MagazineContent() {
  return (
    <>
      <p className="mb-4">
        A resource hub for wedding planning inspiration, vendor discovery, and exclusive deals.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Articles</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Browse articles covering wedding planning tips, inspiration, and guidance</li>
        <li>No membership required to read</li>
      </ul>
      <ScreenshotPlaceholder description="Magazine articles feed" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Vendor Directory</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Browse vendors by category (photographers, halls, caterers, and more)</li>
        <li>Tap a vendor to see their full listing: photos, description, and contact info</li>
        <li>Tap-to-call, tap-to-WhatsApp, or visit their website directly from the listing</li>
      </ul>
      <ScreenshotPlaceholder description="Vendor Directory category tiles" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Coupons</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Browse general coupons and deals from vendors</li>
        <li>Free to view for everyone</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Exclusive Coupons</h3>
      <p className="mb-2">
        <PaidFeatureBadge /> Exclusive Coupons are only available for paid members.
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>A separate section of deeper discounts and offers, visible only to paid members</li>
        <li>A persistent banner reminds free members that Exclusive Coupons are available with a paid membership</li>
      </ul>
      <ScreenshotPlaceholder description="Exclusive Coupons banner for non-members" />
    </>
  )
}

function VendorSubmissionContent() {
  return (
    <>
      <p className="italic text-gray-500 mb-3">
        This section is for vendors who want to advertise on SimchaPro.
      </p>

      <p className="mb-4">
        Want your business listed in the Simcha Magazine Vendor Directory? Here's how to get started.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Submitting your listing</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Go to simchapro.com/advertise</li>
        <li>Fill out the submission form with your business details: category, location, description, contact info, and photos</li>
        <li>Upload a logo and, optionally, a flyer</li>
        <li>You can also select a custom category or location if yours isn't listed</li>
        <li>Add a note to our team if there's anything specific you'd like us to know</li>
        <li>Submit — your listing goes into our review queue</li>
      </ul>
      <ScreenshotPlaceholder description="/advertise submission form" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Adding coupons to your listing</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>You can include a Regular Coupon, an Exclusive Coupon (or both), each with its own expiration date</li>
        <li>Exclusive Coupons are shown only to SimchaPro's paid members — a great way to stand out to serious, engaged customers</li>
      </ul>
      <ScreenshotPlaceholder description="Coupon fields on the submission form" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">What happens after you submit</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>You'll receive a confirmation email once your submission is received</li>
        <li>Our team reviews every listing before it goes live</li>
        <li>If approved, you'll get an email with a link to your live listing</li>
        <li>If we need changes, you'll get an email explaining what to update</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Making changes to your listing later</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Simply resubmit the form using the same email address you used originally</li>
        <li>This is treated as an edit request, not a new listing — our team reviews the specific changes (with a before/after comparison) before approving</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Coupon expiration reminders</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>If your coupon is about to expire, you'll get a reminder email 7 days before it expires</li>
        <li>That email includes a link where you can extend the coupon yourself — your extension request goes through the same admin approval process</li>
      </ul>
    </>
  )
}

function AccountSettingsContent() {
  return (
    <>
      <p className="mb-4">
        Manage your profile and keep track of multiple weddings from one account.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Managing your profile</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Update your name, email, and password from your account settings</li>
        <li>Your profile applies across all weddings linked to your account</li>
      </ul>

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Multiple weddings per account</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>If you're planning more than one wedding (e.g. you're helping with a sibling's wedding too), you can create additional weddings from the My Weddings page</li>
        <li>Each wedding has its own separate Checklist, Expense Tracker, and trial/subscription status</li>
        <li>Switch between weddings from the My Weddings page at any time</li>
      </ul>
      <ScreenshotPlaceholder description="My Weddings page with multiple wedding cards" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">Logging out</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Click your profile icon and select Log Out</li>
      </ul>
    </>
  )
}

function DashboardContent() {
  return (
    <>
      <p className="mb-4">
        Your home base for tracking wedding progress at a glance.
      </p>

      <h3 className="font-semibold text-[#141d33] mb-2">Wedding countdown</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>As soon as you set a wedding date, your Dashboard shows a live countdown of days remaining until the big day</li>
        <li>This updates automatically — no need to refresh or recalculate anything</li>
      </ul>
      <ScreenshotPlaceholder description="Dashboard countdown display" />

      <h3 className="font-semibold text-[#141d33] mb-2 mt-4">At-a-glance overview</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li>Quick snapshot of your wedding's progress — a jumping-off point to the Checklist, Expense Tracker, and other tools</li>
      </ul>
      <ScreenshotPlaceholder description="Full Dashboard view" />
    </>
  )
}

function SectionLink({ sectionId, children }) {
  return (
    <a
      href={`#${sectionId}`}
      className="text-[#141d33] hover:text-[#C9A227] underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  )
}

function FaqItem({ question, children }) {
  return (
    <div>
      <p className="font-semibold text-[#141d33] mb-1">{question}</p>
      <p className="text-gray-600">{children}</p>
    </div>
  )
}

function FaqContent() {
  return (
    <>
      <p className="mb-4">Quick answers to common questions.</p>

      <div className="space-y-5">
        <FaqItem question="Why can't I check off checklist items anymore?">
          Checking off items requires a paid membership. If your free trial ended or your subscription lapsed, your account moves to view-only mode. Upgrading or renewing restores full editing access — nothing is lost in the meantime. (See <SectionLink sectionId="payments">Payments &amp; Renewals</SectionLink>.)
        </FaqItem>

        <FaqItem question="Why can't I edit my checklist even though I'm a paid member?">
          If it's been more than a year since your wedding was created, editing switches to view-only as part of the one-year edit window. Your data is all still there — you just can't make changes past that point. (See <SectionLink sectionId="invite-system">Wedding Invite System</SectionLink>.)
        </FaqItem>

        <FaqItem question="I accidentally removed a checklist item — is it gone?">
          No — removed checklist items move to Removed Items and can be restored anytime. (See <SectionLink sectionId="checklist">Simcha Checklist</SectionLink>.)
        </FaqItem>

        <FaqItem question="I deleted a vendor or payment in the Expense Tracker — can I get it back?">
          Unfortunately no. Unlike the checklist, deleting a vendor or payment in the Expense Tracker is permanent. Always double-check before confirming a delete.
        </FaqItem>

        <FaqItem question="I don't see my partner's side's expenses or checklist progress.">
          Make sure Side B has accepted the invite — if they haven't accepted yet, they won't be connected. Also remember: checklist checking is individual to each side (you won't see their checked items even once connected), while shared expenses do appear for both sides.
        </FaqItem>

        <FaqItem question="How do I log out?">
          Click your profile icon and select Log Out.
        </FaqItem>

        <FaqItem question="I'm a vendor — how do I get listed in the Vendor Directory?">
          Go to simchapro.com/advertise and submit your listing. See <SectionLink sectionId="vendor-submission">Vendor Self-Submission</SectionLink> for the full walkthrough.
        </FaqItem>

        <FaqItem question="Do I lose my data if my trial or subscription expires?">
          No — your data is never deleted. Everything you've entered stays exactly as it is; only editing is paused until you upgrade or renew.
        </FaqItem>
      </div>
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
  'magazine': MagazineContent,
  'vendor-submission': VendorSubmissionContent,
  'account-settings': AccountSettingsContent,
  'dashboard': DashboardContent,
  'faq': FaqContent,
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
