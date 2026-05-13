'use client';

import { useEffect } from 'react';

/**
 * When the product page loads without a hash, set the address bar to
 * `#first-h1-slug` so the first CMS heading is reflected in the URL
 * (id is injected server-side on that h1).
 */
export default function ProductFirstH1HashUrl({ slug }: { slug: string | null }) {
  useEffect(() => {
    if (!slug) return;
    if (typeof window === 'undefined') return;
    if (window.location.hash && window.location.hash !== '#') return;

    const { pathname, search } = window.location;
    const hash = slug.startsWith('#') ? slug : `#${slug}`;
    window.history.replaceState(null, '', `${pathname}${search}${hash}`);
  }, [slug]);

  return null;
}
