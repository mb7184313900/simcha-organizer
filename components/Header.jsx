'use client';
import Image from 'next/image';

export default function Header({ user, onDashboardClick }) {
  return (
    <header className="bg-[#141d33] py-1.5 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md border-b border-[#C9A227]/40">
      <a href="/" className="flex items-center gap-3">
        <Image
          src="/images/logo.png"
          alt="SimchaPro"
          width={160}
          height={230}
          priority
          className="h-16 w-auto"
        />
      </a>
      <nav className="flex gap-8 text-sm font-medium tracking-wide items-center">
        <a href="/checklist" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors">Checklist</a>
        <a href="/budget" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors">Expense Tracker</a>
        <a href="#" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors">Magazine</a>
        {user ? (
          <button
            onClick={onDashboardClick}
            className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors underline"
          >
            Dashboard
          </button>
        ) : (
          <a
            href="/login"
            className="bg-[#C9A227] text-[#141d33] px-4 py-1.5 rounded-md font-semibold hover:bg-[#dab53a] transition-colors"
          >
            Sign In
          </a>
        )}
      </nav>
    </header>
  );
}