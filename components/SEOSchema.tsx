// ── SEO Schema Components ─────────────────────────────────────────────────────
// All schemas follow Schema.org structured data standards for Google rich results

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://healthstoreinfo7.top';
const SITE_NAME = 'HealthStore';

// ── Helper ────────────────────────────────────────────────────────────────────
function SchemaScript({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );
}

// ── 1. Organization (site-wide, in layout) ────────────────────────────────────
export function OrganizationSchema() {
  return (
    <SchemaScript schema={{
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 200,
        height: 60,
      },
      description: 'Premium health, wellness, and fitness products',
      sameAs: [
        'https://www.facebook.com/healthstore',
        'https://www.twitter.com/healthstore',
        'https://www.instagram.com/healthstore',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: 'English',
      },
    }} />
  );
}

// ── 2. WebSite + SiteLinksSearchBox (site-wide, in layout) ───────────────────
export function WebSiteSchema() {
  return (
    <SchemaScript schema={{
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: 'Premium health, wellness, and fitness products',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }} />
  );
}

// ── 3. Full Product Schema ────────────────────────────────────────────────────
interface ProductSchemaProps {
  name: string;
  description: string;
  price: number;
  image: string;
  url: string;
  slug: string;
  shortDescription?: string;
  keyFeatures?: string;       // newline-separated
  categoryType?: string;
  subcategoryName?: string;
  imageAlt?: string;
  featuredImage?: string;
  readMoreLink?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  author?: {
    name: string;
    title?: string | null;
    bio?: string | null;
    expertise?: string | null;
    avatar?: string | null;
    website?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
  } | null;
}

export function ProductSchema({
  name, description, price, image, url, slug,
  shortDescription, keyFeatures, categoryType,
  subcategoryName, imageAlt, featuredImage,
  readMoreLink, createdAt, updatedAt,
  rating, reviewCount, brand = SITE_NAME, author,
}: ProductSchemaProps) {

  const features = keyFeatures
    ? keyFeatures.split('\n').map(f => f.trim()).filter(Boolean)
    : [];

  const images = [image, featuredImage].filter(Boolean) as string[];

  const productSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name,
    description: shortDescription || description,
    url,
    image: images.length === 1 ? images[0] : images,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      '@id': `${url}#offer`,
      url,
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
      ...(readMoreLink ? { url: readMoreLink } : {}),
    },
    ...(features.length > 0 ? {
      additionalProperty: features.map(f => ({
        '@type': 'PropertyValue',
        name: 'Feature',
        value: f,
      })),
    } : {}),
    ...(categoryType ? {
      category: subcategoryName
        ? `${categoryType} > ${subcategoryName}`
        : categoryType,
    } : {}),
    ...(createdAt ? { datePublished: createdAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(rating && reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.toFixed(1),
        reviewCount: reviewCount.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
    // Author aggregate rating from author trust signals
    ...(author?.rating && author?.reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: author.rating.toFixed(1),
        reviewCount: author.reviewCount.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  };

  // Build Person schema for author
  const authorSchema = author ? {
    '@type': 'Person',
    '@id': `${SITE_URL}/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: author.name,
    ...(author.title ? { jobTitle: author.title } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.expertise ? { knowsAbout: author.expertise } : {}),
    ...(author.avatar ? { image: { '@type': 'ImageObject', url: author.avatar } } : {}),
    ...(author.website ? { url: author.website } : {}),
    ...(author.twitter ? { sameAs: [`https://twitter.com/${author.twitter.replace('@', '')}`] } : {}),
    ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
    worksFor: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  } : null;

  // Article schema for the content body
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: name,
    description: shortDescription || description,
    image: images.length === 1 ? images[0] : images,
    url,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    author: authorSchema ?? {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    ...(createdAt ? { datePublished: createdAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    ...(author?.rating && author?.reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: author.rating.toFixed(1),
        reviewCount: author.reviewCount.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    } : {}),
  };

  // WebPage schema
  const webPageSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name,
    description: shortDescription || description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${url}#product` },
    primaryImageOfPage: images[0] ? {
      '@type': 'ImageObject',
      url: images[0],
      ...(imageAlt ? { description: imageAlt } : {}),
    } : undefined,
    ...(createdAt ? { datePublished: createdAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    breadcrumb: { '@id': `${url}#breadcrumb` },
    inLanguage: 'en-US',
    potentialAction: readMoreLink ? [{
      '@type': 'ReadAction',
      target: [url],
    }, {
      '@type': 'ViewAction',
      name: 'Read More',
      target: readMoreLink,
    }] : [{
      '@type': 'ReadAction',
      target: [url],
    }],
  };

  // ItemList for key features
  const itemListSchema = features.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${url}#features`,
    name: `Key Features of ${name}`,
    numberOfItems: features.length,
    itemListElement: features.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f,
    })),
  } : null;

  return (
    <>
      <SchemaScript schema={productSchema} />
      <SchemaScript schema={articleSchema} />
      <SchemaScript schema={webPageSchema} />
      {itemListSchema && <SchemaScript schema={itemListSchema} />}
      {authorSchema && <SchemaScript schema={{ '@context': 'https://schema.org', ...authorSchema }} />}
    </>
  );
}

// ── 4. BreadcrumbList ─────────────────────────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <SchemaScript schema={{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${items[items.length - 1]?.url}#breadcrumb`,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }} />
  );
}

// ── 5. CollectionPage (subcategory listing) ───────────────────────────────────
interface CategorySchemaProps {
  name: string;
  description: string;
  image: string;
  url: string;
  productCount?: number;
}

export function CategorySchema({ name, description, image, url, productCount }: CategorySchemaProps) {
  return (
    <SchemaScript schema={{
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': url,
      name,
      description,
      url,
      image: image ? {
        '@type': 'ImageObject',
        url: image,
        description: name,
      } : undefined,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      inLanguage: 'en-US',
      ...(productCount !== undefined ? {
        mainEntity: {
          '@type': 'ItemList',
          name: `${name} Products`,
          numberOfItems: productCount,
        },
      } : {}),
    }} />
  );
}

// ── 6. FAQPage ────────────────────────────────────────────────────────────────
interface FAQSchemaProps {
  faqs: Array<{ question: string; answer: string }>;
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  return (
    <SchemaScript schema={{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }} />
  );
}
