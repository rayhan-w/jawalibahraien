import React, { Suspense } from 'react';
import pool from '@/lib/db';
import ProductsClient from './ProductsClient';

export const revalidate = 60;

async function getInitialCatalogData() {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.id, p.title, p.brand, p.price, p.old_price, p.stock, 
        p.badge, 
        CASE WHEN p.image LIKE 'data:%' THEN CONCAT('/api/products/', p.id, '/image') ELSE COALESCE(p.image, '/logo.PNG') END AS image,
        p.rating, p.reviews_count, p.condition, 
        p.category_id, p.sub_category, p.is_featured, p.is_bestseller, p.is_new, 
        p.is_active, p.created_at, p.sort_order,
        c.name AS category_name, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE (p.is_active = 1 OR p.is_active IS NULL)
      ORDER BY CASE WHEN p.sort_order > 0 THEN p.sort_order ELSE 999999 END ASC, p.id DESC
    `);

    const [categories] = await pool.query(`
      SELECT id, name, slug, icon FROM categories ORDER BY sort_order ASC, id ASC
    `);

    let subCategories = [];
    try {
      const [subs] = await pool.query(`
        SELECT id, category_id, name, slug, sort_order FROM sub_categories ORDER BY sort_order ASC, id ASC
      `);
      subCategories = subs || [];
    } catch (subErr) {
      console.warn('Subcategories query fallback:', subErr?.message);
    }

    return {
      initialProducts: JSON.parse(JSON.stringify(products || [])),
      initialCategories: JSON.parse(JSON.stringify(categories || [])),
      initialSubCategories: JSON.parse(JSON.stringify(subCategories || [])),
    };
  } catch (e) {
    console.error('Error fetching initial catalog data in products page:', e);
    return { initialProducts: [], initialCategories: [], initialSubCategories: [] };
  }
}

export default async function ProductsPage() {
  const { initialProducts, initialCategories, initialSubCategories } = await getInitialCatalogData();

  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#FF6600', marginBottom: '10px' }}></i>
          <p>Loading products...</p>
        </div>
      }
    >
      <ProductsClient
        initialProducts={initialProducts}
        initialCategories={initialCategories}
        initialSubCategories={initialSubCategories}
      />
    </Suspense>
  );
}
