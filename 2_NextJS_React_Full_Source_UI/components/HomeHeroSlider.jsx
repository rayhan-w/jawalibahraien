'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const defaultSlides = [
  {
    badge: 'BIG SALE',
    title: 'Everything You Need, Delivered to Your Door.',
    subtitle: 'Discover quality products at amazing prices with official warranty & nationwide delivery.',
    cta_primary: 'Shop Now',
    cta_primary_link: '/products',
    cta_secondary: 'Explore Categories',
    cta_secondary_link: '/products',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    alt: 'Premium Audio & Tech Gadgets',
  },
  {
    badge: 'NEW ARRIVALS',
    title: 'Next-Gen Smartphones & Smartwatches.',
    subtitle: 'Flagship performance, certified authentic warranty, and fast cash on delivery across Bangladesh.',
    cta_primary: 'Order Now',
    cta_primary_link: '/new-arrivals',
    cta_secondary: 'View Gadgets',
    cta_secondary_link: '/products',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    alt: 'Smartwatches & Flagship Phones',
  },
  {
    badge: 'EXCLUSIVE DEALS',
    title: 'Premium Sunglasses & Protective Armor Cases.',
    subtitle: 'Elevate your daily lifestyle with 100% genuine polarized shades and impact-resistant gear.',
    cta_primary: 'Explore Deals',
    cta_primary_link: '/offers',
    cta_secondary: 'Shop All',
    cta_secondary_link: '/products',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    alt: 'Premium Sunglasses & Accessories',
  },
];

export default function HomeHeroSlider({ initialSlides }) {
  const [slides, setSlides] = useState(
    Array.isArray(initialSlides) && initialSlides.length > 0 ? initialSlides : defaultSlides
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (Array.isArray(initialSlides) && initialSlides.length > 0) {
      setSlides(initialSlides);
      return;
    }
    fetch('/api/banners')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSlides(json.data);
        }
      })
      .catch(() => {});
  }, [initialSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides]);

  const slide = slides[currentSlide] || slides[0] || defaultSlides[0];

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="hero-mockup-banner"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        minHeight: '340px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #FFFDFB 0%, #FFF8F4 50%, #FFFAF7 100%)',
        boxShadow: '0 4px 20px rgba(255, 102, 0, 0.04)',
      }}
    >
      <div
        className="hero-content-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          alignItems: 'center',
          gap: '30px',
          padding: '40px 50px',
          width: '100%',
        }}
      >
        {/* Left Content Area matching mockup */}
        <div className="hero-text-area" style={{ zIndex: 2 }}>
          {/* Small pill badge: BIG SALE */}
          <div className="hero-badge-wrap" style={{ marginBottom: '16px' }}>
            <span
              className="hero-badge"
              style={{
                display: 'inline-block',
                background: '#FF6600',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 12px',
                borderRadius: '20px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              {slide.badge || 'PROMO'}
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="hero-title"
            style={{
              fontSize: '34px',
              fontWeight: '800',
              lineHeight: '1.25',
              color: '#0F172A',
              margin: '0 0 14px 0',
              letterSpacing: '-0.5px',
            }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <p
              className="hero-subtitle"
              style={{
                fontSize: '15px',
                color: '#64748B',
                margin: '0 0 24px 0',
                lineHeight: '1.5',
                maxWidth: '480px',
              }}
            >
              {slide.subtitle}
            </p>
          )}

          {/* Buttons matching mockup */}
          <div className="hero-btn-group" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {slide.cta_primary && (
              <Link
                href={slide.cta_primary_link || slide.ctaPrimaryLink || '/products'}
                className="hero-btn-primary"
                style={{
                  padding: '12px 26px',
                  borderRadius: '8px',
                  background: '#FF6600',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 102, 0, 0.3)',
                  transition: 'all 0.2s',
                }}
              >
                <span>{slide.cta_primary || slide.ctaPrimary || 'Shop Now'}</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            )}

            {(slide.cta_secondary || slide.ctaSecondary) && (
              <Link
                href={slide.cta_secondary_link || slide.ctaSecondaryLink || '/products'}
                className="hero-btn-secondary"
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontWeight: '700',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {slide.cta_secondary || slide.ctaSecondary || 'Explore'}
              </Link>
            )}
          </div>
        </div>

        {/* Right Hero Product Image */}
        <div
          className="hero-img-wrap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            className="hero-img-box"
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
              position: 'relative',
              background: '#FFFFFF',
            }}
          >
            <img
              src={slide.image || '/logo.PNG'}
              alt={slide.alt || slide.title || 'Slide'}
              loading={currentSlide === 0 ? 'eager' : 'lazy'}
              fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.PNG';
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="hero-arrow-btn hero-arrow-prev"
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              top: '50%',
              left: '12px',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <i className="fa-solid fa-chevron-left" style={{ fontSize: '13px' }}></i>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="hero-arrow-btn hero-arrow-next"
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              top: '50%',
              right: '12px',
              transform: 'translateY(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '13px' }}></i>
          </button>
        </>
      )}

      {/* Slider Indicator Dots */}
      {slides.length > 1 && (
        <div
          className="hero-slider-dots"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50px',
            display: 'flex',
            gap: '8px',
            zIndex: 3,
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === currentSlide ? '#FF6600' : '#CBD5E1',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
