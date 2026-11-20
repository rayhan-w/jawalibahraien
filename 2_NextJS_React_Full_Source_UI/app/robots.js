const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jawalitelecombd.com';

export const dynamic = 'force-dynamic';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/cart',
          '/checkout',
          '/admin/login',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/admin/',
          '/cart',
          '/checkout',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
