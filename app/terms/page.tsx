import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service · Folio',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-serif text-[18px] font-bold text-stone-900 dark:text-stone-50 mb-3 tracking-tight">
        {title}
      </h2>
      <div className="space-y-3 text-[14px] text-stone-600 dark:text-stone-400 leading-[1.75]">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">

      {/* Simple header */}
      <header className="border-b border-stone-200 dark:border-stone-800">
        <div className="h-[3px] bg-stone-900 dark:bg-stone-100" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-[20px] font-bold tracking-tight text-stone-900 dark:text-stone-50 hover:opacity-75 transition-opacity">
            Folio
          </Link>
          <Link href="/" className="font-sans text-[11px] text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-10">
          <p className="font-sans text-[10px] tracking-widest uppercase text-stone-400 dark:text-stone-500 mb-3">
            Legal
          </p>
          <h1 className="font-serif text-[30px] font-bold text-stone-900 dark:text-stone-50 tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-[13px] font-sans text-stone-400 dark:text-stone-500">
            Last updated: 5 March 2026
          </p>
        </div>

        <Section title="About this service">
          <p>
            Folio (&quot;the Service&quot;) is operated by an individual based in the United Kingdom. It provides daily commercial law briefings, quiz content, firm profiles, and related educational materials for law students.
          </p>
          <p>
            By accessing or using the Service you agree to these Terms. If you do not agree, please do not use the Service.
          </p>
        </Section>

        <Section title="Subscriptions and billing">
          <p>
            The Service is offered on a free tier and a paid subscription tier at £4 per month. Paid subscriptions are billed monthly and renew automatically until cancelled.
          </p>
          <p>
            Payments are processed securely by Stripe. We do not store your card details. Prices are inclusive of any applicable VAT.
          </p>
          <p>
            You may cancel your subscription at any time via your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until that date.
          </p>
        </Section>

        <Section title="Refunds">
          <p>
            Under the Consumer Contracts Regulations 2013, you have a right to cancel a digital service within 14 days of purchase. By accessing paid features immediately after subscribing, you acknowledge that the service has begun and agree that the 14-day right to cancel is waived for the period already used.
          </p>
          <p>
            If you experience a technical issue that prevents you from accessing the service, please contact us at <a href="mailto:feedbackfolioapp@gmail.com" className="underline underline-offset-2">feedbackfolioapp@gmail.com</a> and we will review the situation fairly.
          </p>
        </Section>

        <Section title="Content and accuracy">
          <p>
            Briefings, quiz questions, firm profiles, and other content on this Service are generated with the assistance of artificial intelligence tools and curated for educational purposes. They are intended to support your commercial awareness as a law student — not to provide legal advice.
          </p>
          <p>
            We make reasonable efforts to ensure accuracy but cannot guarantee that all content is current, complete, or error-free. You should verify any information before relying on it in a professional context.
          </p>
          <p>
            Nothing on this Service constitutes legal, financial, or career advice. Use of the Service does not create any professional relationship between you and us.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Share your account credentials with others</li>
            <li>Reproduce or redistribute paid content without permission</li>
            <li>Attempt to reverse-engineer, scrape, or otherwise extract content at scale</li>
            <li>Use the Service in any unlawful way</li>
          </ul>
        </Section>

        <Section title="Intellectual property">
          <p>
            The editorial structure, design, and presentation of content on this Service are our property. Underlying news events and publicly available information are not claimed as our intellectual property.
          </p>
        </Section>

        <Section title="Availability">
          <p>
            We aim to keep the Service available at all times but cannot guarantee uninterrupted access. We may update, suspend, or discontinue features at any time. Where a paid subscription is affected by a prolonged outage, we will consider refunds on a case-by-case basis.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            For questions about these Terms, contact us at{' '}
            <a href="mailto:feedbackfolioapp@gmail.com" className="underline underline-offset-2 text-stone-700 dark:text-stone-300">
              feedbackfolioapp@gmail.com
            </a>.
          </p>
        </Section>

      </main>
    </div>
  );
}
