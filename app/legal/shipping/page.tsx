export default function ShippingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="surface-shell rounded-3xl p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-600/80">
          Shipping Policy
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-slate-900">
          Shipping policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: May 8, 2026</p>

        <section className="mt-8 space-y-4 text-sm sm:text-base text-slate-700">
          <p>
            We aim to deliver your order quickly and reliably. This policy
            outlines our fulfillment and shipping timelines.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Processing time
          </h2>
          <p>
            Orders are processed within 1 to 3 business days, excluding
            holidays.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Shipping times
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Domestic standard: 3 to 7 business days.</li>
            <li>Domestic express: 1 to 3 business days.</li>
            <li>International: 7 to 21 business days.</li>
          </ul>
          <h2 className="text-lg font-semibold text-slate-900">Tracking</h2>
          <p>You will receive a tracking link once your order ships.</p>
        </section>
      </article>
    </main>
  );
}
