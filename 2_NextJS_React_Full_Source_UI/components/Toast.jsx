'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="jawali-global-toast">
      <i className="fa-solid fa-circle-check" style={{ fontSize: '18px' }}></i>
      <span>{toastMessage}</span>
    </div>
  );
}
