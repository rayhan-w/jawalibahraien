'use client';

import React, { useState } from 'react';

export default function ProductGallery({ mainImage, galleryImages = [], badge, isStockOut, discountPercent }) {
  let images = [];
  if (mainImage) images.push(mainImage);

  if (Array.isArray(galleryImages)) {
    images = [...images, ...galleryImages];
  } else if (typeof galleryImages === 'string' && galleryImages.trim()) {
    try {
      const parsed = JSON.parse(galleryImages);
      if (Array.isArray(parsed)) images = [...images, ...parsed];
      else images.push(galleryImages);
    } catch {
      images.push(...galleryImages.split(',').map((s) => s.trim()).filter(Boolean));
    }
  }

  images = Array.from(new Set(images.filter(Boolean)));
  if (images.length === 0) images = ['/logo.png'];

  const [activeImg, setActiveImg] = useState(images[0] || '/logo.png');
  const [zoomStyle, setZoomStyle] = useState({
    transform: 'scale(1)',
    transformOrigin: 'center center',
  });
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center',
    });
  };

  return (
    <div>
      {/* Main Image Frame with Zoom Effect */}
      <div
        className="product-main-image-frame"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsZoomModalOpen(true)}
        style={{
          position: 'relative',
          width: '100%',
          height: '400px',
          borderRadius: '16px',
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'hidden',
          cursor: 'zoom-in',
        }}
      >
        {/* Badges */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
          {(badge || isStockOut) && (
            <span
              className={`badge ${
                badge === 'Stock Out' || isStockOut
                  ? 'stock-out-badge'
                  : badge === 'Hot'
                  ? 'hot-badge'
                  : 'new-badge'
              }`}
            >
              {isStockOut ? 'Out of Stock' : badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span
              style={{
                background: '#DC2626',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-block',
                boxShadow: '0 2px 6px rgba(220,38,38,0.3)',
              }}
            >
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Zoom Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#fff',
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <i className="fa-solid fa-magnifying-glass-plus"></i> Click to Zoom
        </div>

        <img
          src={activeImg}
          alt="Product display"
          loading="eager"
          onError={(e) => {
            if (!e.currentTarget.src.includes('logo.PNG')) {
              e.currentTarget.src = '/logo.PNG';
            }
          }}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: 'block',
            margin: '0 auto',
            transition: 'transform 0.15s ease-out',
            ...zoomStyle,
          }}
        />
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '15px',
            overflowX: 'auto',
            paddingBottom: '5px',
          }}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImg(img)}
              aria-label={`View image ${idx + 1}`}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '10px',
                border: activeImg === img ? '2px solid #FF6600' : '1px solid var(--border-color)',
                background: '#fff',
                padding: '5px',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0,
                opacity: activeImg === img ? 1 : 0.7,
                transition: 'all 0.2s',
              }}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                loading="eager"
                onError={(e) => {
                  if (!e.currentTarget.src.includes('logo.PNG')) {
                    e.currentTarget.src = '/logo.PNG';
                  }
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {isZoomModalOpen && (
        <div
          onClick={() => setIsZoomModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            onClick={() => setIsZoomModalOpen(false)}
            aria-label="Close Preview"
            style={{
              position: 'absolute',
              top: '20px',
              right: '25px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '28px',
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img
            src={activeImg}
            alt="Product Zoom"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
      )}
    </div>
  );
}
