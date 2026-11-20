import React from 'react';
import Link from 'next/link';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import HomeHeroSlider from '@/components/HomeHeroSlider';
import HomeCategorySlider from '@/components/HomeCategorySlider';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import NewsletterForm from '@/components/NewsletterForm';

export const revalidate = 60;

const PRODUCT_CARD_FIELDS = `
  p.id, p.title, p.brand, p.price, p.old_price, p.stock, 
  p.badge, 
  CASE 
    WHEN p.image LIKE 'data:%' THEN CONCAT('/api/products/', p.id, '/image') 
    ELSE COALESCE(p.image, '/logo.PNG') 
  END AS image, 
  p.rating, p.reviews_count, p.condition, 
  p.category_id, p.sub_category, p.is_featured, p.is_bestseller, p.is_new, p.sort_order
`;

function sanitizeProducts(products) {
  return (products || []).map((p) => {
    let img = p.image;
    if (img && img.startsWith('data:')) {
      img = `/api/products/${p.id}/image`;
    }
    return {
      ...p,
      image: img || '/logo.PNG',
    };
  });
}

async function getFeaturedProducts() {
  try {
    // 1. Fetch products explicitly marked as featured by admin (ordered by sort_order)
    const [products] = await pool.query(
      `SELECT ${PRODUCT_CARD_FIELDS}, c.name AS category_name, c.slug AS category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE (p.is_active = 1 OR p.is_active IS NULL) AND p.is_featured = 1
       ORDER BY CASE WHEN p.sort_order > 0 THEN p.sort_order ELSE 999999 END ASC, p.id DESC LIMIT 8`
    );

    if (products && products.length > 0) {
      return sanitizeProducts(products);
    }

    // Fallback: If no products have been flagged as featured, show items ordered by sort_order
    const [latest] = await pool.query(
      `SELECT ${PRODUCT_CARD_FIELDS}, c.name AS category_name, c.slug AS category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE (p.is_active = 1 OR p.is_active IS NULL)
       ORDER BY CASE WHEN p.sort_order > 0 THEN p.sort_order ELSE 999999 END ASC, p.id DESC LIMIT 4`
    );
    return sanitizeProducts(latest || []);
  } catch (e) {
    console.error('Error fetching featured products:', e);
    return [];
  }
}

async function getTopSellingProducts() {
  try {
    const [products] = await pool.query(
      `SELECT ${PRODUCT_CARD_FIELDS}, c.name AS category_name, c.slug AS category_slug,
              COALESCE(sales.sold_units, 0) AS total_sold
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS sold_units
         FROM order_items
         GROUP BY product_id
       ) sales ON p.id = sales.product_id
       WHERE (p.is_active = 1 OR p.is_active IS NULL)
         AND (p.is_bestseller = 1 OR sales.sold_units > 0)
       ORDER BY p.is_bestseller DESC, total_sold DESC, p.id DESC
       LIMIT 8`
    );
    return sanitizeProducts(products || []);
  } catch (e) {
    console.error('Error fetching top selling products:', e);
    return [];
  }
}

async function getCategories() {
  try {
    const [categories] = await pool.query('SELECT id, name, name_ar, slug, icon, sort_order FROM categories ORDER BY sort_order ASC, id ASC');
    return categories || [];
  } catch (e) {
    console.error('Error fetching categories:', e);
    return [];
  }
}

async function getHomepageSettings() {
  try {
    const [rows] = await pool.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('homepage_top_seller_enabled', 'homepage_top_seller_title', 'store_name')"
    );
    const map = {};
    for (const r of rows) {
      map[r.setting_key] = r.setting_value;
    }
    return map;
  } catch (e) {
    return {};
  }
}

async function getBanners() {
  try {
    const [banners] = await pool.query(
      `SELECT id, badge, title, subtitle, cta_primary, cta_primary_link, cta_secondary, cta_secondary_link, 
              CASE WHEN image LIKE 'data:%' THEN CONCAT('/api/banners/', id, '/image') ELSE image END AS image, 
              alt, sort_order 
       FROM banners 
       WHERE is_active = 1 
       ORDER BY sort_order ASC, id DESC`
    );
    return banners && banners.length > 0 ? banners : [];
  } catch (e) {
    console.error('Error fetching banners:', e);
    return [];
  }
}

async function getFlashSaleData() {
  try {
    const [settingsRows] = await pool.query(
      "SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE 'flash_sale_%'"
    );
    const flashSettings = {};
    for (const r of settingsRows) {
      flashSettings[r.setting_key] = r.setting_value;
    }

    const isEnabled = flashSettings.flash_sale_enabled !== 'false' && flashSettings.flash_sale_enabled !== '0';
    if (!isEnabled) {
      return {
        settings: JSON.parse(JSON.stringify(flashSettings)),
        products: [],
      };
    }

    let flashProducts = [];
    const ids = [];
    if (flashSettings.flash_sale_product_ids && flashSettings.flash_sale_product_ids.trim()) {
      flashSettings.flash_sale_product_ids
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0)
        .forEach((id) => ids.push(id));

      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await pool.query(
          `SELECT ${PRODUCT_CARD_FIELDS}, c.name AS category_name, c.slug AS category_slug
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.id IN (${placeholders}) AND (p.is_active = 1 OR p.is_active IS NULL)
           LIMIT 12`,
          ids
        );
        flashProducts = rows || [];
      }
    }

    // Also include products that have badge "Flash Sale" or "⚡ Flash Sale"
    const [badgeRows] = await pool.query(
      `SELECT ${PRODUCT_CARD_FIELDS}, c.name AS category_name, c.slug AS category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE (p.badge = 'Flash Sale' OR p.badge LIKE '%Flash%') AND (p.is_active = 1 OR p.is_active IS NULL)
       ORDER BY p.id DESC
       LIMIT 12`
    );

    if (badgeRows && badgeRows.length > 0) {
      const existingIds = new Set(flashProducts.map((p) => p.id));
      for (const bp of badgeRows) {
        if (!existingIds.has(bp.id) && flashProducts.length < 12) {
          flashProducts.push(bp);
          existingIds.add(bp.id);
        }
      }
    }

    return {
      settings: JSON.parse(JSON.stringify(flashSettings)),
      products: sanitizeProducts(flashProducts),
    };
  } catch (e) {
    console.error('Error fetching flash sale data:', e);
    return { settings: {}, products: [] };
  }
}

export default async function HomePage() {
  const [featured, bestSellers, categories, banners, flashSaleData, homeSettings] = await Promise.all([
    getFeaturedProducts(),
    getTopSellingProducts(),
    getCategories(),
    getBanners(),
    getFlashSaleData(),
    getHomepageSettings(),
  ]);

  return (
    <div className="home-main-container" style={{ maxWidth: '1250px', margin: '0 auto', padding: '15px 15px 60px 15px' }}>
      {/* 1. Hero Banner matching mockup */}
      <section className="home-hero-section" style={{ marginBottom: '35px' }}>
        <HomeHeroSlider initialSlides={banners} />
      </section>

      {/* 2. Shop By Category matching mockup */}
      <section className="home-category-section" style={{ marginBottom: '35px' }}>
        <HomeCategorySlider categories={categories} />
      </section>

      {/* 3. Featured Products with Tabs matching mockup */}
      <section className="home-featured-section" style={{ marginBottom: '45px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-color)', margin: 0 }}>
              Featured Products
            </h2>

            {/* Filter Tabs matching mockup */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href="/products"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'rgba(255,102,0,0.1)',
                  color: '#FF6600',
                  fontSize: '12px',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                All Products
              </Link>
              <Link
                href="/new-arrivals"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  border: '1px solid var(--border-color)',
                }}
              >
                New Arrivals
              </Link>
              <Link
                href="/offers"
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  border: '1px solid var(--border-color)',
                }}
              >
                Deals
              </Link>
            </div>
          </div>

          <Link
            href="/products"
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#FF6600',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>View All</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {/* 4-Column Product Grid */}
        {featured.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-box-open" style={{ fontSize: '32px', color: '#CBD5E1', marginBottom: '10px' }}></i>
            <p style={{ margin: 0, fontSize: '14px' }}>No products available at the moment. Please check back soon!</p>
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Dynamic Flash Sale Banner & Featured Deals */}
      {flashSaleData.settings.flash_sale_enabled !== 'false' && flashSaleData.settings.flash_sale_enabled !== '0' && (
        <FlashSaleBanner settings={flashSaleData.settings} products={flashSaleData.products} />
      )}

      {/* 5. Top Selling Products matching mockup */}
      {homeSettings?.homepage_top_seller_enabled !== 'false' && homeSettings?.homepage_top_seller_enabled !== '0' && bestSellers.length > 0 && (
        <section style={{ marginBottom: '45px' }}>
          <div
            className="top-selling-header-wrap"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <h2 className="top-selling-title" style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-color)', margin: 0 }}>
              {homeSettings?.homepage_top_seller_title || 'Top Seller'}
            </h2>

            <Link
              href="/products"
              className="top-selling-view-all"
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#FF6600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>View All</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="product-grid">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Why Shop With Us? matching mockup */}
      <section style={{ marginBottom: '45px' }}>
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '30px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: 'var(--text-color)',
              marginBottom: '22px',
              textAlign: 'center',
            }}
          >
            Why Shop With Us?
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255,102,0,0.1)',
                  color: '#FF6600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)' }}>
                  Free Shipping
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  On orders over ৳1,000
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(5,150,105,0.1)',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)' }}>
                  Secure Payment
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  100% secure checkout
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(217,119,6,0.1)',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-rotate-left"></i>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)' }}>
                  Easy Returns
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Hassle-free within 7 days
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(79,70,229,0.1)',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}
              >
                <i className="fa-solid fa-headset"></i>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-color)' }}>
                  24/7 Dedicated Support
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Direct telephone & WhatsApp
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Card matching mockup */}
      <section style={{ marginBottom: '20px' }}>
        <div
          className="newsletter-card-wrapper"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '30px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'rgba(255,102,0,0.1)',
                color: '#FF6600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-color)' }}>
                Subscribe to Our Newsletter
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Get the latest deals, new arrivals, and exclusive seasonal promotions.
              </p>
            </div>
          </div>

          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
