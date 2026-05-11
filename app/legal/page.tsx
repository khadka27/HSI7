import Link from "next/link";

const legalPages = [
  {
    title: "Privacy Policy",
    description: "How we collect, use, and protect your data.",
    href: "/legal/privacy",
  },
  {
    title: "Terms of Service",
    description: "The rules and conditions for using HealthStore.",
    href: "/legal/terms",
  },
  {
    title: "Refund Policy",
    description: "Eligibility, timelines, and how refunds work.",
    href: "/legal/refunds",
  },
  {
    title: "Shipping Policy",
    description: "Fulfillment timelines, tracking, and delivery info.",
    href: "/legal/shipping",
  },
  {
    title: "Cookie Policy",
    description: "What cookies we use and your choices.",
    href: "/legal/cookies",
  },
];

export default function LegalIndexPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="surface-shell rounded-3xl p-8 sm:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-blue-600/80">
          Legal
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold text-slate-900">
          Legal information
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl">
          Review the policies that govern your use of HealthStore, your data,
          and your purchases.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {legalPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {page.title}
                </h2>
                <span className="text-blue-600 text-sm font-medium transition group-hover:text-blue-700">
                  View
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{page.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
