import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | HealthStore",
  description: "Learn more about HealthStore and our commitment to wellness-first living.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-16 fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            About <span className="text-blue-600">HealthStore</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elevating your lifestyle with wellness-first living and curated health products. 
            We believe that a healthy life is the foundation of a happy life.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="prose prose-lg prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              At HealthStore, our mission is to empower individuals to take control of their health journey. 
              We meticulously curate high-quality wellness products, supplements, and lifestyle goods to 
              support you in achieving your personal health goals.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-4 mt-8">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 transition-all hover:shadow-md hover:bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-2">Curated Quality</h3>
                <p className="text-sm text-blue-800/80">Every product is verified for efficacy, safety, and premium ingredients.</p>
              </div>
              <div className="p-6 bg-teal-50/50 rounded-2xl border border-teal-100 transition-all hover:shadow-md hover:bg-teal-50">
                <h3 className="font-semibold text-teal-900 mb-2">Expert Backed</h3>
                <p className="text-sm text-teal-800/80">Our catalog is reviewed and approved by certified health professionals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
