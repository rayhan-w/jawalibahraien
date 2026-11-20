'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer({ storeName = 'Jawali Telecom' }) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer
      className="site-main-footer"
      style={{
        background: '#0F172A',
        color: '#94A3B8',
        paddingTop: '50px',
        fontSize: '13px',
        borderTop: '1px solid #1E293B',
        width: '100%',
        clear: 'both',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1250px',
          margin: '0 auto',
          padding: '0 20px 40px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '35px',
        }}
      >
        {/* Brand Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <img
              src="/logo.PNG"
              alt={storeName}
              style={{
                height: '40px',
                width: 'auto',
                borderRadius: '8px',
                background: '#FFFFFF',
                padding: '3px 8px',
                display: 'block',
              }}
            />
            <h3 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              {storeName}
            </h3>
          </div>

          <p style={{ lineHeight: '1.6', margin: '0 0 18px 0', fontSize: '13px', color: '#94A3B8' }}>
            Your trusted online shopping destination for authentic smartphones, smartwatches, and premium gadgets.
          </p>

          {/* Social Media Icons matching mockup */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="footer-social-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="footer-social-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="footer-social-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <i className="fa-brands fa-youtube"></i>
            </a>
            <a
              href="https://wa.me/8801339893391"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="footer-social-btn"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' }}>
            Shop
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/products" className="footer-link">Categories</Link></li>
            <li><Link href="/new-arrivals" className="footer-link">New Arrivals</Link></li>
            <li><Link href="/offers" className="footer-link">Offers & Discounts</Link></li>
            <li><Link href="/offers" className="footer-link">Flash Sale</Link></li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' }}>
            Customer Care
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/contact" className="footer-link">Contact Us</Link></li>
            <li><Link href="/track-order" className="footer-link">Track Order</Link></li>
            <li><Link href="/about" className="footer-link">Shipping & Delivery</Link></li>
            <li><Link href="/about" className="footer-link">Returns & Refunds</Link></li>
            <li><Link href="/contact" className="footer-link">FAQs</Link></li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' }}>
            Company
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link href="/about" className="footer-link">About Us</Link></li>
            <li><Link href="/about" className="footer-link">Privacy Policy</Link></li>
            <li><Link href="/about" className="footer-link">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="footer-bottom"
        style={{
          borderTop: '1px solid #1E293B',
          padding: '20px',
          background: '#0B1120',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '1250px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1', textAlign: 'center', fontWeight: '500' }}>
            Developed by <span style={{ color: '#FF6600', fontWeight: '700' }}>Nayem Khondokar 2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
