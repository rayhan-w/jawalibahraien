'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('methods'); // 'methods' or 'audit'
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Add/Edit Payment Method Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [methodForm, setMethodForm] = useState({
    name: '',
    name_ar: '',
    code: '',
    type: 'mobile_wallet', // 'mobile_wallet', 'cod', 'gateway', 'bank_transfer'
    account_number: '',
    iban: '',
    instructions: '',
    instructions_ar: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const json = await res.json();
      if (json.success) {
        setPaymentMethods(json.data || []);
        setPayments(json.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (methodId, currentStatus) => {
    setActionLoading(methodId);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_status',
          id: methodId,
          is_active: !currentStatus,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentMethods(json.data);
      }
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveMethod = async (e) => {
    e.preventDefault();
    if (!methodForm.name.trim()) {
      alert('Payment method name is required');
      return;
    }

    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_method',
          method: {
            ...methodForm,
            id: editingMethod ? editingMethod.id : `pm_${Date.now()}`,
            code: methodForm.code || methodForm.name.toLowerCase().replace(/\s+/g, '_'),
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentMethods(json.data);
        setIsModalOpen(false);
        setEditingMethod(null);
        setMethodForm({
          name: '',
          name_ar: '',
          code: '',
          type: 'mobile_wallet',
          account_number: '',
          iban: '',
          instructions: '',
          instructions_ar: '',
          is_active: true,
        });
      } else {
        alert(json.message || 'Failed to save payment method');
      }
    } catch (e) {
      alert('Server error occurred');
    }
  };

  const handleOpenEdit = (method) => {
    setEditingMethod(method);
    setMethodForm({
      name: method.name || '',
      name_ar: method.name_ar || '',
      code: method.code || '',
      type: method.type || 'mobile_wallet',
      account_number: method.account_number || '',
      iban: method.iban || '',
      instructions: method.instructions || '',
      instructions_ar: method.instructions_ar || '',
      is_active: method.is_active !== undefined ? method.is_active : true,
    });
    setIsModalOpen(true);
  };

  const handleDeleteMethod = async (methodId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_method', id: methodId }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentMethods(json.data);
      }
    } catch (e) {
      alert('Failed to delete payment method');
    }
  };

  const handleUpdatePayment = async (orderId, paymentStatus) => {
    setActionLoading(orderId);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === orderId ? { ...p, payment_status: paymentStatus } : p))
        );
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (e) {
      alert('Server error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyTrx = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.payment_status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Payment Systems & Gateway Management
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Add, configure and manage BenefitPay, Credit Cards, Cash on Delivery, Wallets & audit incoming transactions
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setEditingMethod(null);
              setMethodForm({
                name: '',
                name_ar: '',
                code: '',
                type: 'mobile_wallet',
                account_number: '',
                iban: '',
                instructions: '',
                instructions_ar: '',
                is_active: true,
              });
              setIsModalOpen(true);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#FF6600',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(255, 102, 0, 0.3)',
            }}
          >
            <i className="fa-solid fa-plus"></i>
            <span>Add Payment Method</span>
          </button>
        </div>
      </div>

      {/* Main Tabs: Payment Gateways vs Transaction Audits */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('methods')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'methods' ? '#FF6600' : 'transparent',
            color: activeTab === 'methods' ? '#FFFFFF' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-credit-card"></i>
          <span>Active Payment Gateways ({paymentMethods.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '8px 18px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            background: activeTab === 'audit' ? '#FF6600' : 'transparent',
            color: activeTab === 'audit' ? '#FFFFFF' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-receipt"></i>
          <span>Transaction Audit & Verification ({payments.length})</span>
        </button>
      </div>

      {/* TAB 1: Payment Gateways List & Configuration */}
      {activeTab === 'methods' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {paymentMethods.map((m) => (
            <div
              key={m.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: m.is_active ? '1.5px solid #FF6600' : '1px solid #E2E8F0',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: 'rgba(255, 102, 0, 0.1)',
                        color: '#FF6600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}
                    >
                      <i className={`fa-solid ${m.icon || 'fa-credit-card'}`}></i>
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                        {m.name}
                      </h4>
                      <span style={{ fontSize: '13px', color: '#FF6600', fontWeight: '700' }}>
                        {m.name_ar}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: m.is_active ? '#ECFDF5' : '#F1F5F9',
                      color: m.is_active ? '#059669' : '#64748B',
                      textTransform: 'uppercase',
                    }}
                  >
                    {m.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '12px', fontSize: '13px', marginBottom: '14px' }}>
                  {m.account_number && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Account / Number:</strong> <span style={{ color: '#0F172A' }}>{m.account_number}</span>
                    </div>
                  )}
                  {m.iban && (
                    <div style={{ marginBottom: '4px' }}>
                      <strong>IBAN:</strong> <span style={{ color: '#0F172A', fontFamily: 'monospace' }}>{m.iban}</span>
                    </div>
                  )}
                  <div style={{ color: '#64748B', fontSize: '12px', lineHeight: '1.4' }}>
                    <strong>EN:</strong> {m.instructions || 'No instructions provided.'}
                  </div>
                  {m.instructions_ar && (
                    <div style={{ color: '#64748B', fontSize: '12px', lineHeight: '1.4', marginTop: '4px' }}>
                      <strong>AR:</strong> {m.instructions_ar}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(m.id, m.is_active)}
                  disabled={actionLoading === m.id}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: m.is_active ? '#DC2626' : '#059669',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {m.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(m)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-pen-to-square" style={{ marginRight: '4px' }}></i> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMethod(m.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #FCA5A5',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Audit & Verification Table */}
      {activeTab === 'audit' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F1F5F9', color: '#64748B' }}>
                <th style={{ padding: '12px' }}>Order #</th>
                <th style={{ padding: '12px' }}>Customer</th>
                <th style={{ padding: '12px' }}>Method</th>
                <th style={{ padding: '12px' }}>Total Amount</th>
                <th style={{ padding: '12px' }}>Transaction ID (TrxID)</th>
                <th style={{ padding: '12px' }}>Payment Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#FF6600' }}>{p.order_number}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600' }}>{p.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{p.customer_phone}</div>
                  </td>
                  <td style={{ padding: '12px', textTransform: 'capitalize', fontWeight: '600' }}>{p.payment_method}</td>
                  <td style={{ padding: '12px', fontWeight: '700' }}>{p.total_price} {p.currency}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      onClick={() => handleCopyTrx(p.trx_id)}
                      title="Click to copy"
                      style={{
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: '#F1F5F9',
                        fontFamily: 'monospace',
                        fontWeight: '700',
                      }}
                    >
                      {p.trx_id || 'N/A'} {copiedId === p.trx_id && '✓ Copied'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        background: p.payment_status === 'verified' ? '#ECFDF5' : '#FFFBEB',
                        color: p.payment_status === 'verified' ? '#059669' : '#D97706',
                      }}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {p.payment_status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdatePayment(p.id, 'verified')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdatePayment(p.id, 'rejected')}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECDD3',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add or Edit Payment Gateway / System */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '550px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment System'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMethod} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Method Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BenefitPay, STC Pay, Apple Pay"
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Method Name (Arabic - العربية)
                </label>
                <input
                  type="text"
                  placeholder="مثال: بنفت بي، الدفع عند الاستلام"
                  value={methodForm.name_ar}
                  onChange={(e) => setMethodForm({ ...methodForm, name_ar: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    System Type
                  </label>
                  <select
                    value={methodForm.type}
                    onChange={(e) => setMethodForm({ ...methodForm, type: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="mobile_wallet">Mobile Wallet (BenefitPay, STC Pay)</option>
                    <option value="gateway">Credit / Debit Card (Online 3D Secure)</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="bank_transfer">Direct Bank Wire / IBAN</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    Account / Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +973 33989339"
                    value={methodForm.account_number}
                    onChange={(e) => setMethodForm({ ...methodForm, account_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  IBAN / Bank Identifier (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BH00BMAG00000000000000"
                  value={methodForm.iban}
                  onChange={(e) => setMethodForm({ ...methodForm, iban: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Customer Instructions (English)
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain how the customer should send payment..."
                  value={methodForm.instructions}
                  onChange={(e) => setMethodForm({ ...methodForm, instructions: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  Customer Instructions (Arabic - العربية)
                </label>
                <textarea
                  rows={2}
                  placeholder="تعليمات الدفع تظهر للعميل باللغة العربية..."
                  value={methodForm.instructions_ar}
                  onChange={(e) => setMethodForm({ ...methodForm, instructions_ar: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="methodActive"
                  checked={methodForm.is_active}
                  onChange={(e) => setMethodForm({ ...methodForm, is_active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#FF6600' }}
                />
                <label htmlFor="methodActive" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                  Enable this payment method immediately on Storefront Checkout
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#FF6600',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {editingMethod ? 'Save Changes' : 'Create Payment Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
