export default function RefundPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="surface-shell rounded-3xl p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-600/80">
          Refund Policy
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-slate-900">
          Refund policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: May 8, 2026</p>

        <section className="mt-8 space-y-4 text-sm sm:text-base text-slate-700">
          <p>
            We want you to be satisfied with your purchase. This policy explains
            when refunds are available and how to request them.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">Eligibility</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Requests must be submitted within 30 days of delivery.</li>
            <li>Items must be unused and in original packaging.</li>
            <li>Certain products may be non-refundable for safety reasons.</li>
          </ul>
          <h2 className="text-lg font-semibold text-slate-900">
            How to request a refund
          </h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Email your order number to support@healthstore.example.</li>
            <li>Our team will respond with return instructions.</li>
            <li>Refunds are issued to the original payment method.</li>
          </ol>
          <p>
            Processing times vary by payment provider, typically 5 to 10
            business days after approval.
          </p>
        </section>
      </article>
    </main>
  );
}
