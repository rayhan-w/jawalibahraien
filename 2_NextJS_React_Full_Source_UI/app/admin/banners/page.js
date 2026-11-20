'use client';

import React, { useState, useEffect } from 'react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageSourceType, setImageSourceType] = useState('device'); // 'device' | 'link'

  const [form, setForm] = useState({
    badge: 'BIG SALE',
    title: '',
    subtitle: '',
    cta_primary: 'Shop Now',
    cta_primary_link: '/products',
    cta_secondary: 'Explore Deals',
    cta_secondary_link: '/products',
    image: '',
    alt: '',
    sort_order: '1',
    is_active: true,
  });

  const compressImage = (file, maxWidth = 1400, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      alert('ডিভাইস থেকে ছবি আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploading(false);
    }
  };

  const loadBanners = async () => {
    try {
      const res = await fetch('/api/banners?all=1');
      const json = await res.json();
      if (json.success) {
        setBanners(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditBanner(null);
    setImageSourceType('device');
    setForm({
      badge: 'BIG SALE',
      title: '',
      subtitle: '',
      cta_primary: 'Shop Now',
      cta_primary_link: '/products',
      cta_secondary: 'Explore Deals',
      cta_secondary_link: '/products',
      image: '',
      alt: '',
      sort_order: String(banners.length + 1),
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditBanner(b);
    setImageSourceType(b.image && b.image.startsWith('data:') ? 'device' : 'link');
    setForm({
      badge: b.badge || 'BIG SALE',
      title: b.title || '',
      subtitle: b.subtitle || '',
      cta_primary: b.cta_primary || 'Shop Now',
      cta_primary_link: b.cta_primary_link || '/products',
      cta_secondary: b.cta_secondary || 'Explore Deals',
      cta_secondary_link: b.cta_secondary_link || '/products',
      image: b.image || '',
      alt: b.alt || '',
      sort_order: String(b.sort_order || 1),
      is_active: Boolean(b.is_active !== 0),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('ব্যানারের শিরোনাম (Title) লিখুন।');
      return;
    }
    if (!form.image.trim()) {
      alert('ব্যানারের ছবি (Image) নির্বাচন করুন বা লিংক দিন।');
      return;
    }

    try {
      const url = editBanner ? `/api/banners/${editBanner.id}` : '/api/banners';
      const method = editBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        loadBanners();
      } else {
        alert(json.message || 'ব্যানার সংরক্ষণ ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ব্যানারটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadBanners();
      } else {
        alert(json.message || 'ব্যানার ডিলিট ব্যর্থ হয়েছে');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleActive = async (b) => {
    try {
      const updatedStatus = !b.is_active;
      await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      loadBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Hero Banners & Sliders Management
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            হোমপেজের স্লাইডার ব্যানার, টেক্সট, ছবি ও অফার বাটন সম্পূর্ণ এডিট করুন ({banners.length} টি ব্যানার রয়েছে)
          </span>
        </div>

        <button
          onClick={openAddModal}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            background: '#FF6600',
            color: '#fff',
            border: 'none',
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(255,102,0,0.3)',
          }}
        >
          <i className="fa-solid fa-plus"></i> Add New Banner
        </button>
      </div>

      {/* Banners Grid / List */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#FF6600', marginBottom: '10px' }}></i>
          <div>ব্যানার লোড হচ্ছে...</div>
        </div>
      ) : banners.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <i className="fa-solid fa-images" style={{ fontSize: '48px', color: '#CBD5E1', marginBottom: '16px' }}></i>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0F172A' }}>কোনো ব্যানার নেই</h3>
          <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '14px' }}>হোমপেজে স্লাইডার দেখানোর জন্য নতুন ব্যানার যোগ করুন।</p>
          <button
            onClick={openAddModal}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#FF6600',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            + নতুন ব্যানার যোগ করুন
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {banners.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Banner Image Preview */}
              <div style={{ position: 'relative', height: '180px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', overflow: 'hidden' }}>
                <img
                  src={b.image || '/logo.PNG'}
                  alt={b.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.PNG';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                  <span
                    style={{
                      background: '#FF6600',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {b.badge || 'PROMO'}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span
                    style={{
                      background: b.is_active ? '#10B981' : '#64748B',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Banner Details */}
              <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0F172A', lineHeight: '1.3' }}>
                    {b.title}
                  </h3>
                  <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>
                    {b.subtitle || 'কোনো সাবটাইটেল দেওয়া নেই'}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '12px' }}>
                    <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', color: '#334155', fontWeight: '600' }}>
                      Primary: <strong>{b.cta_primary}</strong> ({b.cta_primary_link})
                    </span>
                    {b.cta_secondary && (
                      <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', color: '#334155', fontWeight: '600' }}>
                        Secondary: <strong>{b.cta_secondary}</strong> ({b.cta_secondary_link})
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => toggleActive(b)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: b.is_active ? '#FEF2F2' : '#ECFDF5',
                        color: b.is_active ? '#DC2626' : '#059669',
                      }}
                    >
                      {b.is_active ? 'Turn OFF' : 'Turn ON'}
                    </button>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Order: #{b.sort_order}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => openEditModal(b)}
                      title="Edit Banner"
                      style={{
                        background: '#E2E8F0',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0F172A',
                      }}
                    >
                      <i className="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Delete Banner"
                      style={{
                        background: '#FEE2E2',
                        color: '#EF4444',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Banner */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '92%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                {editBanner ? 'Edit Banner / Slider' : 'Add New Banner / Slider'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Badge Text</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BIG SALE / NEW"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Banner Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Everything You Need, Delivered to Your Door."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Subtitle / Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Discover quality products at amazing prices with official warranty & nationwide delivery."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* Action Buttons setup */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Primary Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={form.cta_primary}
                    onChange={(e) => setForm({ ...form, cta_primary: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Primary Button Link</label>
                  <input
                    type="text"
                    placeholder="e.g. /products or /new-arrivals"
                    value={form.cta_primary_link}
                    onChange={(e) => setForm({ ...form, cta_primary_link: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Secondary Button Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Explore Deals"
                    value={form.cta_secondary}
                    onChange={(e) => setForm({ ...form, cta_secondary: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Secondary Button Link</label>
                  <input
                    type="text"
                    placeholder="e.g. /offers"
                    value={form.cta_secondary_link}
                    onChange={(e) => setForm({ ...form, cta_secondary_link: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Dual Image Upload System */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    Banner Image *
                  </label>
                  <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('device')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: imageSourceType === 'device' ? '#FF6600' : 'transparent',
                        color: imageSourceType === 'device' ? '#FFFFFF' : '#475569',
                      }}
                    >
                      <i className="fa-solid fa-mobile-screen-button"></i> 1. Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('link')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: imageSourceType === 'link' ? '#FF6600' : 'transparent',
                        color: imageSourceType === 'link' ? '#FFFFFF' : '#475569',
                      }}
                    >
                      <i className="fa-solid fa-link"></i> 2. Web Image Link
                    </button>
                  </div>
                </div>

                {imageSourceType === 'device' ? (
                  <div>
                    <input
                      type="file"
                      id="banner-device-image-input"
                      accept="image/*"
                      onChange={handleDeviceImageUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="banner-device-image-input"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '24px 16px',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '32px', color: '#FF6600' }}></i>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block' }}>
                          {isUploading ? 'Optimizing banner image...' : 'Choose banner image from device / gallery'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          Recommended size: 1200x500 or 800x400 (JPG, PNG, WebP)
                        </span>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or any image URL"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>
                )}

                {/* Image Live Preview */}
                {form.image && (
                  <div style={{ marginTop: '12px', position: 'relative', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img
                      src={form.image}
                      alt="Preview"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/logo.PNG';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#EF4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              {/* Sort order & Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Sort Order (ক্রম)</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: '22px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#FF6600' }}
                    />
                    <span>Active on Homepage (হোমপেজে দেখাবে)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#F1F5F9',
                    color: '#475569',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: '#FF6600',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {editBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
