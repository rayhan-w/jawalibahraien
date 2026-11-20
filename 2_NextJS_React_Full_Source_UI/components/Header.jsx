'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import LiveSearchModal from './LiveSearchModal';

export default function Header({ storeName = 'Jawali Telecom' }) {
  const pathname = usePathname();
  const { totalItems, toggleTheme, theme, setIsSidebarOpen, wishlist = [], setIsWishlistOpen, lang, toggleLanguage, t } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="main-header">
        <div className="header-container">
          {/* Mobile Left: Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            aria-label="Open Mobile Menu"
            onClick={() => setIsSidebarOpen(true)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>

          {/* Left Area for PC / Centered Logo on Mobile */}
          <div className="header-left-group">
            <button
              className="pc-menu-btn pc-only"
              title="Menu"
              aria-label="Open Navigation Menu"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fa-solid fa-bars"></i>
            </button>

            <Link href="/" className="logo-box">
              <img src="/logo.PNG" alt={storeName} />
            </Link>
          </div>

          {/* PC Nav Links */}
          <nav className="pc-nav pc-only">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>
              {t('home')}
            </Link>
            <Link href="/products" className={pathname === '/products' ? 'active' : ''}>
              {t('all_products')}
            </Link>
            <Link href="/offers" className={pathname === '/offers' ? 'active' : ''}>
              {t('offers')}
            </Link>
            <Link href="/new-arrivals" className={pathname === '/new-arrivals' ? 'active' : ''}>
              {t('new_arrivals')}
            </Link>
            <Link href="/track-order" className={pathname === '/track-order' ? 'active' : ''}>
              {t('track_order')}
            </Link>
          </nav>

          {/* PC Search Bar */}
          <div className="search-box pc-only" onClick={() => setIsSearchOpen(true)} style={{ cursor: 'pointer' }}>
            <input
              type="text"
              readOnly
              placeholder={t('search_placeholder')}
              style={{ cursor: 'pointer' }}
            />
            <button type="button" aria-label="Search">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          {/* Action Icons for PC */}
          <div className="header-actions pc-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Switcher Button (English <-> Arabic) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="lang-switcher-btn"
              title={lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-color)',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <i className="fa-solid fa-globe" style={{ color: '#FF6600', fontSize: '14px' }}></i>
              <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="header-icon-btn"
              title="My Wishlist"
              aria-label="Wishlist"
              style={{
                position: 'relative',
                background: 'none',
                border: 'none',
                color: 'var(--text-color)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fa-regular fa-heart"></i>
              {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
            </button>

            {/* PC Cart */}
            <Link href="/cart" className="cart-btn" style={{ cursor: 'pointer', textDecoration: 'none' }} title="Shopping Cart">
              <i className="fa-solid fa-cart-shopping"></i>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>

            {/* Dark Mode Toggle */}
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme" title="Toggle Theme">
              <i className="fa-solid fa-moon" style={{ color: theme === 'dark' ? '#FBBF24' : 'var(--text-color)', fontSize: '18px', transition: 'color 0.2s' }}></i>
            </button>
          </div>

          {/* Mobile Right Icons */}
          <div className="mobile-top-icons" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Mobile Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="lang-switcher-btn"
              style={{
                padding: '4px 8px',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: '#FF6600',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>

            <button
              type="button"
              className="header-icon-btn mobile-search-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search Products"
              title="Search Products"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>

            <button
              type="button"
              className="theme-toggle-btn mobile-theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title="Toggle Theme"
            >
              <i className="fa-solid fa-moon" style={{ color: theme === 'dark' ? '#FBBF24' : 'var(--text-color)' }}></i>
            </button>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(true)}
              className="header-icon-btn"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <i className="fa-regular fa-heart"></i>
              {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
            </button>

            <Link href="/cart" className="cart-btn" title="Cart" aria-label="Cart">
              <i className="fa-solid fa-cart-shopping"></i>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>

      <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
