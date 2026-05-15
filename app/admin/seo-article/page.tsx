'use client';

import { useState } from 'react';
import { FileText, Copy, CheckCircle2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white';

interface ArticleConfig {
  keyword: string;
  articleType: string;
  count: number;
  tone: string;
  products: string;
  metaTitle: string;
  metaDescription: string;
}

function generateArticleHTML(config: ArticleConfig): string {
  const { keyword, articleType, count, tone, products, metaTitle, metaDescription } = config;
  const productList = products.split('\n').map(p => p.trim()).filter(Boolean);
  const year = new Date().getFullYear();
  const title = metaTitle || `Best ${keyword} in ${year} — Top ${count} Picks`;
  const desc = metaDescription || `Discover the best ${keyword} in ${year}. Our experts tested and reviewed the top ${count} options to help you make the right choice.`;

  const tocItems = [
    'Quick Comparison List',
    'Top Picks Summary',
    ...productList.map((_, i) => `#${i + 1} ${productList[i] || `Product ${i + 1}`}`),
    'How We Tested',
    'Buying Guide',
    'Comparison Table',
    'FAQs',
    'Final Verdict',
  ];

  const toc = tocItems.map((item, i) =>
    `<li><a href="#section-${i + 1}" style="color:#16a34a;text-decoration:none;">${item}</a></li>`
  ).join('\n');

  const quickList = productList.length > 0
    ? productList.map((p, i) => `<li><strong>#${i + 1}</strong> ${p}</li>`).join('\n')
    : Array.from({ length: count }, (_, i) => `<li><strong>#${i + 1}</strong> Product Name ${i + 1} — Best ${i === 0 ? 'Overall' : i === 1 ? 'Budget' : i === 2 ? 'Premium' : 'Option'}</li>`).join('\n');

  const detailedReviews = (productList.length > 0 ? productList : Array.from({ length: count }, (_, i) => `Product ${i + 1}`))
    .map((p, i) => `
<h2 id="section-${i + 3}">#${i + 1} ${p}</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. This product stands out because of its exceptional quality and value for money. After extensive testing, we found it to be one of the best options available for ${keyword}.</p>

<h3>Key Features</h3>
<ul>
  <li>Feature one — describe the main benefit</li>
  <li>Feature two — another important advantage</li>
  <li>Feature three — what makes it unique</li>
  <li>Feature four — performance highlight</li>
</ul>

<h3>Pros &amp; Cons</h3>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
  <thead><tr style="background:#f0fdf4;"><th style="padding:8px 12px;text-align:left;border:1px solid #d1fae5;">Pros</th><th style="padding:8px 12px;text-align:left;border:1px solid #fef3c7;">Cons</th></tr></thead>
  <tbody>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">✓ Excellent quality</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">✗ Slightly expensive</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">✓ Easy to use</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">✗ Limited color options</td></tr>
    <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;">✓ Great value</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">✗ Shipping takes time</td></tr>
  </tbody>
</table>

<h3>Who Should Buy It?</h3>
<p>This product is ideal for people who want the best ${keyword} without compromising on quality. It's especially great for beginners and intermediate users.</p>

<p><a href="#" class="btn btn-primary">Check Price</a></p>
<hr />`).join('\n');

  const comparisonRows = (productList.length > 0 ? productList : Array.from({ length: count }, (_, i) => `Product ${i + 1}`))
    .map((p, i) => `<tr><td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600;">#${i + 1} ${p}</td><td style="padding:10px 12px;border:1px solid #e5e7eb;color:#f59e0b;">${'★'.repeat(5 - Math.min(i, 1))}${i > 0 ? '☆' : ''}</td><td style="padding:10px 12px;border:1px solid #e5e7eb;">$${(29.99 + i * 10).toFixed(2)}</td><td style="padding:10px 12px;border:1px solid #e5e7eb;">${i === 0 ? 'Best Overall' : i === 1 ? 'Best Budget' : 'Great Value'}</td><td style="padding:10px 12px;border:1px solid #e5e7eb;"><a href="#" class="btn btn-primary btn-sm">Check Price</a></td></tr>`).join('\n');

  const faqs = [
    { q: `What is the best ${keyword}?`, a: `The best ${keyword} depends on your specific needs and budget. Our top pick is #1 on this list for most users.` },
    { q: `How do I choose the right ${keyword}?`, a: `Consider your budget, intended use, and key features. Our buying guide above covers everything you need to know.` },
    { q: `Is ${keyword} worth the investment?`, a: `Yes, a quality ${keyword} can make a significant difference. We recommend investing in a reputable brand.` },
    { q: `What should I avoid when buying ${keyword}?`, a: `Avoid products with no reviews, unclear return policies, or suspiciously low prices that seem too good to be true.` },
  ].map(({ q, a }) => `
<div style="margin:1rem 0;padding:1rem;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
  <h3 style="margin:0 0 0.5rem;font-size:1rem;">${q}</h3>
  <p style="margin:0;color:#374151;">${a}</p>
</div>`).join('\n');

  return `<!-- META
title: ${title}
description: ${desc}
-->

<h1>Best ${keyword} in ${year} — Top ${count} Picks Reviewed</h1>

<p>Looking for the best <strong>${keyword}</strong>? You're in the right place. Our team of experts has spent over 40 hours researching, testing, and comparing the top options available in ${year}. Whether you're a beginner or a seasoned pro, this guide will help you find the perfect ${keyword} for your needs and budget.</p>

<p><em>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>

<h2 id="section-1">Quick Comparison List</h2>
<ol>
${quickList}
</ol>

<h2 id="section-2">Top Picks Summary</h2>
<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
  <thead>
    <tr style="background:#f0fdf4;">
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Product</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Rating</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Price</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Best For</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Link</th>
    </tr>
  </thead>
  <tbody>
${comparisonRows}
  </tbody>
</table>

<h2>Table of Contents</h2>
<ol>
${toc}
</ol>

${detailedReviews}

<h2 id="section-${count + 3}">How We Tested</h2>
<p>Our team spent over 40 hours testing each ${keyword} on this list. We evaluated them based on performance, durability, ease of use, value for money, and customer feedback. Each product was tested in real-world conditions to give you the most accurate and unbiased recommendations.</p>

<h2 id="section-${count + 4}">Buying Guide — What to Look For</h2>
<p>Before purchasing a ${keyword}, consider these key factors:</p>
<ul>
  <li><strong>Quality:</strong> Look for products made with premium materials that will last.</li>
  <li><strong>Price:</strong> Set a budget and find the best value within your range.</li>
  <li><strong>Reviews:</strong> Check verified customer reviews for real-world feedback.</li>
  <li><strong>Brand reputation:</strong> Stick to established brands with good track records.</li>
  <li><strong>Return policy:</strong> Ensure you can return the product if it doesn't meet expectations.</li>
</ul>

<h2 id="section-${count + 5}">Comparison Table</h2>
<table style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
  <thead>
    <tr style="background:#f0fdf4;">
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Product</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Rating</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Price</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Best For</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d1fae5;">Link</th>
    </tr>
  </thead>
  <tbody>
${comparisonRows}
  </tbody>
</table>

<h2 id="section-${count + 6}">Frequently Asked Questions</h2>
${faqs}

<h2 id="section-${count + 7}">Final Verdict</h2>
<p>After extensive research and testing, we're confident that the products on this list represent the best <strong>${keyword}</strong> available in ${year}. Our top pick offers the best overall value, but every option on this list is worth considering depending on your specific needs.</p>
<p>If you're still unsure, go with our #1 recommendation — it's the safest choice for most people and offers excellent value for money.</p>
<p><a href="#" class="btn btn-primary">See Our Top Pick</a></p>`;
}

export default function SEOArticlePage() {
  const [config, setConfig] = useState<ArticleConfig>({
    keyword: '',
    articleType: 'top10',
    count: 10,
    tone: 'expert',
    products: '',
    metaTitle: '',
    metaDescription: '',
  });
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  const set = (key: keyof ArticleConfig) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setConfig(p => ({ ...p, [key]: key === 'count' ? parseInt(e.target.value) || 10 : e.target.value }));

  const handleGenerate = () => {
    if (!config.keyword.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerated(generateArticleHTML(config));
      setGenerating(false);
      setShowPreview(true);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metaLines = generated.match(/<!-- META\n([\s\S]*?)\n-->/)?.[1] || '';
  const htmlContent = generated.replace(/<!-- META[\s\S]*?-->\n\n/, '');

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">SEO Article Generator</h1>
          <p className="text-xs text-gray-400 mt-0.5">Generate fully structured listicle articles ready to paste into the editor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Config */}
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-semibold text-gray-900">Article Settings</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Main Keyword <span className="text-red-500">*</span>
                </label>
                <input value={config.keyword} onChange={set('keyword')} className={inputCls}
                  placeholder="e.g. protein powder for muscle gain" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Article Type</label>
                  <select value={config.articleType} onChange={set('articleType')} className={inputCls}>
                    <option value="top10">Top 10 List</option>
                    <option value="top7">Top 7 List</option>
                    <option value="top5">Top 5 List</option>
                    <option value="best">Best Of</option>
                    <option value="review">Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Count</label>
                  <input type="number" min="3" max="20" value={config.count} onChange={set('count')} className={inputCls} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
                <select value={config.tone} onChange={set('tone')} className={inputCls}>
                  <option value="expert">Expert & Authoritative</option>
                  <option value="friendly">Friendly & Helpful</option>
                  <option value="conversational">Conversational</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Names
                  <span className="ml-1 text-xs font-normal text-gray-400">One per line (optional)</span>
                </label>
                <textarea value={config.products} onChange={set('products')} rows={5}
                  className={`${inputCls} resize-none font-mono text-xs`}
                  placeholder={`Optimum Nutrition Gold Standard\nMyProtein Impact Whey\nDymatize ISO100\nBSN Syntha-6`} />
              </div>

              {/* SEO meta toggle */}
              <button type="button" onClick={() => setShowMeta(v => !v)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors w-full">
                {showMeta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                SEO Meta (optional)
              </button>
              {showMeta && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                    <input value={config.metaTitle} onChange={set('metaTitle')} className={inputCls}
                      placeholder="Best Protein Powder 2026 — Top 10 Picks" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                    <textarea value={config.metaDescription} onChange={set('metaDescription')} rows={2}
                      className={`${inputCls} resize-none`} placeholder="150–160 chars…" />
                  </div>
                </div>
              )}

              <button onClick={handleGenerate} disabled={!config.keyword.trim() || generating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-md hover:-translate-y-0.5">
                {generating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <> Generate Article</>}
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="xl:col-span-2 space-y-4">
          {generated ? (
            <>
              {/* Meta info */}
              {metaLines && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Generated SEO Meta</p>
                  {metaLines.split('\n').map((line, i) => (
                    <p key={i} className="text-sm text-emerald-800 font-mono">{line}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
                <button onClick={() => setShowPreview(v => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-colors">
                  {showPreview ? 'Show Code' : 'Show Preview'}
                </button>
                <p className="text-xs text-gray-400 ml-auto">
                  {htmlContent.length.toLocaleString()} chars · ~{Math.round(htmlContent.split(' ').length / 200)} min read
                </p>
              </div>

              {/* Preview or code */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                {showPreview ? (
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    <div className="product-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </div>
                ) : (
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap break-all leading-relaxed">
                      {generated}
                    </pre>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>How to use:</strong> Click &quot;Copy HTML&quot;, then go to your product&apos;s Detailed Description editor, click the source/code view, and paste the HTML. Or use the editor&apos;s paste function directly.
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-500">Ready to generate</p>
                <p className="text-sm mt-1">Fill in the keyword and click Generate Article</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
