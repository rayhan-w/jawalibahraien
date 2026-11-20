'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'flat',
    discount_value: '',
    min_order: '0',
    expiry_date: '',
  });

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const json = await res.json();
      if (json.success) setCoupons(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setForm({ code: '', discount_type: 'flat', discount_value: '', min_order: '0', expiry_date: '' });
        loadCoupons();
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      const json = await res.json();
      if (json.success) {
        loadCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Coupons & Promotional Offers
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Create discount vouchers, set minimum order values, and manage expiration dates
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
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
          }}
        >
          <i className="fa-solid fa-plus"></i> Create Coupon
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th>Discount Type</th>
              <th>Value</th>
              <th>Min. Order</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading coupons...</td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No coupons created yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date().setHours(0,0,0,0);
                return (
                  <tr key={c.id}>
                    <td>
                      <code
                        style={{
                          background: '#FFF7ED',
                          color: '#FF6600',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontWeight: '800',
                          fontSize: '14px',
                          border: '1px dashed #FF6600',
                        }}
                      >
                        {c.code}
                      </code>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>
                        {c.discount_type === 'flat' ? 'Flat Amount (৳)' : 'Percentage (%)'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '800', color: '#0F172A', fontSize: '15px' }}>
                      {c.discount_type === 'flat' ? `৳${c.discount_value}` : `${c.discount_value}%`}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#475569' }}>
                        {parseFloat(c.min_order) > 0 ? `৳${c.min_order}` : 'No Minimum'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: isExpired ? '#DC2626' : '#475569', fontWeight: isExpired ? '700' : 'normal' }}>
                        {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never Expires'}
                        {isExpired && ' (Expired)'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(c)}
                        style={{
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          background: c.is_active ? '#D1FAE5' : '#FEE2E2',
                          color: c.is_active ? '#065F46' : '#991B1B',
                        }}
                      >
                        {c.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{
                          background: '#FEE2E2',
                          color: '#EF4444',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                        title="Delete coupon"
                        aria-label="Delete coupon"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: '480px', background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Create Promo Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Coupon Code (Uppercase) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH100, SAVE15, JAWALI50"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="flat">Flat Amount (৳)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Discount Value *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Min. Order (৳)</label>
                  <input
                    type="number"
                    placeholder="0 (No minimum)"
                    value={form.min_order}
                    onChange={(e) => setForm({ ...form, min_order: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Expiration Date</label>
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#FF6600', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  Create Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 18px', borderRadius: '8px', background: '#E2E8F0', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
