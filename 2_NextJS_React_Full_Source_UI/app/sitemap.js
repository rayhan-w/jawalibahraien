import pool from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jawalitelecombd.com';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const staticRoutes = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/offers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  let productRoutes = [];
  try {
    const [products] = await pool.query(
      'SELECT id FROM products WHERE is_active = 1 OR is_active IS NULL ORDER BY id DESC'
    );
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/product/${p.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Error generating product sitemap routes:', e?.message || e);
  }

  let categoryRoutes = [];
  try {
    const [categories] = await pool.query('SELECT slug FROM categories');
    categoryRoutes = categories.map((c) => ({
      url: `${BASE_URL}/products?category=${encodeURIComponent(c.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Error generating category sitemap routes:', e?.message || e);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
