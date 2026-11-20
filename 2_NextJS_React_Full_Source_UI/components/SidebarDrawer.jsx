'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function SidebarDrawer({ storeName = 'Jawali Telecom' }) {
  const pathname = usePathname();
  const { isSidebarOpen, setIsSidebarOpen, wishlist = [], theme, toggleTheme, lang, toggleLanguage, t } = useCart();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div
        className="left-sidebar-overlay"
        style={{ display: isSidebarOpen ? 'block' : 'none' }}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <div className={`left-sidebar-drawer ${isSidebarOpen ? 'open active' : ''}`}>
        <button
          className="sidebar-close-btn"
          onClick={() => setIsSidebarOpen(false)}
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="sidebar-header-box">
          <div className="sidebar-user-icon">
            <i className="fa-solid fa-store"></i>
          </div>
          <div className="sidebar-user-info">
            <h3>{lang === 'ar' ? 'جوالي تليكوم' : storeName}</h3>
            <p>{lang === 'ar' ? 'البحرين • إلكترونيات وهواتف ذكية' : 'Bahrain • Premium Smartphones & Gadgets'}</p>
          </div>
        </div>

        <ul className="sidebar-menu-list">
          {/* Language Switcher inside Sidebar */}
          <li style={{ background: 'rgba(255,102,0,0.06)', borderRadius: '10px', margin: '4px 0' }}>
            <button
              type="button"
              onClick={toggleLanguage}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: '#FF6600',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-globe" style={{ fontSize: '18px' }}></i>
                {lang === 'ar' ? 'اللغة الحالية: العربية' : 'Current Language: English'}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  background: '#FF6600',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '10px',
                }}
              >
                {lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              </span>
            </button>
          </li>

          <li>
            <Link href="/" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-house"></i> {t('home')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/products" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-layer-group"></i> {t('all_products')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/offers" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-fire"></i> {t('offers')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/new-arrivals" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-sparkles"></i> {t('new_arrivals')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/track-order" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-truck-fast"></i> {t('track_order')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/wishlist" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-heart" style={{ color: '#EF4444' }}></i> {t('wishlist')} ({wishlist?.length || 0})</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/cart" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-bag-shopping"></i> {t('shopping_cart')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/checkout" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-credit-card"></i> {t('fast_checkout')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/about" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-circle-info"></i> {t('about_us')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setIsSidebarOpen(false)}>
              <span><i className="fa-solid fa-headset"></i> {t('contact_us')}</span>
              <i className="fa-solid fa-chevron-right"></i>
            </Link>
          </li>

          {/* Dark Mode in Drawer */}
          <li style={{ borderTop: '1px solid var(--border-color)', marginTop: '8px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-color)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-moon" style={{ color: '#FF6600', fontSize: '18px' }}></i>
                {theme === 'dark' ? t('light_mode') : t('dark_mode')}
              </span>
              <span style={{ fontSize: '12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-color)' }}>
                {theme === 'dark' ? 'Dark ON' : 'Light ON'}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
