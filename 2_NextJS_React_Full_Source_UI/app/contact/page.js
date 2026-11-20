'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function ContactPage() {
  const { showToast, lang, t } = useCart();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast(lang === 'ar' ? 'تم إرسال رسالتك بنجاح! سيتواصل معك فريقنا في أقرب وقت.' : 'Your message has been sent successfully! Our team will contact you shortly.');
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '40px auto', padding: '0 15px 70px 15px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)', margin: '0 0 10px 0' }}>
          {t('contact_us')}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B' }}>
          {lang === 'ar' ? 'هل لديك أي استفسار حول المنتجات أو الضمان أو الشحن؟ تواصل معنا مباشرة' : 'Have a question about a product, warranty, or delivery? Reach out to our team directly.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '30px' }}>
        {/* Contact Info Card */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,102,0,0.1)', color: '#FF6600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {lang === 'ar' ? 'فرع مملكة البحرين' : 'Bahrain Main Showroom'}
              </h4>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                {lang === 'ar' ? 'محل ١٤، الحي التجاري، المنامة، مملكة البحرين' : 'Shop 14, Commercial District, Manama, Kingdom of Bahrain'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              <i className="fa-solid fa-phone"></i>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {t('hotline')}
              </h4>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                +973 3398 9339 / 01339893391 (10:00 AM - 10:00 PM Daily)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' }}>
                {t('email')}
              </h4>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                support@jawalibahrain.com
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
              {lang === 'ar' ? 'تواصل فوري مباشر:' : 'Instant Direct Support:'}
            </h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="https://wa.me/97333989339"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#25D366',
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '18px' }}></i> WhatsApp
              </a>
              <a
                href="tel:+97333989339"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--search-bg)',
                  color: 'var(--text-color)',
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <i className="fa-solid fa-phone" style={{ color: '#FF6600' }}></i> {t('call_to_order')}
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '18px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px 0', color: 'var(--text-color)' }}>
            {lang === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message'}
          </h3>

          {submitted ? (
            <div style={{ padding: '20px', borderRadius: '12px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', textAlign: 'center' }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: '32px', color: '#10B981', marginBottom: '8px', display: 'block' }}></i>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>
                {lang === 'ar' ? 'تم استلام رسالتك بنجاح!' : 'Message Received!'}
              </div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>
                {lang === 'ar' ? 'سيتواصل معك فريق خدمة العملاء خلال ساعات قليلة.' : 'Our customer support team will get in touch with you shortly.'}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('full_name')} *
                </label>
                <input
                  type="text"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('phone_number')} *
                </label>
                <input
                  type="tel"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {lang === 'ar' ? 'تفاصيل الرسالة أو الاستفسار' : 'Your Message'} *
                </label>
                <textarea
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: '#FF6600',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
                }}
              >
                {lang === 'ar' ? 'إرسال الرسالة الآن' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
