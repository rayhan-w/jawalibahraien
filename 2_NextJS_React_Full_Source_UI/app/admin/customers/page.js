'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = () => {
    setLoading(true);
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCustomers(json.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDeleteCustomer = async (phone, name) => {
    if (!confirm(`আপনি কি নিশ্চিত যে কাস্টমার ${name || phone} (${phone})-এর তথ্য ও সংশ্লিষ্ট অর্ডারসমূহ স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers?phone=${encodeURIComponent(phone)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        loadCustomers();
      } else {
        alert(json.message || 'কাস্টমার ডিলিট করা সম্ভব হয়নি।');
      }
    } catch (e) {
      alert('সার্ভার সমস্যা হয়েছে।');
    }
  };

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (c.customer_name && c.customer_name.toLowerCase().includes(q)) ||
      (c.customer_phone && c.customer_phone.includes(q)) ||
      (c.customer_address && c.customer_address.toLowerCase().includes(q))
    );
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + parseFloat(c.lifetime_spend || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Customer Directory & History
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Lifetime purchase history and contact database of all registered customers
          </span>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8', fontSize: '13px' }}></i>
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 34px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              background: '#fff',
            }}
          />
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Total Customers</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{customers.length}</div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
            <i className="fa-solid fa-bangladeshi-taka-sign"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Lifetime Revenue</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>৳{totalSpentAll.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Shipping Address</th>
              <th>Total Orders</th>
              <th>Lifetime Spend (৳)</th>
              <th>Last Order Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ color: '#FF6600', marginRight: '8px' }}></i> Loading customers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              filtered.map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-user" style={{ color: '#94A3B8', fontSize: '18px' }}></i>
                      <span>{c.customer_name || 'Anonymous Customer'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: '#334155' }}>{c.customer_phone}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px', color: '#64748B', maxWidth: '240px' }}>
                      {c.customer_address || 'Not provided'}
                    </div>
                    {c.last_ip && (
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #DBEAFE' }}>
                          <i className="fa-solid fa-network-wired" style={{ fontSize: '10px' }}></i> IP: {c.last_ip}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: '#EEF2FF',
                        color: '#4338CA',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      {c.total_orders} orders
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#FF6600', fontSize: '15px' }}>
                    ৳{Number(c.lifetime_spend).toLocaleString('en-US')}
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748B' }}>
                    {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <a
                        href={`tel:${c.customer_phone}`}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          color: '#334155',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <i className="fa-solid fa-phone" style={{ color: '#FF6600' }}></i> Call
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomer(c.customer_phone, c.customer_name)}
                        title="Delete Customer & Order History"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#FEE2E2',
                          color: '#DC2626',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.2s',
                        }}
                      >
                        <i className="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
