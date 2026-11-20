'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function WishlistDrawer() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, addToCart, isWishlistOpen, setIsWishlistOpen } = useCart();

  if (!isWishlistOpen) return null;

  const handleBuyNow = (product) => {
    addToCart(product, 1);
    setIsWishlistOpen(false);
    router.push('/checkout');
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="wishlist-overlay"
        onClick={() => setIsWishlistOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 99998,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Slide-out Drawer */}
      <div
        className="wishlist-drawer"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '420px',
          height: '100%',
          background: 'var(--header-bg, #FFFFFF)',
          boxShadow: '-6px 0 30px rgba(0, 0, 0, 0.25)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color, #E2E8F0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--card-bg, #FFFFFF)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fa-solid fa-heart"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-color, #0F172A)' }}>
                My Wishlist
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748B)', fontWeight: '600' }}>
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close Wishlist"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.05)',
              color: 'var(--text-color, #0F172A)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              transition: 'background 0.2s',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {wishlist.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted, #64748B)',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '16px',
                }}
              >
                <i className="fa-regular fa-heart"></i>
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '700', color: 'var(--text-color, #0F172A)' }}>
                Your wishlist is empty
              </h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', lineHeight: '1.5' }}>
                Save your favorite smartphones, sunglasses, and gadgets to view them anytime!
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsWishlistOpen(false);
                  router.push('/products');
                }}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: '#FF6600',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 102, 0, 0.3)',
                }}
              >
                Explore Products
              </button>
            </div>
          ) : (
            wishlist.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  background: 'var(--card-bg, #FFFFFF)',
                  border: '1px solid var(--border-color, #E2E8F0)',
                  borderRadius: '14px',
                  position: 'relative',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                }}
              >
                {/* Product Thumbnail */}
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '10px',
                    background: '#FAFAFA',
                    border: '1px solid var(--border-color, #E2E8F0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setIsWishlistOpen(false);
                    router.push(`/product/${item.id}`);
                  }}
                >
                  <img
                    src={item.image || '/logo.png'}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                  />
                </div>

                {/* Info & Actions */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          fontWeight: '700',
                          color: 'var(--text-color, #0F172A)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setIsWishlistOpen(false);
                          router.push(`/product/${item.id}`);
                        }}
                        title={item.title}
                      >
                        {item.title}
                      </h4>

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label="Remove from wishlist"
                        title="Remove"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '2px',
                          lineHeight: 1,
                        }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#FF6600' }}>
                        ৳{Number(item.price).toLocaleString('en-US')}
                      </span>
                      {item.old_price && Number(item.old_price) > Number(item.price) && (
                        <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                          ৳{Number(item.old_price).toLocaleString('en-US')}
                        </span>
                      )}
                      {item.condition && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: String(item.condition).toLowerCase() === 'old' ? '#F1F5F9' : '#DCFCE7',
                            color: String(item.condition).toLowerCase() === 'old' ? '#475569' : '#15803D',
                          }}
                        >
                          {String(item.condition).toUpperCase() === 'OLD' ? 'Old' : 'New'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Buttons Row */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleBuyNow(item)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '6px',
                        background: '#FF6600',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                      }}
                    >
                      Buy Now
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '6px',
                        background: 'transparent',
                        color: '#FF6600',
                        border: '1px solid #FF6600',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      Add Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-color, #E2E8F0)',
              background: 'var(--card-bg, #FFFFFF)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <Link
              href="/wishlist"
              onClick={() => setIsWishlistOpen(false)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #CBD5E1)',
                color: 'var(--text-color, #0F172A)',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '12px',
              }}
            >
              View Full Page
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsWishlistOpen(false)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '8px',
                background: '#0F172A',
                color: '#FFFFFF',
                textAlign: 'center',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '12px',
              }}
            >
              Go to Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
