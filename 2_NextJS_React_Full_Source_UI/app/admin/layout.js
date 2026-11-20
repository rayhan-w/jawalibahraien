'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [stockOutCount, setStockOutCount] = useState(0);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    if (adminUser) {
      setLoading(false);
      return;
    }

    fetch('/api/admin/me')
      .then((res) => {
        if (!res.ok) {
          router.replace('/admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setAdminUser(data.user);
          // Fetch stats for badges
          fetch('/api/admin/stats')
            .then((r) => r.json())
            .then((s) => {
              if (s.success && s.data) {
                setPendingPaymentsCount(s.data.pendingPayments || 0);
                setStockOutCount(s.data.stockOutCount || 0);
              }
            })
            .catch(() => {});
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoginPage, router, adminUser]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out from the Admin Portal?')) {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#FF6600', marginBottom: '12px' }}></i>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Verifying admin session...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: 'fa-gauge-high' },
    { href: '/admin/orders', label: 'Orders & Invoices', icon: 'fa-cart-flatbed' },
    {
      href: '/admin/payments',
      label: 'Payment Verification',
      icon: 'fa-money-bill-transfer',
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null,
    },
    { href: '/admin/products', label: 'Product Management', icon: 'fa-box-archive' },
    { href: '/admin/live-views', label: 'Live Product Viewers (লাইভ ভিউ)', icon: 'fa-eye' },
    { href: '/admin/banners', label: 'Banners & Sliders', icon: 'fa-images' },
    { href: '/admin/flash-sale', label: 'Flash Sale Deals', icon: 'fa-bolt' },
    {
      href: '/admin/stock-out',
      label: 'Stock Out Products',
      icon: 'fa-boxes-stacked',
      badge: stockOutCount > 0 ? stockOutCount : null,
    },
    { href: '/admin/categories', label: 'Categories', icon: 'fa-layer-group' },
    { href: '/admin/subcategories', label: 'Subcategories', icon: 'fa-sitemap' },
    { href: '/admin/reviews', label: 'Customer Comments (মন্তব্য)', icon: 'fa-comments' },
    { href: '/admin/coupons', label: 'Coupons & Discounts', icon: 'fa-ticket' },
    { href: '/admin/customers', label: 'Customer Database', icon: 'fa-users' },
    { href: '/admin/settings', label: 'Store Settings', icon: 'fa-sliders' },
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Sidebar for PC */}
      <aside
        className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: '270px',
          background: '#0F172A',
          color: '#F8FAFC',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            borderBottom: '1px solid #1E293B',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#FF6600',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <i className="fa-solid fa-crown"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: '700' }}>Jawali Admin</h3>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{adminUser?.username || 'Super Admin'}</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-close-sidebar"
            aria-label="Close sidebar"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'none',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px', overflowY: 'auto' }}>
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  color: isActive ? '#fff' : '#94A3B8',
                  background: isActive ? '#FF6600' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <i className={`fa-solid ${item.icon}`} style={{ width: '18px', textAlign: 'center' }}></i>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      background: '#EF4444',
                      color: '#fff',
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '10px',
                      fontWeight: '700',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #1E293B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link
              href="/"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                color: '#94A3B8',
                textDecoration: 'none',
                fontSize: '13px',
                borderRadius: '8px',
              }}
            >
              <i className="fa-solid fa-store" style={{ width: '18px' }}></i>
              <span>View Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ width: '18px' }}></i>
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-content" style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
        {/* Top Navbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            background: '#fff',
            padding: '14px 24px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="admin-mobile-toggle"
              aria-label="Toggle menu"
              style={{
                background: '#F1F5F9',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'none',
              }}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
              Control Center
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link
              href="/admin/products"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#FF6600',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fa-solid fa-plus"></i> Add Product
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
              <i className="fa-solid fa-circle-user" style={{ fontSize: '24px', color: '#64748B' }}></i>
              <span style={{ fontWeight: '600' }}>{adminUser?.username || 'Admin'}</span>
            </div>
          </div>
        </div>

        {children}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: -280px;
            height: 100vh;
            transition: left 0.3s ease;
          }
          .admin-sidebar.mobile-open {
            left: 0;
          }
          .mobile-close-sidebar {
            display: block !important;
          }
          .admin-mobile-toggle {
            display: inline-block !important;
          }
          .admin-content {
            padding: 15px !important;
          }
        }
      `}</style>
    </div>
  );
}
