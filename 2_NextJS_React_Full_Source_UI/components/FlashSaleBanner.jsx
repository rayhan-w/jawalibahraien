'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function FlashSaleBanner({ settings = {}, products = [] }) {
  const isEnabled = settings.flash_sale_enabled !== 'false' && settings.flash_sale_enabled !== '0';
  const title = settings.flash_sale_title || 'Flash Sale';
  const subtitle = settings.flash_sale_subtitle || 'Up to 50% OFF On Selected Gadgets';
  const btnText = settings.flash_sale_btn_text || 'Shop Now';
  const btnLink = settings.flash_sale_btn_link || '/offers';
  const targetDateStr = settings.flash_sale_end_date;

  const [timeLeft, setTimeLeft] = useState({
    days: '02',
    hours: '14',
    mins: '36',
    secs: '12',
    isExpired: false,
  });

  useEffect(() => {
    // If no specific end date configured or if date is in the past, calculate a rolling 3-day countdown
    let targetTime;
    if (targetDateStr) {
      const parsed = new Date(targetDateStr).getTime();
      if (!isNaN(parsed) && parsed > Date.now()) {
        targetTime = parsed;
      } else {
        const now = new Date();
        targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59).getTime();
      }
    } else {
      // Default to 3 days from today's midnight
      const now = new Date();
      targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 23, 59, 59).getTime();
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', mins: '00', secs: '00', isExpired: true });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, '0'),
        hours: String(h).padStart(2, '0'),
        mins: String(m).padStart(2, '0'),
        secs: String(s).padStart(2, '0'),
        isExpired: false,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (!isEnabled) {
    return null;
  }

  return (
    <section style={{ marginBottom: '45px' }}>
      {/* Flash Sale Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FF5500 0%, #FF6600 50%, #FF8800 100%)',
          borderRadius: '20px',
          padding: '28px 35px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '25px',
          boxShadow: '0 10px 30px rgba(255, 102, 0, 0.25)',
          marginBottom: products && products.length > 0 ? '24px' : '0',
        }}
      >
        {/* Left Flash Sale Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-bolt"></i>
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.2' }}>
              {title}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {subtitle}
            </div>
          </div>
        </div>

        {/* Center Countdown Box with Real Live Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', opacity: 0.85, marginRight: '4px' }}>
            {timeLeft.isExpired ? 'Offer Status:' : 'Ends in:'}
          </span>
          {timeLeft.isExpired ? (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '6px 16px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '14px',
                letterSpacing: '0.5px',
              }}
            >
              SALE EXPIRED
            </div>
          ) : (
            [
              { val: timeLeft.days, label: 'Days' },
              { val: timeLeft.hours, label: 'Hours' },
              { val: timeLeft.mins, label: 'Mins' },
              { val: timeLeft.secs, label: 'Secs' },
            ].map((t, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  backdropFilter: 'blur(4px)',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  minWidth: '50px',
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'monospace' }}>
                  {t.val}
                </div>
                <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.75 }}>
                  {t.label}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Action Button */}
        <Link
          href={btnLink}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            background: '#FFFFFF',
            color: '#0F172A',
            fontWeight: '800',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
          }}
        >
          <span>{btnText}</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>

      {/* Featured Flash Sale Products Grid (if any selected) */}
      {products && products.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div
            className="product-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {products.map((p) => (
              <ProductCard key={`flash-${p.id}`} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
