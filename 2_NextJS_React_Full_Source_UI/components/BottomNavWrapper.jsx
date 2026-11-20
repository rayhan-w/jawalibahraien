'use client';

import React, { useState } from 'react';
import BottomNav from './BottomNav';
import LiveSearchModal from './LiveSearchModal';

import { usePathname } from 'next/navigation';
import FloatingSupport from './FloatingSupport';
import FloatingQuickCart from './FloatingQuickCart';

export default function BottomNavWrapper() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <FloatingSupport />
      <FloatingQuickCart />
      <BottomNav onOpenSearch={() => setIsSearchOpen(true)} />
      <LiveSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
