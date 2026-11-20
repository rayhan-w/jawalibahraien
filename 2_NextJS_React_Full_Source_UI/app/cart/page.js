'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, subtotal, clearCart } = useCart();

  const estimatedDelivery = cart.length > 0 ? 60 : 0;
  const discountAmount = subtotal > 3000 ? 200 : 0;
  const grandTotal = Math.max(0, subtotal + estimatedDelivery - discountAmount);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 15px 70px 15px' }}>
      {/* Page Title matching mockup: Shopping Cart (3 items) */}
      <div style={{ marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-color)' }}>
          Shopping Cart {cart.length > 0 ? `(${cart.length} ${cart.length === 1 ? 'item' : 'items'})` : ''}
        </h1>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Review your selected gadgets and proceed to fast checkout
        </span>
      </div>

      {cart.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 20px',
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(255,102,0,0.1)',
              color: '#FF6600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              margin: '0 auto 16px auto',
            }}
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-color)' }}>
            Your cart is currently empty
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 20px auto' }}>
            Browse our catalog of authentic smartphones, smartwatches, and audio gear.
          </p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 26px',
              borderRadius: '8px',
              background: '#FF6600',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255, 102, 0, 0.25)',
            }}
          >
            <span>Explore Products</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      ) : (
        <div
          className="cart-layout-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 0.8fr',
            gap: '30px',
            alignItems: 'start',
          }}
        >
          {/* Left: Cart Items List matching mockup */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cart.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 22px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  gap: '16px',
                  flexWrap: 'wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                }}
              >
                {/* Product Thumbnail & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1', minWidth: '220px' }}>
                  <img
                    src={item.image || '/logo.PNG'}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.PNG';
                    }}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                      borderRadius: '10px',
                      background: '#FAFAFA',
                      border: '1px solid var(--border-color)',
                      padding: '4px',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-color)' }}>
                        {item.title}
                      </h3>
                      {item.condition && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: String(item.condition).toLowerCase() === 'old' ? '#F1F5F9' : '#DCFCE7',
                            color: String(item.condition).toLowerCase() === 'old' ? '#475569' : '#15803D',
                          }}
                        >
                          {String(item.condition).toUpperCase() === 'OLD' ? 'Old' : 'New'}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#FF6600' }}>
                        ৳{Number(item.price).toLocaleString('en-US')}
                      </span>
                      {item.old_price && Number(item.old_price) > Number(item.price) && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ৳{Number(item.old_price).toLocaleString('en-US')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stepper [ - ] [ 1 ] [ + ] & Trash Icon matching mockup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: 'var(--bg-color)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQty(item.id !== undefined && item.id !== null ? item.id : index, (item.qty || item.quantity || 1) - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'var(--text-color)',
                      }}
                      aria-label="Decrease quantity"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <span style={{ width: '36px', textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>
                      {item.qty || item.quantity || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id !== undefined && item.id !== null ? item.id : index, (item.qty || item.quantity || 1) + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: 'var(--text-color)',
                      }}
                      aria-label="Increase quantity"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>

                  {/* Trash Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id !== undefined && item.id !== null ? item.id : index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px',
                      transition: 'color 0.2s',
                    }}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <i className="fa-regular fa-trash-can" style={{ color: '#EF4444' }}></i>
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                onClick={clearCart}
                style={{
                  background: 'none',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fa-regular fa-trash-can"></i> Clear All / খালি করুন
              </button>
            </div>
          </div>

          {/* Right: Order Summary Card matching mockup */}
          <div
            className="checkout-summary-sidebar"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              position: 'sticky',
              top: '90px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 20px 0', color: 'var(--text-color)' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: '700' }}>৳{subtotal.toLocaleString('en-US')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery Charge</span>
                <span style={{ fontWeight: '700' }}>৳{estimatedDelivery}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#059669' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: '700' }}>-৳{discountAmount}</span>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '14px',
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-color)' }}>Total</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#FF6600' }}>
                  ৳{grandTotal.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout Button matching mockup */}
            <Link
              href="/checkout"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: '#FF6600',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '15px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(255, 102, 0, 0.25)',
                marginBottom: '14px',
              }}
            >
              <span>Proceed to Checkout</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>

            {/* Continue Shopping Link matching mockup */}
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/products"
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
