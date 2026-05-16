// Server component: emits BreadcrumbList JSON-LD for SEO.
// Useful for product/category/brand/post pages so Google understands
// the site hierarchy + can show breadcrumb in SERP.

interface Crumb {
  name: string;
  url: string;
}

interface Props {
  crumbs: Crumb[];
}

export default function BreadcrumbSchema({ crumbs }: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
