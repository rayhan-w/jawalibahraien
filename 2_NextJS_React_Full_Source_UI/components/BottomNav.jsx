'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function BottomNav({ onOpenSearch }) {
  const pathname = usePathname();
  const { totalItems, setIsSidebarOpen } = useCart();

  return (
    <nav className="glass-bottom-nav">
      <Link href="/" className={`nav-btn ${pathname === '/' ? 'active' : ''}`}>
        <i className="fa-solid fa-house"></i>
        <span>HOME</span>
      </Link>
      <button
        type="button"
        className="nav-btn"
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open Menu"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-solid fa-border-all"></i>
        <span>MENU</span>
      </button>
      <Link href="/cart" className={`nav-btn ${pathname === '/cart' ? 'active' : ''}`}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <i className="fa-solid fa-bag-shopping"></i>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </div>
        <span>CART</span>
      </Link>
      <button
        type="button"
        className="nav-btn"
        onClick={onOpenSearch}
        aria-label="Search Products"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <i className="fa-solid fa-magnifying-glass"></i>
        <span>SEARCH</span>
      </button>
      <Link href="/admin/login" className={`nav-btn ${pathname === '/admin/login' ? 'active' : ''}`}>
        <i className="fa-solid fa-user"></i>
        <span>ACCOUNT</span>
      </Link>
    </nav>
  );
}
