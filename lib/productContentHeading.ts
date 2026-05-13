/**
 * Turn visible heading text into a URL-safe fragment (for id / #hash).
 */
export function slugifyHeadingText(text: string): string {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'section';
}

/**
 * Find the first <h1> in product CMS HTML, ensure it has id="slugified-title",
 * and return the slug for deep-linking (e.g. /products/foo#slug).
 */
export function injectFirstH1Id(html: string): { html: string; firstH1Slug: string | null } {
  if (!html || !/<h1[\s>]/i.test(html)) {
    return { html, firstH1Slug: null };
  }

  const re = /<h1(\s[^>]*)?>((?:.|\n)*?)<\/h1>/i;
  const m = html.match(re);
  if (!m) return { html, firstH1Slug: null };

  const attrs = m[1] ?? '';
  const inner = m[2] ?? '';

  const opening = `<h1${attrs}>`;
  const existingId = opening.match(/\sid\s*=\s*["']([^"']+)["']/i);
  if (existingId) {
    return { html, firstH1Slug: existingId[1] };
  }

  const plain = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const slug = slugifyHeadingText(plain);
  const newOpen = attrs.trim()
    ? `<h1${attrs} id="${slug}">`
    : `<h1 id="${slug}">`;
  const replacement = `${newOpen}${inner}</h1>`;
  return { html: html.replace(re, replacement), firstH1Slug: slug };
}
