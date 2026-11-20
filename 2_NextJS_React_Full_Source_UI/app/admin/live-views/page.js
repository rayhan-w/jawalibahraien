'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LiveProductViewsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'live_only', 'recent_only'
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?all=1'),
        fetch('/api/categories'),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (prodJson.success && Array.isArray(prodJson.data)) {
        // Sort by live_viewers desc, then views_24h desc, then views desc
        const sorted = [...prodJson.data].sort((a, b) => {
          const liveA = Number(a.live_viewers) || 0;
          const liveB = Number(b.live_viewers) || 0;
          if (liveB !== liveA) return liveB - liveA;

          const recentA = Number(a.views_24h) || 0;
          const recentB = Number(b.views_24h) || 0;
          if (recentB !== recentA) return recentB - recentA;

          const totalA = Number(a.views) || 0;
          const totalB = Number(b.views) || 0;
          return totalB - totalA;
        });
        setProducts(sorted);
      }

      if (catJson.success && Array.isArray(catJson.data)) {
        setCategories(catJson.data);
      }

      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to load live views data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Aggregate summary statistics
  const totalLiveViewers = products.reduce((acc, p) => acc + (Number(p.live_viewers) || 0), 0);
  const liveProductsCount = products.filter((p) => Number(p.live_viewers) > 0).length;
  const total24hViews = products.reduce((acc, p) => acc + (Number(p.views_24h) || 0), 0);
  const totalAllTimeViews = products.reduce((acc, p) => acc + (Number(p.views) || 0), 0);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);

    let matchesMode = true;
    if (filterMode === 'live_only') {
      matchesMode = Number(p.live_viewers) > 0;
    } else if (filterMode === 'recent_only') {
      matchesMode = Number(p.views_24h) > 0;
    }

    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div style={{ padding: '24px 30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(255, 102, 0, 0.25)',
              }}
            >
              <i className="fa-solid fa-eye"></i>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Live Product Viewers (লাইভ প্রোডাক্ট ভিউ)
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>
                রিয়েল-টাইমে কোন প্রোডাক্ট কতজন কাস্টমার দেখছেন এবং প্রতিটি প্রোডাক্টের ভিউ পর্যবেক্ষণ করুন
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: autoRefresh ? '1px solid #86EFAC' : '1px solid #CBD5E1',
              background: autoRefresh ? '#DCFCE7' : '#F1F5F9',
              color: autoRefresh ? '#15803D' : '#64748B',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: autoRefresh ? '#22C55E' : '#94A3B8',
                boxShadow: autoRefresh ? '0 0 0 3px rgba(34, 197, 94, 0.3)' : 'none',
              }}
            ></span>
            {autoRefresh ? 'Auto-Update ON (১০ সেকেন্ড)' : 'Auto-Update OFF'}
          </button>

          <button
            type="button"
            onClick={() => loadData(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#334155',
            }}
          >
            <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
            Refresh Now
          </button>

          {lastUpdated && (
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>
              সর্বশেষ আপডেট: {lastUpdated.toLocaleTimeString('bn-BD')}
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Card 1: Live Viewers */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '1px solid #A7F3D0',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.08)',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#10B981',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#065F46', textTransform: 'uppercase' }}>
              Active Viewers Now
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#047857' }}>
              {totalLiveViewers} <span style={{ fontSize: '14px', fontWeight: '700' }}>জন</span>
            </div>
            <div style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.4)',
                }}
              ></span>
              এখন এই মুহূর্তে প্রোডাক্ট দেখছেন
            </div>
          </div>
        </div>

        {/* Card 2: Products Being Viewed */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
            border: '1px solid #FED7AA',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(255, 102, 0, 0.06)',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#FF6600',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
            }}
          >
            <i className="fa-solid fa-fire"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#9A3412', textTransform: 'uppercase' }}>
              Products In Demand
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#EA580C' }}>
              {liveProductsCount} <span style={{ fontSize: '14px', fontWeight: '700' }}>টি প্রোডাক্ট</span>
            </div>
            <div style={{ fontSize: '12px', color: '#C2410C' }}>
              যেসব প্রোডাক্টে এখন কাস্টমার আছেন
            </div>
          </div>
        </div>

        {/* Card 3: 24h Views */}
        <div
          style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.06)',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#3B82F6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
          >
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase' }}>
              24-Hour Views
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1D4ED8' }}>
              {total24hViews.toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: '12px', color: '#2563EB' }}>
              গত ২৪ ঘণ্টার মোট প্রোডাক্ট ভিউ
            </div>
          </div>
        </div>

        {/* Card 4: Total All-Time Views */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '1px solid #E9D5FF',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.06)',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: '#8B5CF6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            }}
          >
            <i className="fa-solid fa-database"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#6B21A8', textTransform: 'uppercase' }}>
              Total All-Time Views
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#7E22CE' }}>
              {totalAllTimeViews.toLocaleString('en-US')}
            </div>
            <div style={{ fontSize: '12px', color: '#9333EA' }}>
              স্টোরের সর্বমোট মোট প্রোডাক্ট ভিউ
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '18px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                fontSize: '13px',
              }}
            ></i>
            <input
              type="text"
              placeholder="Search by title, brand, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              background: '#fff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Mode Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filterMode === 'all' ? '800' : '600',
              border: filterMode === 'all' ? '1px solid #FF6600' : '1px solid #E2E8F0',
              background: filterMode === 'all' ? '#FFF7ED' : '#F8FAFC',
              color: filterMode === 'all' ? '#FF6600' : '#475569',
              cursor: 'pointer',
            }}
          >
            All Products ({products.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('live_only')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filterMode === 'live_only' ? '800' : '600',
              border: filterMode === 'live_only' ? '1px solid #10B981' : '1px solid #E2E8F0',
              background: filterMode === 'live_only' ? '#DCFCE7' : '#F8FAFC',
              color: filterMode === 'live_only' ? '#15803D' : '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#22C55E',
              }}
            ></span>
            🔥 Live Viewers Only ({liveProductsCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('recent_only')}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: filterMode === 'recent_only' ? '800' : '600',
              border: filterMode === 'recent_only' ? '1px solid #3B82F6' : '1px solid #E2E8F0',
              background: filterMode === 'recent_only' ? '#DBEAFE' : '#F8FAFC',
              color: filterMode === 'recent_only' ? '#1D4ED8' : '#475569',
              cursor: 'pointer',
            }}
          >
            Viewed in 24h ({products.filter((p) => Number(p.views_24h) > 0).length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Title & SKU</th>
                <th>Category</th>
                <th>Price & Stock</th>
                <th>Live Viewers Now (এখন দেখছেন)</th>
                <th>24h Views (২৪ ঘণ্টা)</th>
                <th>Total Views (সর্বমোট)</th>
                <th style={{ textAlign: 'center' }}>Live Storefront</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                    <i
                      className="fa-solid fa-spinner fa-spin"
                      style={{ fontSize: '24px', color: '#FF6600', marginBottom: '10px' }}
                    ></i>
                    <p style={{ margin: 0, fontSize: '14px' }}>Loading live view statistics...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                    <i
                      className="fa-solid fa-chart-simple"
                      style={{ fontSize: '32px', color: '#CBD5E1', marginBottom: '12px' }}
                    ></i>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                      কোনো প্রোডাক্ট ম্যাচ করেনি।
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                      ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const liveCount = Number(p.live_viewers) || 0;
                  const recentCount = Number(p.views_24h) || 0;
                  const totalCount = Number(p.views) || 0;

                  return (
                    <tr
                      key={p.id}
                      style={{
                        background: liveCount > 0 ? '#F0FDF4' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td>
                        <img
                          src={p.image || '/logo.png'}
                          alt={p.title}
                          style={{
                            width: '45px',
                            height: '45px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          SKU: <span style={{ fontWeight: '600' }}>{p.sku || 'N/A'}</span> • Brand: {p.brand}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                          {p.category_name || '-'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: '800', color: '#FF6600', fontSize: '13px' }}>
                          ৳{Number(p.price).toLocaleString('en-US')}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: Number(p.stock) <= 0 ? '#EF4444' : '#10B981',
                            fontWeight: '600',
                          }}
                        >
                          {Number(p.stock) > 0 ? `${p.stock} in stock` : 'Out of stock'}
                        </div>
                      </td>
                      <td>
                        {liveCount > 0 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '20px',
                              background: '#DCFCE7',
                              border: '1px solid #86EFAC',
                              color: '#15803D',
                              fontWeight: '800',
                              fontSize: '13px',
                              boxShadow: '0 2px 6px rgba(34, 197, 94, 0.15)',
                            }}
                          >
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#22C55E',
                                boxShadow: '0 0 0 3px rgba(34, 197, 94, 0.4)',
                                display: 'inline-block',
                              }}
                            ></span>
                            {liveCount} জন দেখছেন
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: '#94A3B8',
                              fontWeight: '500',
                            }}
                          >
                            <i className="fa-solid fa-user-clock" style={{ fontSize: '10px' }}></i>
                            ০ জন
                          </span>
                        )}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: '700',
                            fontSize: '12px',
                            color: recentCount > 0 ? '#D97706' : '#64748B',
                            background: recentCount > 0 ? '#FEF3C7' : '#F1F5F9',
                            padding: '4px 10px',
                            borderRadius: '8px',
                          }}
                        >
                          <i className="fa-solid fa-chart-simple" style={{ fontSize: '11px' }}></i>
                          {recentCount} views
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: '700',
                            fontSize: '12px',
                            color: '#4338CA',
                            background: '#EEF2FF',
                            padding: '4px 10px',
                            borderRadius: '8px',
                          }}
                        >
                          <i className="fa-solid fa-eye" style={{ fontSize: '11px' }}></i>
                          {totalCount.toLocaleString('en-US')} total
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <a
                          href={`/product/${p.id}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: '#F8FAFC',
                            border: '1px solid #CBD5E1',
                            color: '#334155',
                            fontSize: '12px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span>Open Live</span>
                          <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }}></i>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
