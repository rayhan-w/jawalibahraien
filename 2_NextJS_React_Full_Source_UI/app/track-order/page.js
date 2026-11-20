'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const { lang, t } = useCart();

  const [query, setQuery] = useState(queryParam);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  const fetchTrack = async (searchVal) => {
    if (!searchVal.trim()) return;
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const res = await fetch(`/api/track-order?query=${encodeURIComponent(searchVal.trim())}`);
      const json = await res.json();
      if (json.success && json.data) {
        setOrderData(json.data);
      } else {
        setError(json.message || (lang === 'ar' ? 'لم يتم العثور على طلب بهذا الرقم' : 'No orders found matching this tracking ID or phone number.'));
      }
    } catch (err) {
      setError(lang === 'ar' ? 'حدث خطأ أثناء الاستعلام. يرجى المحاولة مرة أخرى.' : 'Error retrieving tracking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      fetchTrack(queryParam);
    }
  }, [queryParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTrack(query);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 15px 70px 15px' }}>
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-color)', margin: '0 0 8px 0' }}>
          <i className="fa-solid fa-truck-fast" style={{ color: '#FF6600', marginRight: '10px' }}></i>
          {t('track_your_order')}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B' }}>
          {t('enter_order_or_phone')}
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '10px',
          maxWidth: '550px',
          margin: '0 auto 40px auto',
          background: 'var(--card-bg)',
          padding: '8px',
          borderRadius: '35px',
          border: '2px solid var(--border-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <input
          type="text"
          required
          placeholder={lang === 'ar' ? 'رقم الطلب (مثال: JAW-1001) أو رقم الجوال...' : 'Order ID (e.g. JAW-1001) or Phone...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            padding: '10px 18px',
            fontSize: '14px',
            color: 'var(--text-color)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: '30px',
            border: 'none',
            background: '#FF6600',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {loading ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <>
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>{t('check_status')}</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div style={{ maxWidth: '550px', margin: '0 auto 30px auto', padding: '16px', borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECDD3', color: '#DC2626', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
          {error}
        </div>
      )}

      {/* Tracking Result Card */}
      {orderData && (
        <div
          style={{
            background: 'var(--card-bg)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '25px' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                {t('order_number')}
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#FF6600', margin: '4px 0 0 0' }}>
                {orderData.order_number}
              </h2>
            </div>

            <div style={{ textAlign: lang === 'ar' ? 'left' : 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: '#ECFDF5',
                  color: '#059669',
                  fontWeight: '800',
                  fontSize: '13px',
                }}
              >
                {t('status_in_courier')}
              </span>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                Tracking: <strong style={{ color: '#0F172A' }}>{orderData.tracking_code}</strong>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '30px' }}>
            {orderData.timeline?.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: step.completed ? '#FF6600' : '#E2E8F0',
                    color: step.completed ? '#FFFFFF' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  <i className={`fa-solid ${step.completed ? 'fa-check' : 'fa-clock'}`}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: step.completed ? 'var(--text-color)' : '#94A3B8' }}>
                    {lang === 'ar' && step.title_ar ? step.title_ar : step.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{step.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Grid */}
          <div style={{ background: 'var(--search-bg)', borderRadius: '14px', padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
            <div>
              <strong style={{ color: '#64748B', display: 'block', marginBottom: '3px' }}>Recipient:</strong>
              <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{orderData.customer_name}</span>
            </div>
            <div>
              <strong style={{ color: '#64748B', display: 'block', marginBottom: '3px' }}>Courier Partner:</strong>
              <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{orderData.courier_name}</span>
            </div>
            <div>
              <strong style={{ color: '#64748B', display: 'block', marginBottom: '3px' }}>Payment Method:</strong>
              <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{orderData.payment_method} ({orderData.payment_status})</span>
            </div>
            <div>
              <strong style={{ color: '#64748B', display: 'block', marginBottom: '3px' }}>Delivery Destination:</strong>
              <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{orderData.delivery_address}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px 0' }}>Loading tracking...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
