'use client';
import Image from 'next/image';

export default function Header({ user, onDashboardClick }) {
  return (
    <header className="bg-[#141d33] py-1.5 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md border-b border-[#C9A227]/40 w-full overflow-x-hidden">
      <a href="/" className="flex items-center gap-3 shrink-0">
        <Image
          src="/images/logo.png"
          alt="SimchaPro"
          width={160}
          height={231}
          preload
          className="h-12 w-[33px] md:h-16 md:w-[44px]"
        />
      </a>
      <nav className="flex flex-wrap justify-end items-center gap-x-3 gap-y-1 sm:gap-x-6 md:gap-8 text-xs sm:text-sm font-medium tracking-wide min-w-0">
        <a href="/checklist" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors whitespace-nowrap">Checklist</a>
        <a href="/budget" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors whitespace-nowrap">Expense Tracker</a>
        <a href="/magazine" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors whitespace-nowrap">Magazine</a>
        {user ? (
          <button
            onClick={onDashboardClick}
            className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors underline whitespace-nowrap"
          >
            Dashboard
          </button>
        ) : (
          <a
            href="/login"
            className="bg-[#C9A227] text-[#141d33] px-4 py-1.5 rounded-md font-semibold hover:bg-[#dab53a] transition-colors whitespace-nowrap"
          >
            Sign In
          </a>
        )}
      </nav>
    </header>
  );
}
