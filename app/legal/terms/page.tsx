export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="surface-shell rounded-3xl p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-600/80">
          Terms of Service
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-slate-900">
          Terms of service
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: May 8, 2026</p>

        <section className="mt-8 space-y-4 text-sm sm:text-base text-slate-700">
          <p>
            By using HealthStore, you agree to these terms. Please read them
            carefully before making a purchase.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">Eligibility</h2>
          <p>
            You must be at least 18 years old or have permission from a legal
            guardian to use this site.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Orders and payments
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Orders are subject to availability and confirmation.</li>
            <li>Prices may change without notice before purchase.</li>
            <li>Payment must be received before fulfillment.</li>
          </ul>
          <h2 className="text-lg font-semibold text-slate-900">
            Prohibited use
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Misuse of the site or attempts to disrupt service.</li>
            <li>Unauthorized access to accounts or systems.</li>
            <li>Resale of products without written permission.</li>
          </ul>
          <p>If you have questions, contact support@healthstore.example.</p>
        </section>
      </article>
    </main>
  );
}
