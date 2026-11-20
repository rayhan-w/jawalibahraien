'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = () => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setStats(json.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748B' }}>
        <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '36px', color: '#FF6600', marginBottom: '12px' }}></i>
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Revenue',
      value: `৳${(stats?.totalRevenue || 0).toLocaleString('en-US')}`,
      icon: 'fa-bangladeshi-taka-sign',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      title: "Today's Sales",
      value: `৳${(stats?.todaySales || 0).toLocaleString('en-US')}`,
      icon: 'fa-chart-line',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      title: 'Total Orders',
      value: (stats?.totalOrders || 0).toLocaleString('en-US'),
      icon: 'fa-cart-shopping',
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      title: 'Pending Dispatch',
      value: (stats?.pendingDispatch || 0).toLocaleString('en-US'),
      icon: 'fa-dolly',
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <div>
      {/* Pending Payment Alert Banner if any bKash/Nagad pending verification */}
      {stats?.pendingPayments > 0 && (
        <div
          style={{
            background: 'linear-gradient(90deg, #FEF2F2 0%, #FFF1F2 100%)',
            border: '1px solid #FECDD3',
            borderRadius: '14px',
            padding: '16px 20px',
            marginBottom: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#EF4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-bell"></i>
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#991B1B' }}>
                Payment Verification Required!
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#7F1D1D' }}>
                There are <b>{stats.pendingPayments}</b> customer bKash/Nagad Transaction IDs awaiting audit.
              </p>
            </div>
          </div>

          <Link
            href="/admin/payments"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#DC2626',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '700',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            }}
          >
            Review Payments <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: kpi.bg, color: kpi.color }}>
              <i className={`fa-solid ${kpi.icon}`}></i>
            </div>
            <div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{kpi.title}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#0F172A', marginTop: '4px' }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Shortcuts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '35px',
        }}
      >
        <Link
          href="/admin/orders"
          style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#1E293B',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <i className="fa-solid fa-cart-shopping" style={{ color: '#FF6600', fontSize: '18px' }}></i>
          <span>Orders & Invoices</span>
        </Link>

        <Link
          href="/admin/payments"
          style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#1E293B',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <i className="fa-solid fa-receipt" style={{ color: '#10B981', fontSize: '18px' }}></i>
          <span>Payment Audit</span>
        </Link>

        <Link
          href="/admin/products"
          style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#1E293B',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <i className="fa-solid fa-box" style={{ color: '#3B82F6', fontSize: '18px' }}></i>
          <span>Products Catalog</span>
        </Link>

        <Link
          href="/admin/coupons"
          style={{
            background: '#FFFFFF',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#1E293B',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <i className="fa-solid fa-ticket" style={{ color: '#8B5CF6', fontSize: '18px' }}></i>
          <span>Coupon Codes</span>
        </Link>

        <Link
          href="/admin/live-views"
          style={{
            background: '#F0FDF4',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #86EFAC',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#15803D',
            fontWeight: '800',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
          }}
        >
          <i className="fa-solid fa-eye" style={{ color: '#16A34A', fontSize: '18px' }}></i>
          <span>Live Viewers ({stats?.productViewsStats?.liveViewers || 0} জন লাইভ)</span>
        </Link>
      </div>

      {/* Live Product Views & Visitor Activity Section */}
      <div
        id="live-views"
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          marginBottom: '35px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(255, 102, 0, 0.1)',
                  color: '#FF6600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                Live Product Views & Activity (লাইভ প্রোডাক্ট ভিউ)
              </h3>
            </div>
            <span style={{ fontSize: '13px', color: '#64748B', display: 'block', marginTop: '4px' }}>
              রিয়েল-টাইমে কোন প্রোডাক্ট কতজন কাস্টমার দেখছেন এবং সামগ্রিক ভিউ পরিসংখ্যান
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '20px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10B981',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)',
                  display: 'inline-block',
                }}
              ></span>
              Live Tracking (স্বয়ংক্রিয় আপডেট)
            </span>

            <button
              onClick={loadStats}
              title="Refresh Stats"
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '7px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                color: '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-rotate"></i> Refresh
            </button>

            <Link
              href="/admin/products"
              style={{
                fontSize: '13px',
                color: '#FF6600',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              All Products Catalog <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>

        {/* 3 Mini KPI Cards for Views */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '22px',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '1px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#10B981',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#065F46' }}>
                Active Viewers Now
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#047857' }}>
                {stats?.productViewsStats?.liveViewers || 0} জন
              </div>
              <div style={{ fontSize: '11px', color: '#059669' }}>বিগত ১৫ মিনিটে লাইভ কাস্টমার</div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#3B82F6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className="fa-solid fa-eye"></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1E40AF' }}>
                Today's Product Views
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1D4ED8' }}>
                {(stats?.productViewsStats?.todayViews || 0).toLocaleString('en-US')}
              </div>
              <div style={{ fontSize: '11px', color: '#2563EB' }}>আজকের মোট দেখা হয়েছে</div>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
              border: '1px solid #E9D5FF',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#8B5CF6',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className="fa-solid fa-fire"></i>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#6B21A8' }}>
                Total All-Time Views
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#7E22CE' }}>
                {(stats?.productViewsStats?.totalViews || 0).toLocaleString('en-US')}
              </div>
              <div style={{ fontSize: '11px', color: '#9333EA' }}>স্টোরের সর্বমোট ভিউ কাউন্ট</div>
            </div>
          </div>
        </div>

        {/* Top & Live Viewed Products Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price & Stock</th>
                <th>Live Viewers Now (এখন দেখছেন)</th>
                <th>24h Views (২৪ ঘণ্টা)</th>
                <th>Total Views (সর্বমোট)</th>
                <th>Live Storefront</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.productViewsStats?.topViewedProducts || stats.productViewsStats.topViewedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    এখনও কোনো প্রোডাক্ট ভিউ ট্র্যাকিং ডেটা রেকর্ড হয়নি।
                  </td>
                </tr>
              ) : (
                stats.productViewsStats.topViewedProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.image || '/logo.png'}
                          alt={p.title}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                        {p.category_name || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#FF6600', fontSize: '13px' }}>
                        ৳{Number(p.price).toLocaleString('en-US')}
                      </div>
                      <div style={{ fontSize: '11px', color: p.stock <= 0 ? '#EF4444' : '#10B981' }}>
                        {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                      </div>
                    </td>
                    <td>
                      {p.live_viewers > 0 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 9px',
                            borderRadius: '20px',
                            background: '#DCFCE7',
                            border: '1px solid #86EFAC',
                            color: '#15803D',
                            fontWeight: '700',
                            fontSize: '12px',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#22C55E',
                              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)',
                            }}
                          ></span>
                          {p.live_viewers} জন দেখছেন
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>
                          0 জন
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
                          color: p.views_24h > 0 ? '#D97706' : '#64748B',
                          background: p.views_24h > 0 ? '#FEF3C7' : '#F1F5F9',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        <i className="fa-solid fa-chart-simple" style={{ fontSize: '10px' }}></i>
                        {p.views_24h} views
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
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        <i className="fa-solid fa-eye" style={{ fontSize: '10px' }}></i>
                        {p.total_views} total
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/product/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: '#F8FAFC',
                          border: '1px solid #CBD5E1',
                          color: '#334155',
                          fontSize: '12px',
                          fontWeight: '600',
                          textDecoration: 'none',
                        }}
                      >
                        <span>View Live</span>
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }}></i>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
              Recent Orders
            </h3>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Latest orders placed on your store</span>
          </div>

          <Link
            href="/admin/orders"
            style={{ fontSize: '13px', color: '#FF6600', fontWeight: '700', textDecoration: 'none' }}
          >
            View All Orders <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ fontWeight: '700', color: '#FF6600' }}>{ord.order_number}</td>
                    <td style={{ fontWeight: '600' }}>{ord.customer_name}</td>
                    <td>{ord.customer_phone}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          color: ord.payment_method === 'cod' ? '#64748B' : '#059669',
                        }}
                      >
                        {ord.payment_method}
                      </span>
                      {ord.payment_status === 'approved' && (
                        <i className="fa-solid fa-circle-check" style={{ color: '#10B981', marginLeft: '5px' }}></i>
                      )}
                    </td>
                    <td style={{ fontWeight: '800' }}>৳{Number(ord.total_amount).toLocaleString('en-US')}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background:
                            ord.status === 'delivered'
                              ? '#D1FAE5'
                              : ord.status === 'confirmed'
                              ? '#DBEAFE'
                              : ord.status === 'cancelled'
                              ? '#FEE2E2'
                              : '#FEF3C7',
                          color:
                            ord.status === 'delivered'
                              ? '#065F46'
                              : ord.status === 'confirmed'
                              ? '#1E40AF'
                              : ord.status === 'cancelled'
                              ? '#991B1B'
                              : '#92400E',
                        }}
                      >
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
