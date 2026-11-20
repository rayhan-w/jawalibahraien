'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    store_name: 'Jawali Telecom',
    store_logo: '/logo.PNG',
    store_phone: '01339893391',
    store_email: 'support@jawalitelecom.com',
    store_address: 'বাইপাস রোড, রামগঞ্জ টাওয়ারের সামনে, রামগঞ্জ, লক্ষ্মীপুর (Bypass Road, In Front of Ramganj Tower, Ramganj, Lakshmipur)',
    delivery_inside_dhaka: '60',
    delivery_outside_dhaka: '120',
    bkash_number: '01339893393 (Personal)',
    nagad_number: '01800-000000 (Personal)',
    whatsapp_number: '+8801339893391',
    messenger_url: 'https://m.me/jawalitelecom',
    steadfast_api_key: '',
    steadfast_secret_key: '',
    homepage_top_seller_enabled: 'true',
    homepage_top_seller_title: 'Top Seller',
    facebook_domain_verification: 'gyszsdxnwydqp47omymsfwg0k06r5g',
    fb_pixel_id: '',
    fb_access_token: '',
    has_fb_access_token: false,
    fb_test_event_code: '',
    fb_test_mode_enabled: 'false',
    gtm_id: '',
    ga4_id: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [trackingTestLoading, setTrackingTestLoading] = useState(false);
  const [trackingTestResult, setTrackingTestResult] = useState(null);

  const handleTestTracking = async () => {
    setTrackingTestLoading(true);
    setTrackingTestResult(null);
    try {
      const res = await fetch('/api/admin/tracking/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fb_pixel_id: form.fb_pixel_id,
          fb_access_token: form.fb_access_token?.startsWith('••••') ? '' : form.fb_access_token,
          fb_test_event_code: form.fb_test_event_code,
        }),
      });
      const json = await res.json();
      setTrackingTestResult(json);
    } catch (e) {
      setTrackingTestResult({ success: false, message: 'Could not connect to tracking server.' });
    } finally {
      setTrackingTestLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setForm((prev) => ({
            ...prev,
            ...json.data,
            facebook_domain_verification: json.data.facebook_domain_verification || prev.facebook_domain_verification,
            homepage_top_seller_enabled: json.data.homepage_top_seller_enabled !== undefined ? String(json.data.homepage_top_seller_enabled) : prev.homepage_top_seller_enabled,
            homepage_top_seller_title: json.data.homepage_top_seller_title || prev.homepage_top_seller_title,
            fb_test_event_code: json.data.fb_test_event_code || prev.fb_test_event_code,
            fb_test_mode_enabled: json.data.fb_test_mode_enabled !== undefined ? String(json.data.fb_test_mode_enabled) : prev.fb_test_mode_enabled,
          }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMessage('Store settings have been updated successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        alert(json.message || 'Failed to save settings');
      }
    } catch (err) {
      alert('A server error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSteadfast = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      // First save if needed
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steadfast_api_key: form.steadfast_api_key,
          steadfast_secret_key: form.steadfast_secret_key,
        }),
      });

      const res = await fetch('/api/admin/courier/steadfast?test=1');
      const json = await res.json();
      setTestResult(json);
    } catch (e) {
      setTestResult({ success: false, message: 'Could not connect to server.' });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#FF6600', marginBottom: '10px' }}></i>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
          Store Settings & Configuration
        </h2>
        <span style={{ fontSize: '13px', color: '#64748B' }}>
          Update store details, delivery rates, payment phone numbers, and social channels
        </span>
      </div>

      {message && (
        <div
          style={{
            background: '#D1FAE5',
            color: '#065F46',
            padding: '14px 18px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <i className="fa-solid fa-circle-check"></i>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Flash Sale Quick Banner Link */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FF5500 0%, #FF6600 100%)',
            borderRadius: '16px',
            padding: '20px 24px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '15px',
            boxShadow: '0 4px 16px rgba(255,102,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
              }}
            >
              <i className="fa-solid fa-bolt"></i>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>
                Flash Sale Deals & Live Countdown
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                Configure homepage Flash Sale banner, timer, and featured deals products
              </div>
            </div>
          </div>

          <Link
            href="/admin/flash-sale"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#0F172A',
              fontWeight: '800',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Manage Flash Sale</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        {/* Section 1: Store Basic Details */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-store" style={{ color: '#FF6600' }}></i> General Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Store / Brand Name</label>
              <input
                type="text"
                name="store_name"
                value={form.store_name}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Logo Path or URL</label>
              <input
                type="text"
                name="store_logo"
                value={form.store_logo}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Helpline Phone Number</label>
              <input
                type="text"
                name="store_phone"
                value={form.store_phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Customer Support Email</label>
              <input
                type="email"
                name="store_email"
                value={form.store_email}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Store Address / Physical Outlet</label>
            <input
              type="text"
              name="store_address"
              value={form.store_address}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
            />
          </div>
        </div>

        {/* Section: Homepage Sections Configuration */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-layer-group" style={{ color: '#FF6600' }}></i> Homepage Top Seller Section
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Section Display Status
              </label>
              <select
                name="homepage_top_seller_enabled"
                value={form.homepage_top_seller_enabled}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#fff' }}
              >
                <option value="true">Enabled (Show on Homepage)</option>
                <option value="false">Disabled (Hide from Homepage)</option>
              </select>
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Toggle display of the dedicated Top Seller product grid on the homepage
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Section Title
              </label>
              <input
                type="text"
                name="homepage_top_seller_title"
                value={form.homepage_top_seller_title}
                onChange={handleChange}
                placeholder="Top Seller"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                Custom heading displayed above the Top Seller section
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Delivery Fees */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-truck-fast" style={{ color: '#FF6600' }}></i> Delivery Charges (BDT)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Inside Dhaka Delivery Charge (৳)</label>
              <input
                type="number"
                name="delivery_inside_dhaka"
                value={form.delivery_inside_dhaka}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Outside Dhaka Delivery Charge (৳)</label>
              <input
                type="number"
                name="delivery_outside_dhaka"
                value={form.delivery_outside_dhaka}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Payments & Mobile Banking Numbers */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-money-bill-wave" style={{ color: '#FF6600' }}></i> Mobile Banking Payment Numbers
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>bKash Number (Personal / Merchant)</label>
              <input
                type="text"
                name="bkash_number"
                value={form.bkash_number}
                onChange={handleChange}
                placeholder="01700-000000 (Personal)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Nagad Number (Personal / Merchant)</label>
              <input
                type="text"
                name="nagad_number"
                value={form.nagad_number}
                onChange={handleChange}
                placeholder="01800-000000 (Personal)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Customer Support Floating Links */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-headset" style={{ color: '#FF6600' }}></i> Customer Support & Channels
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>WhatsApp Number (with country code)</label>
              <input
                type="text"
                name="whatsapp_number"
                value={form.whatsapp_number}
                onChange={handleChange}
                placeholder="+8801339893391"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Messenger URL</label>
              <input
                type="text"
                name="messenger_url"
                value={form.messenger_url}
                onChange={handleChange}
                placeholder="https://m.me/jawalitelecom"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Section 5: Steadfast Courier API Integration */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '2px solid #FF6600', padding: '24px', boxShadow: '0 4px 20px rgba(255,102,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-truck-fast" style={{ color: '#FF6600', fontSize: '18px' }}></i> Steadfast Courier API Integration
            </h3>
            <span style={{ fontSize: '12px', background: form.steadfast_api_key ? '#DCFCE7' : '#FEF3C7', color: form.steadfast_api_key ? '#15803D' : '#B45309', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
              {form.steadfast_api_key ? '● Credentials Added' : '● Credentials Pending'}
            </span>
          </div>

          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0', lineHeight: '1.5' }}>
            Steadfast কুরিয়ারের প্যানেল (portal.steadfast.com.bd) থেকে আপনার <strong>API Key</strong> এবং <strong>Secret Key</strong> এখানে সেভ করে রাখুন। এর ফলে অর্ডার আসার পর ১ ক্লিকে পার্সেল বুকিং ও ট্র্যাকিং করা যাবে।
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Steadfast API Key
              </label>
              <input
                type="text"
                name="steadfast_api_key"
                value={form.steadfast_api_key}
                onChange={handleChange}
                placeholder="e.g. 981273abc87612..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Steadfast Secret Key
              </label>
              <input
                type="password"
                name="steadfast_secret_key"
                value={form.steadfast_secret_key}
                onChange={handleChange}
                placeholder="e.g. sec_xyz98124..."
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Test Connection Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleTestSteadfast}
              disabled={testLoading}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#0F172A',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: testLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {testLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Testing Connection...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-satellite-dish"></i> Test Connection & Check Balance
                </>
              )}
            </button>

            {testResult && (
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: testResult.success ? '#15803D' : '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className={`fa-solid ${testResult.success ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                {testResult.message}
              </span>
            )}
          </div>
        </div>

        {/* 6. Server-Side Tracking & Analytics (Meta Pixel & Conversions API) */}
        <div
          id="tracking"
          style={{
            background: '#FFFFFF',
            padding: '26px',
            borderRadius: '16px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '14px',
              }}
            >
              6
            </span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              Server-Side Tracking & Analytics (Meta Pixel & Conversions API)
            </h3>
          </div>

          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px 42px', lineHeight: '1.5' }}>
            Configure 100% Server-Side Tracking via Meta Conversions API (CAPI) & Browser Pixel with automatic deduplication. Bypasses iOS 14+ ad-blockers and captures all purchase conversions directly from the server.
          </p>

          {/* Dynamic Real-Time Tracking Status Banner */}
          {(() => {
            const hasPixel = Boolean(form.fb_pixel_id && form.fb_pixel_id.trim());
            const hasCapi = Boolean(form.has_fb_access_token || (form.fb_access_token && form.fb_access_token.trim()));
            const isTestMode = form.fb_test_mode_enabled === 'true' || form.fb_test_mode_enabled === '1' || form.fb_test_mode_enabled === true;

            let bannerBg = '#F8FAFC';
            let bannerBorder = '#E2E8F0';
            let bannerColor = '#475569';
            let bannerIcon = 'fa-circle-xmark';
            let bannerTitle = 'Tracking Not Configured';
            let bannerDesc = 'Neither Meta Pixel ID nor Conversions API Access Token has been set. Add your credentials below to enable tracking.';

            if (hasPixel && hasCapi) {
              bannerBg = '#F0FDF4';
              bannerBorder = '#BBF7D0';
              bannerColor = '#166534';
              bannerIcon = 'fa-circle-check';
              bannerTitle = 'Active Dual Tracking (Browser Pixel + Server-Side CAPI)';
              bannerDesc = 'Both Browser Pixel and Server-Side CAPI are configured with automatic event deduplication (eventID). Purchases and visitor actions are captured with maximum match rate and bypass ad-blockers.';
            } else if (hasPixel && !hasCapi) {
              bannerBg = '#FFFBEB';
              bannerBorder = '#FDE68A';
              bannerColor = '#92400E';
              bannerIcon = 'fa-triangle-exclamation';
              bannerTitle = 'Browser Pixel Configured (CAPI Pending)';
              bannerDesc = 'Meta Pixel is tracking in the browser, but Conversions API (CAPI) Access Token is not set. Add a System User Token to enable server-side purchase tracking.';
            } else if (!hasPixel && hasCapi) {
              bannerBg = '#FFFBEB';
              bannerBorder = '#FDE68A';
              bannerColor = '#92400E';
              bannerIcon = 'fa-triangle-exclamation';
              bannerTitle = 'Conversions API Configured (Pixel ID Pending)';
              bannerDesc = 'Conversions API Token is set, but Meta Pixel ID is missing. Add your Pixel ID to enable browser events and deduplication.';
            }

            return (
              <div
                style={{
                  background: bannerBg,
                  border: `1px solid ${bannerBorder}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '22px',
                  color: bannerColor,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <i className={`fa-solid ${bannerIcon}`} style={{ fontSize: '20px', marginTop: '2px' }}></i>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>
                      {bannerTitle}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      {bannerDesc}
                    </div>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '10px', borderTop: `1px dashed ${bannerBorder}` }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: hasPixel ? '#DCFCE7' : '#FEE2E2', color: hasPixel ? '#15803D' : '#991B1B', border: `1px solid ${hasPixel ? '#86EFAC' : '#FCA5A5'}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fa-solid ${hasPixel ? 'fa-check' : 'fa-xmark'}`}></i>
                    Meta Pixel: {hasPixel ? 'Configured' : 'Not Configured'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: hasCapi ? '#DCFCE7' : '#FEE2E2', color: hasCapi ? '#15803D' : '#991B1B', border: `1px solid ${hasCapi ? '#86EFAC' : '#FCA5A5'}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fa-solid ${hasCapi ? 'fa-check' : 'fa-xmark'}`}></i>
                    Conversions API (CAPI): {hasCapi ? 'Configured' : 'Not Configured'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: form.facebook_domain_verification ? '#DCFCE7' : '#F1F5F9', color: form.facebook_domain_verification ? '#15803D' : '#334155', border: `1px solid ${form.facebook_domain_verification ? '#86EFAC' : '#CBD5E1'}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-globe"></i>
                    Domain Verification: {form.facebook_domain_verification ? 'Configured' : 'Not Configured'}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', background: isTestMode ? '#F3E8FF' : '#F8FAFC', color: isTestMode ? '#7E22CE' : '#64748B', border: `1px solid ${isTestMode ? '#D8B4FE' : '#E2E8F0'}`, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className={`fa-solid ${isTestMode ? 'fa-vial' : 'fa-circle-dot'}`}></i>
                    Mode: {isTestMode ? 'Test Mode Active' : 'Live / Production'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Facebook Domain Verification Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
              <i className="fa-solid fa-shield-halved" style={{ color: '#10B981', marginRight: '6px' }}></i>
              Facebook Domain Verification Code
            </label>
            <input
              type="text"
              name="facebook_domain_verification"
              value={form.facebook_domain_verification || ''}
              onChange={handleChange}
              placeholder="e.g. gyszsdxnwydqp47omymsfwg0k06r5g"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Automatically renders server-side in all page &lt;head&gt; tags: &lt;meta name=&quot;facebook-domain-verification&quot; content=&quot;...&quot; /&gt;.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
            {/* Facebook Pixel ID */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                <i className="fa-brands fa-facebook" style={{ color: '#1877F2', marginRight: '6px' }}></i>
                Meta (Facebook) Pixel / Dataset ID
              </label>
              <input
                type="text"
                name="fb_pixel_id"
                value={form.fb_pixel_id || ''}
                onChange={handleChange}
                placeholder="e.g. 2885374808528526"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Your 15-16 digit Meta Pixel ID from Events Manager.
              </span>
            </div>

            {/* Test Event Code & Test Mode Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                <i className="fa-solid fa-vial" style={{ color: '#8B5CF6', marginRight: '6px' }}></i>
                Meta Test Event Code
              </label>
              <input
                type="text"
                name="fb_test_event_code"
                value={form.fb_test_event_code || ''}
                onChange={handleChange}
                placeholder="e.g. TEST77978"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="fb_test_mode_enabled"
                  name="fb_test_mode_enabled"
                  checked={form.fb_test_mode_enabled === 'true' || form.fb_test_mode_enabled === '1' || form.fb_test_mode_enabled === true}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#8B5CF6' }}
                />
                <label htmlFor="fb_test_mode_enabled" style={{ fontSize: '12px', fontWeight: '700', color: '#4B5563', cursor: 'pointer' }}>
                  Enable Test Mode (only sends test_event_code when checked)
                </label>
              </div>
            </div>
          </div>

          {/* Conversions API Access Token */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#334155', margin: 0 }}>
                <i className="fa-solid fa-key" style={{ color: '#F59E0B', marginRight: '6px' }}></i>
                Meta Conversions API (CAPI) Access Token
              </label>
              {form.has_fb_access_token && (
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', background: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                  <i className="fa-solid fa-lock" style={{ marginRight: '4px' }}></i>
                  Configured Securely
                </span>
              )}
            </div>
            <textarea
              name="fb_access_token"
              rows="3"
              value={form.fb_access_token || ''}
              onChange={handleChange}
              placeholder={form.has_fb_access_token ? "Token is securely configured on server. Paste a new token here to update it." : "EAAB... (Paste your long-lived Meta System User Access Token here)"}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'monospace',
                lineHeight: '1.4',
              }}
            />
            <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
              Stored strictly on server-side (env or database). Never leaked into client HTML, JS bundles, or public APIs.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '22px' }}>
            {/* Google Tag Manager Container ID */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                <i className="fa-brands fa-google" style={{ color: '#EA4335', marginRight: '6px' }}></i>
                Google Tag Manager (GTM) Container ID
              </label>
              <input
                type="text"
                name="gtm_id"
                value={form.gtm_id || ''}
                onChange={handleChange}
                placeholder="e.g. GTM-XXXXXXX"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Loads GTM container script across the store automatically.
              </span>
            </div>

            {/* Google Analytics 4 (GA4) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#334155' }}>
                <i className="fa-solid fa-chart-line" style={{ color: '#F97316', marginRight: '6px' }}></i>
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                name="ga4_id"
                value={form.ga4_id || ''}
                onChange={handleChange}
                placeholder="e.g. G-XXXXXXXXXX"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Loads gtag.js and tracks visitor page views.
              </span>
            </div>
          </div>

          {/* Test Server Tracking Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleTestTracking}
              disabled={trackingTestLoading}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#4F46E5',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '13px',
                cursor: trackingTestLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              {trackingTestLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Testing Server Tracking...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i> Test Meta Server-Side Event
                </>
              )}
            </button>

            {trackingTestResult && (
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: trackingTestResult.success ? '#15803D' : '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className={`fa-solid ${trackingTestResult.success ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                {trackingTestResult.message}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '16px 30px',
            borderRadius: '12px',
            background: saving ? '#94A3B8' : '#FF6600',
            color: '#fff',
            border: 'none',
            fontWeight: '800',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(255, 102, 0, 0.3)',
          }}
        >
          {saving ? 'Saving changes...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
