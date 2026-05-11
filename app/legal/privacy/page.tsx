export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="surface-shell rounded-3xl p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-600/80">
          Privacy Policy
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-slate-900">
          Privacy policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: May 8, 2026</p>

        <section className="mt-8 space-y-4 text-sm sm:text-base text-slate-700">
          <p>
            We respect your privacy and are committed to protecting your
            personal information. This policy explains what data we collect, how
            we use it, and the choices you have.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Information we collect
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Account details such as name, email address, and password.</li>
            <li>Order information, shipping address, and payment status.</li>
            <li>Device and usage data (e.g., browser, pages viewed).</li>
          </ul>
          <h2 className="text-lg font-semibold text-slate-900">
            How we use your information
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Process orders and deliver products.</li>
            <li>Provide customer support and order updates.</li>
            <li>Improve our products, services, and site experience.</li>
          </ul>
          <h2 className="text-lg font-semibold text-slate-900">Your choices</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Update your account details at any time.</li>
            <li>Opt out of marketing communications.</li>
            <li>Request access, correction, or deletion of your data.</li>
          </ul>
          <p>
            Contact us at support@healthstore.example if you have questions or
            requests.
          </p>
        </section>
      </article>
    </main>
  );
}
