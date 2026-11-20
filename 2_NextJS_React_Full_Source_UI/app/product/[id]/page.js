import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ProductDetailActions from '@/components/ProductDetailActions';
import ProductGallery from '@/components/ProductGallery';
import ProductViewCounter from '@/components/ProductViewCounter';
import ProductCommentsSection from '@/components/ProductCommentsSection';

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jawalitelecombd.com';

async function getProduct(id) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         p.id, p.category_id, p.sub_category, p.sku, p.title, p.brand, p.price, p.old_price, 
         p.stock, p.badge, 
         CASE WHEN p.image LIKE 'data:%' THEN CONCAT('/api/products/', p.id, '/image') ELSE COALESCE(p.image, '/logo.PNG') END AS image,
         p.gallery_images, p.description, p.is_featured, p.is_bestseller, p.is_new, p.is_active, 
         p.created_at, p.condition, p.rating, p.reviews_count, p.features, p.warranty, 
         p.colors, p.sizes, p.short_description, COALESCE(p.views, 0) AS views,
         c.name AS category_name, c.slug AS category_slug 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0];
  } catch (e) {
    console.error('Error fetching product:', e);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = `${product.title} - Price in Bangladesh`;
  const desc = product.short_description || product.description || `Buy ${product.title} at best price in BD with official warranty and fast cash on delivery.`;
  const img = product.image?.startsWith('http') ? product.image : `${SITE_URL}${product.image || '/logo.PNG'}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/product/${product.id}`,
    },
    openGraph: {
      title: `${product.title} | Jawali Telecom`,
      description: desc,
      url: `${SITE_URL}/product/${product.id}`,
      siteName: 'Jawali Telecom',
      images: [
        {
          url: img,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} | Jawali Telecom`,
      description: desc,
      images: [img],
    },
  };
}

async function getRelatedProducts(categoryId, currentId) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         id, title, brand, price, old_price, stock, badge,
         CASE WHEN image LIKE 'data:%' THEN CONCAT('/api/products/', id, '/image') ELSE COALESCE(image, '/logo.PNG') END AS image,
         rating, reviews_count, condition, category_id, is_featured, is_bestseller, is_new
       FROM products 
       WHERE category_id = ? AND id != ? AND (is_active = 1 OR is_active IS NULL)
       LIMIT 4`,
      [categoryId || 0, currentId]
    );
    return rows || [];
  } catch (e) {
    return [];
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.category_id, product.id);
  const isStockOut = Number(product.stock ?? 0) <= 0;

  const discountPercent =
    product.old_price && Number(product.old_price) > Number(product.price)
      ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
      : null;

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.image?.startsWith('http') ? product.image : `${SITE_URL}${product.image || '/logo.PNG'}`],
    description: product.description || product.short_description || `${product.title} from Jawali Telecom`,
    sku: product.sku || `JWL-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Jawali Telecom',
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: 'BDT',
      price: product.price,
      priceValidUntil: '2027-12-31',
      availability: isStockOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: String(product.condition).toLowerCase() === 'old' ? 'https://schema.org/UsedCondition' : 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Jawali Telecom',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating ? parseFloat(product.rating) : 4.8,
      reviewCount: product.reviews_count ? parseInt(product.reviews_count, 10) : 15,
    },
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 15px 70px 15px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      {/* Breadcrumb Navigation: Home > Category > Subcategory (only if set) > Product */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
        {product.category_name ? (
          <Link
            href={`/products?category=${encodeURIComponent(product.category_slug || product.category_name)}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {product.category_name}
          </Link>
        ) : (
          <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
        )}
        {product.sub_category && (
          <>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
            <Link
              href={`/products?category=${encodeURIComponent(product.category_slug || product.category_name)}&subcategory=${encodeURIComponent(product.sub_category)}`}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {product.sub_category}
            </Link>
          </>
        )}
        <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
        <span style={{ color: '#FF6600', fontWeight: '600' }}>{product.title}</span>
      </div>

      {/* Main Product Details Card matching mockup */}
      <div
        className="product-detail-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          background: 'var(--card-bg)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          padding: '35px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        {/* Left: Product Image & Gallery */}
        <div>
          <ProductGallery
            mainImage={product.image || '/logo.PNG'}
            galleryImages={product.gallery_images}
            badge={product.badge}
            isStockOut={isStockOut}
            discountPercent={discountPercent}
          />
        </div>

        {/* Right: Product Info & Actions matching mockup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Discount Tag Top-Left */}
          {discountPercent && (
            <div>
              <span
                style={{
                  display: 'inline-block',
                  background: '#FF6600',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                }}
              >
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Product Title */}
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '800',
              color: 'var(--text-color)',
              margin: 0,
              lineHeight: '1.35',
            }}
          >
            {product.title}
          </h1>

          {/* Real view count badge in place of star rating per client requirement */}
          <div style={{ margin: '4px 0 8px 0' }}>
            <ProductViewCounter productId={product.id} initialViews={Number(product.views || 0)} />
          </div>

          {/* Pricing Row matching mockup: ৳2,499  ৳3,100  20% OFF */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '30px', fontWeight: '800', color: '#FF6600' }}>
              ৳{Number(product.price).toLocaleString('en-US')}
            </span>
            {product.old_price && Number(product.old_price) > Number(product.price) && (
              <span style={{ fontSize: '18px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ৳{Number(product.old_price).toLocaleString('en-US')}
              </span>
            )}
            {discountPercent && (
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#FF6600',
                  background: 'rgba(255,102,0,0.1)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Stock Status Pill & Condition (New/Old) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                background: isStockOut ? '#FEF2F2' : '#ECFDF5',
                color: isStockOut ? '#DC2626' : '#059669',
              }}
            >
              <i className={`fa-solid ${isStockOut ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
              <span>{isStockOut ? 'Out of Stock' : 'In Stock'}</span>
            </span>

            {product.condition && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: String(product.condition).toLowerCase() === 'old' ? '#F1F5F9' : '#EFF6FF',
                  color: String(product.condition).toLowerCase() === 'old' ? '#475569' : '#2563EB',
                  border: `1px solid ${String(product.condition).toLowerCase() === 'old' ? '#CBD5E1' : '#BFDBFE'}`,
                }}
              >
                <i className={`fa-solid ${String(product.condition).toLowerCase() === 'old' ? 'fa-clock-rotate-left' : 'fa-certificate'}`}></i>
                <span>Condition: {String(product.condition).toUpperCase() === 'OLD' ? 'Old (Used)' : 'New (Brand New)'}</span>
              </span>
            )}
          </div>

          {/* Short Description */}
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)', margin: 0 }}>
            {product.short_description || product.description ||
              'Experience premium sound, flagship durability, and authentic craftsmanship directly backed by official warranty.'}
          </p>

          {/* Warranty Badge if set */}
          {product.warranty && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', width: 'fit-content', border: '1px solid #A7F3D0' }}>
              <i className="fa-solid fa-shield-halved"></i>
              <span>{product.warranty}</span>
            </div>
          )}

          {/* Colors / Sizes if set */}
          {(product.colors || product.sizes) && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '13px', background: 'var(--bg-color)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {product.colors && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Available Colors: </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{product.colors}</span>
                </div>
              )}
              {product.sizes && (
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Sizes / Variants: </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{product.sizes}</span>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Feature Bullet Points */}
          {(() => {
            const featureList = product.features && product.features.trim() !== ''
              ? product.features.split('\n').map((s) => s.trim()).filter(Boolean)
              : [
                  'Premium Authentic Quality',
                  'High Durability & Sleek Design',
                  'Official Warranty Protection',
                  'Fast Nationwide Delivery',
                ];

            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '4px 0' }}>
                {featureList.map((f, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-color)' }}>
                    <i className="fa-solid fa-circle-check" style={{ color: '#FF6600', width: '16px' }}></i>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Action Buttons: Quantity, Add to Cart (outline) & Buy Now (solid) */}
          <ProductDetailActions product={product} isStockOut={isStockOut} />

          {/* Delivery Information Box matching mockup */}
          <div
            style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '2px' }}>
              Delivery Information
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-truck-fast" style={{ color: '#FF6600', width: '14px' }}></i>
              <span>Free delivery on orders over ৳1,000</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-clock" style={{ color: '#FF6600', width: '14px' }}></i>
              <span>Delivery in 2-4 working days nationwide</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-money-bill-wave" style={{ color: '#059669', width: '14px' }}></i>
              <span>Cash on delivery available across Bangladesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs: Product Details, Reviews, Specs matching mockup */}
      <div
        style={{
          marginTop: '40px',
          background: 'var(--card-bg)',
          borderRadius: '18px',
          border: '1px solid var(--border-color)',
          padding: '30px',
        }}
      >
        <div style={{ display: 'flex', gap: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '20px' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#FF6600', borderBottom: '2px solid #FF6600', paddingBottom: '14px', marginBottom: '-15px' }}>
            Product Overview & Reviews
          </span>
        </div>

        <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-color)', whiteSpace: 'pre-line' }}>
          {product.description ||
            `The authentic ${product.title} is designed for users who love premium quality sound, long-lasting reliability, and seamless everyday comfort. Enjoy crystal clear audio, deep bass, and official manufacturer warranty.`}
        </p>

        {/* Specs Table */}
        <div style={{ marginTop: '20px', maxWidth: '600px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', fontWeight: '600', color: 'var(--text-muted)' }}>Brand</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-color)' }}>{product.brand || 'Jawali Telecom'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', fontWeight: '600', color: 'var(--text-muted)' }}>Category</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-color)' }}>{product.category_name || 'Gadgets'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 0', fontWeight: '600', color: 'var(--text-muted)' }}>Warranty</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: '#059669' }}>{product.warranty || 'Official Manufacturer Warranty'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: '600', color: 'var(--text-muted)' }}>Delivery Service</td>
                <td style={{ padding: '8px 0', fontWeight: '700', color: 'var(--text-color)' }}>Nationwide Cash on Delivery</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Comments & Feedback Section */}
      <ProductCommentsSection productId={product.id} />

      {/* Related Products */}
      {related.length > 0 && (
        <div style={{ marginTop: '45px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-color)' }}>
            Related Products You May Like
          </h2>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
