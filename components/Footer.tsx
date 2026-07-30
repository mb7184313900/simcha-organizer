import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#141d33] text-white py-10 px-6 w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="SimchaPro"
            width={100}
            height={144}
            className="h-10 w-auto"
          />
          <p className="text-[#b8c0d4] text-sm">(c) 2026 SimchaPro. All rights reserved.</p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-3 md:gap-6 max-w-full">
          <a href="/terms" className="text-[#b8c0d4] hover:text-[#C9A227] text-sm transition-colors">
            Terms & Conditions
          </a>
          <a href="/privacy" className="text-[#b8c0d4] hover:text-[#C9A227] text-sm transition-colors">
            Privacy Policy
          </a>
          <a href="/advertise" className="text-[#b8c0d4] hover:text-[#C9A227] text-sm transition-colors">
            Advertise With Us
          </a>
          <a href="/contact" className="text-[#b8c0d4] hover:text-[#C9A227] text-sm transition-colors">
            Contact
          </a>
          <a href="mailto:info@simchapro.com" className="text-[#b8c0d4] hover:text-[#C9A227] text-sm transition-colors">
            info@simchapro.com
          </a>
          <a
            href="https://wa.me/19292443318"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shrink-0"
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
  );
}
