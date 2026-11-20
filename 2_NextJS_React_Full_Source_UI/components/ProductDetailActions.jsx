'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { trackClientAndServer } from '@/lib/trackClient';

export default function ProductDetailActions({ product, isStockOut }) {
  const router = useRouter();
  const { addToCart, isInWishlist, toggleWishlist, lang, t } = useCart();
  const [qty, setQty] = useState(1);
  const wishlisted = isInWishlist(product.id);

  useEffect(() => {
    if (product) {
      trackClientAndServer('ViewContent', {
        content_name: product.title,
        content_ids: [String(product.id)],
        content_type: 'product',
        value: parseFloat(product.price || 0),
        currency: 'BHD',
        contents: [{ id: String(product.id), quantity: 1, item_price: parseFloat(product.price || 0) }],
      });
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!isStockOut) {
      addToCart(product, qty);
    }
  };

  const handleBuyNow = () => {
    if (!isStockOut) {
      addToCart(product, qty);
      router.push('/checkout');
    }
  };

  const openWhatsApp = () => {
    const title = lang === 'ar' && product.title_ar ? product.title_ar : product.title;
    const message = encodeURIComponent(
      lang === 'ar'
        ? `مرحباً جوالي تليكوم! أرغب في طلب المنتج: "${title}" (السعر: ${product.price} د.ب). هل متوفر حالياً؟`
        : `Hello Jawali Telecom! I would like to order "${title}" (Price: ${product.price} BHD). Is it currently available?`
    );
    window.open(`https://wa.me/97333989339?text=${message}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Quantity Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700' }}>{t('quantity')}:</span>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            type="button"
            aria-label="Decrease Quantity"
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            style={{ width: '38px', height: '38px', border: 'none', background: 'var(--search-bg)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px' }}
          >
            <i className="fa-solid fa-minus"></i>
          </button>
          <span style={{ width: '45px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase Quantity"
            onClick={() => setQty((prev) => (prev < (product.stock || 10) ? prev + 1 : prev))}
            style={{ width: '38px', height: '38px', border: 'none', background: 'var(--search-bg)', color: 'var(--text-color)', cursor: 'pointer', fontSize: '14px' }}
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Main Dual Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button
          type="button"
          disabled={isStockOut}
          onClick={handleAddToCart}
          style={{
            padding: '14px',
            borderRadius: '10px',
            border: '2px solid #FF6600',
            background: 'transparent',
            color: '#FF6600',
            fontWeight: '700',
            fontSize: '15px',
            cursor: isStockOut ? 'not-allowed' : 'pointer',
            opacity: isStockOut ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <i className="fa-solid fa-cart-plus"></i> {isStockOut ? t('stock_out') : t('add_to_cart')}
        </button>

        <button
          type="button"
          disabled={isStockOut}
          onClick={handleBuyNow}
          style={{
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            background: isStockOut ? '#94A3B8' : '#FF6600',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '15px',
            cursor: isStockOut ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isStockOut ? 'none' : '0 4px 15px rgba(255, 102, 0, 0.3)',
          }}
        >
          <i className="fa-solid fa-bolt"></i> {isStockOut ? t('stock_out') : t('buy_now')}
        </button>
      </div>

      {/* Direct WhatsApp & Direct Phone Call */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <button
          type="button"
          onClick={openWhatsApp}
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: '#25D366',
            color: '#fff',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-brands fa-whatsapp" style={{ fontSize: '18px' }}></i> {t('order_via_whatsapp')}
        </button>

        <a
          href="tel:+97333989339"
          style={{
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'var(--search-bg)',
            color: 'var(--text-color)',
            fontWeight: '700',
            fontSize: '13px',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-phone" style={{ color: '#FF6600' }}></i> {t('call_to_order')}
        </a>
      </div>

      {/* Wishlist Button on Product Detail */}
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        style={{
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: wishlisted ? 'rgba(239, 68, 68, 0.08)' : 'var(--search-bg)',
          color: wishlisted ? '#EF4444' : 'var(--text-color)',
          fontWeight: '700',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
      >
        <i className={wishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} style={{ color: wishlisted ? '#EF4444' : '#94A3B8' }}></i>
        {wishlisted ? (lang === 'ar' ? 'مضاف في المفضلة' : 'Saved in Wishlist') : (lang === 'ar' ? 'حفظ في المفضلة' : 'Save to Wishlist')}
      </button>
    </div>
  );
}
