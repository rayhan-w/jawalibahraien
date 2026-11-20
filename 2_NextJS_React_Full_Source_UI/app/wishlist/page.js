'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist, addToCart } = useCart();

  const handleBuyNow = (product) => {
    addToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 15px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted, #64748B)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <span style={{ color: '#FF6600', fontWeight: '600' }}>Wishlist</span>
      </div>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-color, #0F172A)', margin: '0 0 4px 0' }}>
            My Wishlist ({wishlist.length})
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted, #64748B)' }}>
            All your saved favorite items in one place.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: 'transparent',
              color: '#EF4444',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-regular fa-trash-can"></i> Clear All
          </button>
        )}
      </div>

      {/* Wishlist Content */}
      {wishlist.length === 0 ? (
        <div
          style={{
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              marginBottom: '16px',
            }}
          >
            <i className="fa-regular fa-heart"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-color, #0F172A)' }}>
            Your wishlist is empty
          </h2>
          <p style={{ color: 'var(--text-muted, #64748B)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
            Explore our smartphones, sunglasses, smartwatches, and gadgets to add items you love to your wishlist!
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              borderRadius: '10px',
              background: '#FF6600',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '14px',
              boxShadow: '0 4px 14px rgba(255, 102, 0, 0.3)',
            }}
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '18px',
          }}
        >
          {wishlist.map((product) => {
            const isStockOut = product.stock <= 0 || product.badge === 'Stock Out';
            const discountPercent =
              product.old_price && Number(product.old_price) > Number(product.price)
                ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
                : null;

            return (
              <div
                key={product.id}
                style={{
                  background: 'var(--card-bg, #FFFFFF)',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  borderRadius: '16px',
                  padding: '14px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Badges on Top Left */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {discountPercent && (
                    <span style={{ background: '#FF6600', color: '#FFF', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>
                      -{discountPercent}%
                    </span>
                  )}
                  {product.condition && (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: '800',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: String(product.condition).toLowerCase() === 'old' ? '#F1F5F9' : '#DCFCE7',
                        color: String(product.condition).toLowerCase() === 'old' ? '#475569' : '#15803D',
                      }}
                    >
                      {String(product.condition).toUpperCase() === 'OLD' ? 'Old' : 'New'}
                    </span>
                  )}
                </div>

                {/* Remove Button Top Right */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #E2E8F0',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '12px',
                    zIndex: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>

                {/* Image */}
                <Link
                  href={`/product/${product.id}`}
                  style={{ display: 'block', height: '160px', padding: '10px', textAlign: 'center' }}
                >
                  <img
                    src={product.image || '/logo.png'}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Link>

                {/* Info */}
                <div style={{ marginTop: '10px' }}>
                  <Link
                    href={`/product/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        margin: '0 0 8px 0',
                        color: 'var(--text-color, #0F172A)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '38px',
                        lineHeight: '1.35',
                      }}
                      title={product.title}
                    >
                      {product.title}
                    </h3>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#FF6600' }}>
                      ৳{Number(product.price).toLocaleString('en-US')}
                    </span>
                    {product.old_price && Number(product.old_price) > Number(product.price) && (
                      <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ৳{Number(product.old_price).toLocaleString('en-US')}
                      </span>
                    )}
                  </div>

                  {/* Actions: Buy Now & Add to Cart */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={isStockOut}
                      onClick={() => handleBuyNow(product)}
                      style={{
                        padding: '8px 0',
                        borderRadius: '8px',
                        background: '#FF6600',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: isStockOut ? 'not-allowed' : 'pointer',
                        opacity: isStockOut ? 0.6 : 1,
                      }}
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      disabled={isStockOut}
                      onClick={() => addToCart(product, 1)}
                      style={{
                        padding: '8px 0',
                        borderRadius: '8px',
                        background: 'transparent',
                        color: '#FF6600',
                        border: '1px solid #FF6600',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: isStockOut ? 'not-allowed' : 'pointer',
                        opacity: isStockOut ? 0.6 : 1,
                      }}
                    >
                      Add Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
