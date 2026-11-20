'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function FloatingQuickCart() {
  const pathname = usePathname();
  const { totalItems, subtotal } = useCart();

  // Hide on admin and checkout pages
  if (pathname?.startsWith('/admin') || pathname === '/checkout' || pathname === '/cart') {
    return null;
  }

  return (
    <Link href="/cart" className="floating-quick-cart" aria-label="View Shopping Cart">
      <div className="quick-cart-top">
        <i className="fa-solid fa-bag-shopping"></i>
        <span>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
      </div>
      <div className="quick-cart-bottom">
        <span>৳{subtotal.toLocaleString('en-US')}</span>
      </div>
    </Link>
  );
}
