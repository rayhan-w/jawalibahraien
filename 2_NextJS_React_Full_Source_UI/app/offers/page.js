'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function OffersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?filter=offers&sort=${sortBy}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProducts(json.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [sortBy]);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '25px 15px 70px 15px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
        <span style={{ color: '#FF6600', fontWeight: '600' }}>Offers & Deals</span>
      </div>

      {/* Banner / Header Box */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          border: '1px solid #FED7AA',
          borderRadius: '18px',
          padding: '28px 30px',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: '#FF6600',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px',
            }}
          >
            🔥 Special Deals
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1E293B', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
            Exclusive Offers & Discounts
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, maxWidth: '520px' }}>
            Enjoy the best price drops, bundle offers, and seasonal discounts on genuine tech gadgets.
          </p>
        </div>

        {/* Sort dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid or Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#FF6600', marginBottom: '10px' }}></i>
          <p>Loading offers...</p>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            maxWidth: '550px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 102, 0, 0.1)',
              color: '#FF6600',
              fontSize: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <i className="fa-solid fa-tags"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '8px' }}>
            No Offers Currently Available
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 24px 0' }}>
            Currently there are no active promotional discount products. New special deals will be added here shortly!
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: '#FF6600',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)',
            }}
          >
            <span>Explore All Products</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      ) : (
        <div
          className="product-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
