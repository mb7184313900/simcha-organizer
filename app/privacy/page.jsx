import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: July 21, 2026</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              1. Introduction
            </h2>
            <p>
              SimchaPro ("SimchaPro," "we," "us," or "our") respects your privacy. This Privacy
              Policy explains what information we collect through simchapro.com (the "Service"),
              how we use it, and how we protect it.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              2. Information We Collect
            </h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account information:</strong> your name and email address when you sign
                up.
              </li>
              <li>
                <strong>Wedding planning information:</strong> details you enter about the
                simcha, including dates, checklist entries, vendor information, and notes.
              </li>
              <li>
                <strong>Expense and budget data:</strong> amounts, categories, payment records,
                and related financial planning entries you input into the Budget Organizer.
              </li>
              <li>
                <strong>Payment information:</strong> processed securely by Stripe. SimchaPro does
                not directly collect or store your full credit card number.
              </li>
              <li>
                <strong>Usage information:</strong> basic technical information such as login
                activity, needed to operate and secure the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              3. How We Use Your Information
            </h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain the Service;</li>
              <li>Process payments and manage your subscription/access status;</li>
              <li>
                Send you transactional emails, such as payment receipts, trial expiry warnings,
                and renewal reminders;
              </li>
              <li>
                Allow you to share access with a second user (for example, the other side of the
                family) on your wedding, where you choose to enable that;
              </li>
              <li>Respond to your support requests; and</li>
              <li>Maintain the security and integrity of the Service.</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              4. We Do Not Sell Your Data
            </h2>
            <p>
              SimchaPro does not sell, rent, or trade your personal information or wedding
              planning data to third parties for marketing or advertising purposes. Your data is
              yours.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              5. Third-Party Service Providers
            </h2>
            <p className="mb-3">
              We rely on trusted third-party providers to operate the Service, each of which
              processes limited data strictly to perform their function:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Stripe</strong> — processes payments securely. Stripe has its own privacy
                policy and handles your payment card details directly; SimchaPro does not store
                full card numbers.
              </li>
              <li>
                <strong>Supabase</strong> — hosts our database and stores your account and wedding
                planning data, protected with access controls so only you and, where you choose,
                your invited collaborator can access your wedding's data.
              </li>
              <li>
                <strong>Resend</strong> — sends transactional emails on our behalf, such as
                receipts, trial reminders, and account notifications.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              6. Data Sharing Within Your Wedding
            </h2>
            <p>
              If you invite a second user to collaborate on your wedding (for example, the other
              side of the family), that user will be able to view information you choose to share
              within the wedding record, such as shared checklist items and shared expenses.
              Private expense entries marked as private are not shared with the invited user.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              7. Data Security
            </h2>
            <p>
              We use industry-standard security practices, including database-level access
              controls (Row Level Security), to protect your information from unauthorized
              access. However, no method of electronic storage or transmission is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              8. Data Retention
            </h2>
            <p>
              We retain your account and wedding planning data for as long as your account is
              active, and for a reasonable period afterward in case you wish to reactivate. You
              may request deletion of your account and associated data at any time by contacting
              us at{" "}
              <a href="mailto:info@simchapro.com" className="underline">
                info@simchapro.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              9. Your Choices
            </h2>
            <p>
              You may access, update, or request deletion of your personal information at any
              time by contacting us. You may also close your account at any time.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Continued use of the Service
              after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              11. Contact Us
            </h2>
            <p>
              Questions about this Privacy Policy can be sent to{" "}
              <a href="mailto:info@simchapro.com" className="underline">
                info@simchapro.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}