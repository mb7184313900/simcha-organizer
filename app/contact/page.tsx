import type { Metadata } from 'next';
import Image from 'next/image'
import Footer from '../../components/Footer'

export const metadata: Metadata = {
  title: 'Contact Us | SimchaPro Jewish Wedding Planner',
  description: 'Get in touch with the SimchaPro team — reach us by email or WhatsApp with any questions about our simcha planning tools for the frum and heimish community.',
};

export default function Contact() {
  return (
    <main className="min-h-screen bg-[#FAF7F0]">
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
        <nav className="flex gap-8 text-sm font-medium tracking-wide">
          <a href="/checklist" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors">Checklist</a>
          <a href="/budget" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors">Organizer</a>
          <a href="/login" className="text-[#e8e4d8] hover:text-[#C9A227] transition-colors">Sign In</a>
        </nav>
      </header>

      <section className="py-20 px-6 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-4xl font-semibold text-[#141d33] mb-4">Get In Touch</h2>
        <div className="w-16 h-px bg-[#C9A227] mx-auto mb-6" />
        <p className="text-[#5a5a5a] mb-12">
          Have a question about SimchaPro? We would love to hear from you.
        </p>

        <div className="flex flex-col gap-6 items-center">
          <a href="mailto:info@simchapro.com" className="flex items-center gap-3 border border-[#141d33] text-[#141d33] font-semibold px-8 py-4 rounded-md hover:bg-[#141d33]/5 transition-colors w-full max-w-sm justify-center">
            <span className="text-2xl">Email</span>
            info@simchapro.com
          </a>

          <a href="https://wa.me/19292443318" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-8 py-4 rounded-md w-full max-w-sm justify-center transition-colors">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.876.514 3.634 1.41 5.144L2 22l4.955-1.379A9.947 9.947 0 0012.001 22C17.523 22 22 17.523 22 12S17.523 2 12.001 2zm0 18.153a8.116 8.116 0 01-4.145-1.135l-.297-.176-3.075.856.83-3.007-.194-.309a8.116 8.116 0 01-1.256-4.35c0-4.492 3.654-8.146 8.147-8.146 4.492 0 8.146 3.654 8.146 8.146-.001 4.493-3.655 8.147-8.146 8.147z"/>
            </svg>
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
