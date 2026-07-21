import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
        >
          Terms & Conditions
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last Updated: July 21, 2026</p>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              1. Acceptance of Terms
            </h2>
            <p>
              Welcome to SimchaPro ("SimchaPro," "we," "us," or "our"), a simcha planning
              platform available at simchapro.com (the "Service"). By creating an account or
              using the Service, you agree to be bound by these Terms & Conditions ("Terms"). If
              you do not agree to these Terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              2. Description of Service
            </h2>
            <p>
              SimchaPro provides tools to help families plan lifecycle celebrations, including a
              simcha checklist, expense tracking and budgeting tools, and related planning
              features. The Service is provided on an "as is" and "as available" basis.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              3. Accounts
            </h2>
            <p>
              You must provide accurate information when creating an account and are responsible
              for maintaining the confidentiality of your login credentials. You are responsible
              for all activity that occurs under your account. If you invite a second user (for
              example, the other side of the family) to collaborate on your wedding, you are
              responsible for that user's access and conduct within your wedding record.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              4. Payment Terms
            </h2>
            <p className="mb-3">
              SimchaPro offers a 7-day free trial. After the trial period, continued access to
              paid features requires payment of a one-time fee of <strong>$99 per wedding</strong>.
            </p>
            <p className="mb-3">
              Paid access, including edit access, is valid for one year from the date of
              purchase. After one year, your wedding record automatically becomes view-only unless
              renewed. You may renew for <strong>$49 per year</strong> or <strong>$29 per six
              months</strong> to restore full edit access. Renewal periods extend from the date of
              renewal, not from the original expiration date.
            </p>
            <p className="mb-3">
              All payments are one-time, manual transactions processed securely through Stripe.
              SimchaPro does not store your payment card information, and no payment is
              automatically recurring — you will never be charged without actively choosing to
              renew.
            </p>
            <p>
              <strong>No Refund Policy:</strong> All payments made to SimchaPro are final and
              non-refundable, including in cases of early cancellation, change of plans, or
              non-use of the Service. Please use your free trial period to evaluate whether the
              Service meets your needs before purchasing.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              5. Account Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these
              Terms, misuse the Service, or engage in conduct that we determine, in our sole
              discretion, to be harmful to SimchaPro or other users. You may stop using the
              Service and close your account at any time by contacting us at{" "}
              <a href="mailto:info@simchapro.com" className="underline">
                info@simchapro.com
              </a>
              . Termination of your account does not entitle you to a refund of any prior
              payments.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              6. Data Ownership
            </h2>
            <p>
              You retain ownership of the wedding planning data, checklist entries, and expense
              information you enter into the Service ("Your Content"). By using the Service, you
              grant SimchaPro a limited license to store, process, and display Your Content solely
              for the purpose of providing the Service to you. We do not claim ownership over Your
              Content and will not use it for any purpose beyond operating and improving the
              Service, as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              7. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, SimchaPro shall not be liable for any
              indirect, incidental, or consequential damages arising from your use of, or
              inability to use, the Service. The Service is a planning and organizational tool
              only; SimchaPro is not responsible for the actions, performance, or reliability of
              any third-party vendors you coordinate with using the Service.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              8. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after
              changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              9. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the State of New York, without regard to
              its conflict of law principles, regardless of the state or country from which you
              access the Service.
            </p>
          </section>

          <section>
            <h2
              className="text-2xl mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: "#141d33" }}
            >
              10. Contact Us
            </h2>
            <p>
              Questions about these Terms can be sent to{" "}
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