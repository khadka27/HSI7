export default function CookiePolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <article className="surface-shell rounded-3xl p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-600/80">
          Cookie Policy
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-slate-900">
          Cookie policy
        </h1>
        <p className="mt-4 text-sm text-slate-500">Last updated: May 8, 2026</p>

        <section className="mt-8 space-y-4 text-sm sm:text-base text-slate-700">
          <p>
            We use cookies and similar technologies to deliver a secure and
            personalized experience.
          </p>
          <h2 className="text-lg font-semibold text-slate-900">
            Types of cookies
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Essential: Required for core site functionality.</li>
            <li>Analytics: Help us understand site usage.</li>
            <li>Preference: Remember your settings and choices.</li>
          </ul>
          <h2 className="text-lg font-semibold text-slate-900">Your choices</h2>
          <p>
            You can manage cookies in your browser settings. Disabling cookies
            may affect site functionality.
          </p>
        </section>
      </article>
    </main>
  );
}
