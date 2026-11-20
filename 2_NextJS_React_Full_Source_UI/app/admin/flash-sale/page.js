'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import FlashSaleBanner from '@/components/FlashSaleBanner';

export default function AdminFlashSalePage() {
  const [form, setForm] = useState({
    flash_sale_enabled: 'true',
    flash_sale_title: 'Flash Sale',
    flash_sale_subtitle: 'Up to 50% OFF On Selected Gadgets',
    flash_sale_end_date: '',
    flash_sale_btn_text: 'Shop Now',
    flash_sale_btn_link: '/offers',
    flash_sale_product_ids: '',
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Load current settings and all products
  useEffect(() => {
    Promise.all([
      fetch('/api/settings').then((res) => res.json()),
      fetch('/api/products?all=1&light=1').then((res) => res.json()),
    ])
      .then(([settingsJson, productsJson]) => {
        if (settingsJson.success && settingsJson.data) {
          let dateVal = settingsJson.data.flash_sale_end_date || '';
          if (dateVal && dateVal.includes(' ')) {
            dateVal = dateVal.replace(' ', 'T').slice(0, 16);
          } else if (dateVal && dateVal.includes(':')) {
            dateVal = dateVal.slice(0, 16);
          }
          setForm((prev) => ({
            ...prev,
            flash_sale_enabled: settingsJson.data.flash_sale_enabled !== 'false' && settingsJson.data.flash_sale_enabled !== '0' ? 'true' : 'false',
            flash_sale_title: settingsJson.data.flash_sale_title || 'Flash Sale',
            flash_sale_subtitle: settingsJson.data.flash_sale_subtitle || 'Up to 50% OFF On Selected Gadgets',
            flash_sale_end_date: dateVal,
            flash_sale_btn_text: settingsJson.data.flash_sale_btn_text || 'Shop Now',
            flash_sale_btn_link: settingsJson.data.flash_sale_btn_link || '/offers',
            flash_sale_product_ids: settingsJson.data.flash_sale_product_ids || '',
          }));
        }
        if (productsJson.success && productsJson.data) {
          setProducts(productsJson.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleEnabled = async () => {
    const nextVal = form.flash_sale_enabled === 'false' || form.flash_sale_enabled === '0' ? 'true' : 'false';
    setForm((prev) => ({ ...prev, flash_sale_enabled: nextVal }));
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flash_sale_enabled: nextVal }),
      });
      setMessage(nextVal === 'true' ? '⚡ Flash Sale is now LIVE on the homepage!' : '⏸️ Flash Sale has been PAUSED!');
      setTimeout(() => setMessage(''), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Quick preset helper
  const handleSetPreset = (days) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    target.setHours(23, 59, 0, 0);

    // Format as YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n) => String(n).padStart(2, '0');
    const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
    setForm((prev) => ({ ...prev, flash_sale_end_date: formatted }));
  };

  // Selected product IDs parsed
  const selectedIds = form.flash_sale_product_ids
    ? form.flash_sale_product_ids
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id) && id > 0)
    : [];

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  const handleAddProduct = (productId) => {
    if (!selectedIds.includes(productId)) {
      const nextIds = [...selectedIds, productId];
      setForm((prev) => ({ ...prev, flash_sale_product_ids: nextIds.join(',') }));
    }
  };

  const handleRemoveProduct = (productId) => {
    const nextIds = selectedIds.filter((id) => id !== productId);
    setForm((prev) => ({ ...prev, flash_sale_product_ids: nextIds.join(',') }));
  };

  // Filter available products for adding
  const availableProducts = products.filter(
    (p) =>
      !selectedIds.includes(p.id) &&
      (productSearch.trim() === '' ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase())))
  );

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flash_sale_enabled: form.flash_sale_enabled,
          flash_sale_title: form.flash_sale_title,
          flash_sale_subtitle: form.flash_sale_subtitle,
          flash_sale_end_date: form.flash_sale_end_date,
          flash_sale_btn_text: form.flash_sale_btn_text,
          flash_sale_btn_link: form.flash_sale_btn_link,
          flash_sale_product_ids: form.flash_sale_product_ids,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage('Flash Sale settings have been updated successfully!');
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#FF6600', marginBottom: '10px' }}></i>
        <p>Loading Flash Sale settings...</p>
      </div>
    );
  }

  const isLive = form.flash_sale_enabled !== 'false' && form.flash_sale_enabled !== '0';

  return (
    <div style={{ maxWidth: '1050px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#FF6600',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className="fa-solid fa-bolt"></i>
            </span>
            Flash Sale Deals Management
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Manage homepage Flash Sale banner, live countdown timer, and featured deals products
          </span>
        </div>

        {/* Live Status Badge & Toggle Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '700',
              background: isLive ? '#DCFCE7' : '#FEE2E2',
              color: isLive ? '#15803D' : '#B91C1C',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isLive ? '#15803D' : '#B91C1C',
              }}
            />
            {isLive ? 'Flash Sale is LIVE' : 'Flash Sale is PAUSED'}
          </span>

          <button
            type="button"
            onClick={handleToggleEnabled}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: isLive ? '#DC2626' : '#16A34A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <i className={`fa-solid ${isLive ? 'fa-pause' : 'fa-play'}`}></i>
            {isLive ? 'Disable Flash Sale' : 'Enable Flash Sale'}
          </button>
        </div>
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

      {/* Real-time Banner Live Preview */}
      <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-eye" style={{ color: '#FF6600' }}></i> Live Preview (Homepage Appearance)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Updates in real-time as you edit settings below
          </span>
        </div>

        <FlashSaleBanner settings={form} products={selectedProducts} />
      </div>

      {/* Main Campaign Configuration Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 18px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-sliders" style={{ color: '#FF6600' }}></i> Campaign Details & Timer Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Flash Sale Title
              </label>
              <input
                type="text"
                name="flash_sale_title"
                value={form.flash_sale_title}
                onChange={handleChange}
                placeholder="e.g. Flash Sale or বৈশাখী ফ্ল্যাশ সেল"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Offer Subtitle / Badge Highlight
              </label>
              <input
                type="text"
                name="flash_sale_subtitle"
                value={form.flash_sale_subtitle}
                onChange={handleChange}
                placeholder="e.g. Up to 50% OFF On Selected Gadgets"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Countdown End Date & Quick Presets */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700' }}>
                Countdown End Date & Time (ফ্ল্যাশ সেল সমাপ্তির সময়)
              </label>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Quick Presets:
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <input
                type="datetime-local"
                name="flash_sale_end_date"
                value={form.flash_sale_end_date}
                onChange={handleChange}
                style={{
                  flex: 1,
                  minWidth: '240px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { label: '+24 Hours', days: 1 },
                  { label: '+3 Days', days: 3 },
                  { label: '+7 Days', days: 7 },
                  { label: '+14 Days', days: 14 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleSetPreset(preset.days)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: '#F1F5F9',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
              এই তারিখে পৌঁছালে টাইমার স্বয়ংক্রিয়ভাবে সমাপ্ত হবে। খালি রাখলে ৩ দিনের চলমান টাইমার হিসেবে চলবে।
            </p>
          </div>

          {/* Action Button Label & Destination URL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Action Button Text
              </label>
              <input
                type="text"
                name="flash_sale_btn_text"
                value={form.flash_sale_btn_text}
                onChange={handleChange}
                placeholder="e.g. Shop Now"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                Button Target URL
              </label>
              <input
                type="text"
                name="flash_sale_btn_link"
                value={form.flash_sale_btn_link}
                onChange={handleChange}
                placeholder="e.g. /offers or /products?filter=offers"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Featured Products Selector */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-tags" style={{ color: '#FF6600' }}></i> Featured Flash Sale Products
              </h3>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Select specific products to display right inside the Flash Sale section on the homepage ({selectedProducts.length} selected)
              </span>
            </div>

            {selectedProducts.length > 0 && (
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, flash_sale_product_ids: '' }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Clear All Products
              </button>
            )}
          </div>

          {/* Currently Selected Products List */}
          {selectedProducts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {selectedProducts.map((p) => (
                <div
                  key={`sel-${p.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                  }}
                >
                  <img
                    src={p.image || '/logo.png'}
                    alt={p.title}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#FF6600', fontWeight: '800' }}>
                      ৳{Number(p.price).toLocaleString()}
                      {p.old_price && (
                        <span style={{ color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px', fontSize: '11px' }}>
                          ৳{Number(p.old_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(p.id)}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                    }}
                    title="Remove from Flash Sale"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', marginBottom: '24px' }}>
              <i className="fa-solid fa-basket-shopping" style={{ fontSize: '28px', color: '#94A3B8', marginBottom: '8px' }}></i>
              <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                No custom products selected yet.
              </p>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Search below to add products with special discounts into this Flash Sale.
              </span>
            </div>
          )}

          {/* Add More Products Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
              Search & Add Products to Flash Sale
            </label>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8', fontSize: '13px' }}></i>
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name or brand..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>

            <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px' }}>
              {availableProducts.slice(0, 15).map((p) => (
                <div
                  key={`avail-${p.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <img
                      src={p.image || '/logo.png'}
                      alt={p.title}
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.title}
                      </div>
                      <span style={{ fontSize: '12px', color: '#FF6600', fontWeight: '700' }}>৳{Number(p.price).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddProduct(p.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: '#FF6600',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fa-solid fa-plus"></i> Add
                  </button>
                </div>
              ))}
              {availableProducts.length === 0 && (
                <div style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
                  No available products found matching search.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '14px 28px',
              borderRadius: '10px',
              background: '#FF6600',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '800',
              fontSize: '15px',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(255, 102, 0, 0.25)',
            }}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving Flash Sale...
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i> Save Flash Sale Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
