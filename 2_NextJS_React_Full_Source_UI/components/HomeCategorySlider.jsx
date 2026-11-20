'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function HomeCategorySlider({ categories = [] }) {
  const trackRef = useRef(null);
  const { lang = 'en' } = useCart();

  const defaultCats = [
    { id: 1, name: 'Smartphones', name_ar: 'الهواتف الذكية', slug: 'phone', icon: 'fa-mobile-screen-button' },
    { id: 2, name: 'Wireless Earbuds', name_ar: 'سماعات لاسلكية', slug: 'earbuds-audio', icon: 'fa-headphones' },
    { id: 3, name: 'Smartwatches', name_ar: 'ساعات ذكية', slug: 'smartwatches-bands', icon: 'fa-clock' },
    { id: 4, name: 'Power Banks', name_ar: 'بنوك الطاقة', slug: 'power-banks-magsafe', icon: 'fa-battery-full' },
    { id: 5, name: 'Fast Chargers', name_ar: 'شواحن سريعة', slug: 'chargers-cables', icon: 'fa-plug' },
    { id: 6, name: 'Sunglasses', name_ar: 'نظارات شمسية', slug: 'sunglasses-smart-glasses', icon: 'fa-glasses' },
    { id: 7, name: 'Cases & Covers', name_ar: 'كفرات وحماية', slug: 'cover', icon: 'fa-shield-halved' },
    { id: 8, name: 'Car Accessories', name_ar: 'إكسسوارات سيارات', slug: 'car-accessories', icon: 'fa-car' },
    { id: 9, name: 'Camera & Drones', name_ar: 'كاميرات وطائرات درون', slug: 'camera-photography', icon: 'fa-camera' },
    { id: 10, name: 'Gaming Gear', name_ar: 'ملحقات الألعاب', slug: 'computer-gaming', icon: 'fa-gamepad' },
  ];

  const displayCategories =
    Array.isArray(categories) && categories.length > 0 ? categories : defaultCats;

  // Auto-scroll animation for both desktop and mobile in a single continuous line with pause on hover/touch
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId;
    let isUserInteracting = false;
    let resumeTimeout;

    const animate = () => {
      if (!isUserInteracting && track) {
        const halfWidth = track.scrollWidth / 2;
        if (halfWidth > 0) {
          if (track.scrollLeft >= halfWidth) {
            track.scrollLeft -= halfWidth;
          }
          track.scrollLeft += 0.8; // Smooth continuous 60fps auto-scroll
        }
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const pause = () => {
      isUserInteracting = true;
      clearTimeout(resumeTimeout);
    };

    const resume = () => {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(() => {
        isUserInteracting = false;
      }, 1200);
    };

    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', resume, { passive: true });
    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resumeTimeout);
      if (track) {
        track.removeEventListener('touchstart', pause);
        track.removeEventListener('touchend', resume);
        track.removeEventListener('mouseenter', pause);
        track.removeEventListener('mouseleave', resume);
      }
    };
  }, [displayCategories]);

  const handleArrowScroll = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="category-section" style={{ padding: '16px 0 20px' }}>
      <div className="category-container" style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 15px' }}>
        {/* Section Header with Title & View All */}
        <div className="featured-cat-header">
          <h2 className="featured-cat-title">
            {lang === 'ar' ? 'التصنيفات المميزة' : 'Featured Categories'}
          </h2>
          <Link href="/products" className="featured-cat-view-all">
            {lang === 'ar' ? 'عرض الكل' : 'View All'}{' '}
            <i
              className={`fa-solid ${lang === 'ar' ? 'fa-arrow-left' : 'fa-arrow-right'}`}
              style={{ fontSize: '11px', marginInlineStart: '4px' }}
            ></i>
          </Link>
        </div>

        {/* Categories Single-Line Auto-Scroll Container */}
        <div className="featured-cat-slider-container">
          {/* Desktop Navigation Arrows */}
          <button
            type="button"
            className="cat-slider-arrow cat-slider-arrow-prev pc-only"
            onClick={() => handleArrowScroll('left')}
            aria-label="Previous Categories"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            type="button"
            className="cat-slider-arrow cat-slider-arrow-next pc-only"
            onClick={() => handleArrowScroll('right')}
            aria-label="Next Categories"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>

          <div className="featured-cat-scroll-track" ref={trackRef}>
            {/* Primary category list */}
            {displayCategories.map((cat) => {
              const categoryLabel = lang === 'ar' ? (cat.name_ar || cat.name) : (cat.name || cat.name_ar);
              return (
                <Link
                  key={`cat-${cat.id}`}
                  href={`/products?category=${cat.slug}`}
                  className="featured-cat-item-link"
                >
                  <div className="featured-cat-square-box">
                    <i className={`fa-solid ${cat.icon || 'fa-box'}`}></i>
                  </div>
                  <span className="featured-cat-label-text">{categoryLabel}</span>
                </Link>
              );
            })}

            {/* Seamless duplicate set for continuous infinite loop */}
            {displayCategories.map((cat) => {
              const categoryLabel = lang === 'ar' ? (cat.name_ar || cat.name) : (cat.name || cat.name_ar);
              return (
                <Link
                  key={`cat-dup-${cat.id}`}
                  href={`/products?category=${cat.slug}`}
                  className="featured-cat-item-link featured-cat-item-duplicate"
                  aria-hidden="true"
                  tabIndex={-1}
                >
                  <div className="featured-cat-square-box">
                    <i className={`fa-solid ${cat.icon || 'fa-box'}`}></i>
                  </div>
                  <span className="featured-cat-label-text">{categoryLabel}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
