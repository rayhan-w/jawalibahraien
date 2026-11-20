'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ProductViewCounter({ productId, initialViews = 0 }) {
  const [views, setViews] = useState(initialViews);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    if (!productId) return;

    fetch(`/api/products/${productId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.views === 'number') {
          setViews(data.views);
        }
      })
      .catch((err) => console.error('Error tracking view:', err));
  }, [productId]);

  return (
    <div
      className="product-view-counter-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '5px 14px',
        borderRadius: '20px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        fontSize: '13px',
        fontWeight: '700',
        color: '#64748B',
        marginBottom: '16px',
        width: 'fit-content',
      }}
    >
      <i className="fa-solid fa-eye" style={{ color: '#FF6600', fontSize: '13px' }}></i>
      <span>{views} views</span>
    </div>
  );
}
