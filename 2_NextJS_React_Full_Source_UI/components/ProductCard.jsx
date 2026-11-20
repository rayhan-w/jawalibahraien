'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart, isInWishlist, toggleWishlist, lang, t } = useCart();
  const wishlisted = isInWishlist(product.id);

  const isStockOut = Number(product.stock ?? 0) <= 0;

  // Calculate discount percentage if old price exists
  const discountPercent =
    product.old_price && Number(product.old_price) > Number(product.price)
      ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
      : null;

  // Determine promotional badge
  const hasCustomBadge = product.badge && product.badge.trim() !== '' && product.badge !== 'New';
  const isMarkedNew = Boolean(product.is_new === 1 || product.is_new === true || product.badge === 'New');

  const displayBadge = isStockOut
    ? t('stock_out')
    : product.badge === 'Flash Sale'
    ? '⚡ Flash Sale'
    : discountPercent
    ? `-${discountPercent}%`
    : hasCustomBadge
    ? product.badge
    : isMarkedNew
    ? t('new')
    : null;

  const badgeClass = isStockOut
    ? 'stock-out-badge'
    : displayBadge === '⚡ Flash Sale'
    ? 'flash-badge'
    : 'sale-badge';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStockOut) {
      addToCart(product, 1);
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStockOut) {
      addToCart(product, 1);
      router.push('/checkout');
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const productTitle = lang === 'ar' && product.title_ar ? product.title_ar : product.title;
  const currencySymbol = lang === 'ar' ? 'د.ب' : 'BHD';

  return (
    <div
      className={`product-card ${isStockOut ? 'is-out-of-stock' : ''}`}
      onClick={() => router.push(`/product/${product.id}`)}
      style={{ cursor: 'pointer', position: 'relative' }}
    >
      {/* Badges Top Left/Right */}
      <div style={{ position: 'absolute', top: '10px', left: lang === 'ar' ? 'auto' : '10px', right: lang === 'ar' ? '10px' : 'auto', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 3 }}>
        {displayBadge && (
          <span className={`badge ${badgeClass}`}>{displayBadge}</span>
        )}
      </div>

      {/* Wishlist Heart Top Right/Left */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label="Wishlist"
        title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        style={{
          position: 'absolute',
          top: '10px',
          right: lang === 'ar' ? 'auto' : '10px',
          left: lang === 'ar' ? '10px' : 'auto',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 3,
          color: wishlisted ? '#EF4444' : '#94A3B8',
          fontSize: '13px',
          transition: 'all 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
        }}
      >
        <i className={wishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
      </button>

      {/* Product Image */}
      <div className="card-img-box">
        <img
          src={product.image || '/logo.PNG'}
          alt={productTitle}
          className="product-img"
          loading="lazy"
        />
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="card-rating" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fa-solid fa-star" style={{ color: '#F59E0B' }}></i>
            <span>{product.rating || '4.8'}</span>
            <span className="rating-count">({product.reviews_count || 12})</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
            {product.views || 24} {t('views')}
          </span>
        </div>

        <h3 className="product-title" title={productTitle}>
          {productTitle}
        </h3>

        {/* Price Area */}
        <div className="price-box">
          <span className="current-price">
            {currencySymbol} {Number(product.price).toFixed(3)}
          </span>
          {product.old_price && Number(product.old_price) > Number(product.price) && (
            <span className="old-price">
              {currencySymbol} {Number(product.old_price).toFixed(3)}
            </span>
          )}
        </div>

        {/* Dual Action Buttons */}
        <div className="card-actions">
          <button
            type="button"
            className="btn-add-cart"
            onClick={handleAddToCart}
            disabled={isStockOut}
            aria-label="Add to cart"
            title="Add to cart"
            style={{ cursor: isStockOut ? 'not-allowed' : 'pointer', opacity: isStockOut ? 0.6 : 1 }}
          >
            <i className="fa-solid fa-cart-plus"></i>
            <span>{t('add_to_cart')}</span>
          </button>
          <button
            type="button"
            className="btn-buy-now"
            onClick={handleBuyNow}
            disabled={isStockOut}
            aria-label="Buy now"
            title="Buy now - proceed directly to checkout"
            style={{ cursor: isStockOut ? 'not-allowed' : 'pointer', opacity: isStockOut ? 0.6 : 1 }}
          >
            <i className="fa-solid fa-bolt"></i>
            <span>{t('buy_now')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
