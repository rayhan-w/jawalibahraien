'use client';

import React, { useState, useEffect } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [courierModalOrder, setCourierModalOrder] = useState(null);
  const [courierSending, setCourierSending] = useState(false);
  const [courierCod, setCourierCod] = useState('');
  const [courierNote, setCourierNote] = useState('');
  const [courierMsg, setCourierMsg] = useState(null);
  const [liveTrackModal, setLiveTrackModal] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [editingCourierId, setEditingCourierId] = useState('');
  const [courierSaving, setCourierSaving] = useState(false);
  const [courierSaveMsg, setCourierSaveMsg] = useState(null);

  useEffect(() => {
    if (selectedInvoice) {
      setEditingCourierId(selectedInvoice.consignment_id || selectedInvoice.tracking_code || '');
      setCourierSaveMsg(null);
    }
  }, [selectedInvoice]);

  const handleSaveCourierId = async (orderId) => {
    if (!orderId) return;
    setCourierSaving(true);
    setCourierSaveMsg(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consignment_id: editingCourierId.trim(),
          tracking_code: editingCourierId.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCourierSaveMsg({ type: 'success', text: 'Courier ID সফলভাবে সংরক্ষিত হয়েছে!' });
        setSelectedInvoice((prev) => prev ? {
          ...prev,
          consignment_id: editingCourierId.trim(),
          tracking_code: editingCourierId.trim(),
        } : null);
        loadOrders();
      } else {
        setCourierSaveMsg({ type: 'error', text: json.message || 'Courier ID সংরক্ষণে ব্যর্থ হয়েছে।' });
      }
    } catch (err) {
      setCourierSaveMsg({ type: 'error', text: 'সার্ভার সমস্যা হয়েছে।' });
    } finally {
      setCourierSaving(false);
    }
  };

  const openSendToSteadfast = (ord) => {
    setCourierModalOrder(ord);
    setCourierCod(String(Math.round(ord.total_amount || 0)));
    setCourierNote(`Order #${ord.order_number}`);
    setCourierMsg(null);
  };

  const handleSendToSteadfast = async (e) => {
    e.preventDefault();
    if (!courierModalOrder) return;
    setCourierSending(true);
    setCourierMsg(null);

    try {
      const res = await fetch('/api/admin/courier/steadfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: courierModalOrder.id,
          cod_amount: courierCod,
          note: courierNote,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCourierMsg({ success: true, text: json.message });
        loadOrders();
        setTimeout(() => {
          setCourierModalOrder(null);
        }, 1800);
      } else {
        setCourierMsg({ success: false, text: json.message || 'Failed to send to Steadfast' });
      }
    } catch (err) {
      setCourierMsg({ success: false, text: 'A network error occurred.' });
    } finally {
      setCourierSending(false);
    }
  };

  const handleCheckSteadfastTracking = async (trackingCode, orderId) => {
    setTrackLoading(true);
    setLiveTrackModal({ trackingCode, loading: true });
    try {
      const res = await fetch(`/api/admin/courier/steadfast?tracking_code=${trackingCode}&order_id=${orderId}`);
      const json = await res.json();
      setLiveTrackModal({ trackingCode, data: json });
      loadOrders();
    } catch (e) {
      setLiveTrackModal({ trackingCode, error: 'Could not fetch live tracking data.' });
    } finally {
      setTrackLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const url = filterStatus === 'all' ? '/api/orders' : `/api/orders?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setOrders(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        loadOrders();
      } else {
        alert(json.message || 'স্ট্যাটাস পরিবর্তন করা সম্ভব হয়নি।');
        loadOrders();
      }
    } catch (e) {
      console.error(e);
      alert('সার্ভার এরর: স্ট্যাটাস আপডেট করা যায়নি।');
      loadOrders();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!confirm(`আপনি কি নিশ্চিত যে অর্ডার #${orderNumber} স্থায়ীভাবে মুছে ফেলতে চান? এটি অর্ডারটির সমস্ত আইটেম ও ডাটা মুছে ফেলবে।`)) {
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        if (selectedInvoice && selectedInvoice.id === orderId) {
          setSelectedInvoice(null);
        }
        loadOrders();
      } else {
        alert(json.message || 'অর্ডার ডিলিট করা সম্ভব হয়নি।');
      }
    } catch (e) {
      alert('অর্ডার ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (o.order_number && o.order_number.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_phone && o.customer_phone.includes(q))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Orders & Invoice Management
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Showing {filteredOrders.length} orders
          </span>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '12px', color: '#94A3B8', fontSize: '13px' }}></i>
          <input
            type="text"
            placeholder="Search order #, phone or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '6px' }}>
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: filterStatus === st ? '1px solid #FF6600' : '1px solid #E2E8F0',
              background: filterStatus === st ? '#FF6600' : '#fff',
              color: filterStatus === st ? '#fff' : '#475569',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {st === 'all' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer Details</th>
              <th>Items Ordered</th>
              <th>Payment & Total</th>
              <th>Status</th>
              <th>Courier (Steadfast)</th>
              <th>Invoice & Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <span style={{ fontWeight: '800', color: '#FF6600' }}>{ord.order_number}</span>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {new Date(ord.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>{ord.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>{ord.customer_phone}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', maxWidth: '200px' }}>{ord.customer_address}</div>
                    {ord.ip_address && (
                      <div style={{ marginTop: '5px' }}>
                        <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#1D4ED8', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #DBEAFE' }}>
                          <i className="fa-solid fa-network-wired" style={{ fontSize: '10px' }}></i> IP: {ord.ip_address}
                        </span>
                      </div>
                    )}
                    {ord.notes && (
                      <div style={{ marginTop: '6px' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            background: '#FEF3C7',
                            color: '#92400E',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #FDE68A',
                            maxWidth: '220px',
                            wordBreak: 'break-word',
                            display: 'inline-flex',
                            alignItems: 'flex-start',
                            gap: '5px',
                            lineHeight: '1.4',
                          }}
                        >
                          <i className="fa-solid fa-comment-dots" style={{ marginTop: '2px', flexShrink: 0, color: '#D97706' }}></i>
                          <span><strong>Note:</strong> {ord.notes}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px' }}>
                      {ord.items && ord.items.map((it, idx) => (
                        <div key={idx} style={{ color: '#334155' }}>
                          • {it.quantity}x {it.product_title}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '800', fontSize: '15px' }}>
                      ৳{Number(ord.total_amount).toLocaleString('en-US')}
                    </div>
                    <div style={{ fontSize: '11px', color: ord.payment_method === 'cod' ? '#16A34A' : '#2563EB', fontWeight: '600' }}>
                      {ord.payment_method === 'cod' ? 'Cash on Delivery' : `Transfer (${ord.trx_id || 'N/A'})`}
                    </div>
                  </td>
                  <td>
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12px',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer',
                        background:
                          ord.status === 'delivered' ? '#D1FAE5' : ord.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {ord.tracking_code || ord.consignment_id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '4px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #BFDBFE', width: 'fit-content' }}>
                          <i className="fa-solid fa-truck-fast"></i> {ord.consignment_id || ord.tracking_code}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(ord)}
                            title="Edit Courier ID / View Invoice"
                            style={{
                              padding: '3px 6px',
                              borderRadius: '4px',
                              background: '#F8FAFC',
                              border: '1px solid #CBD5E1',
                              fontSize: '10px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              color: '#475569',
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCheckSteadfastTracking(ord.tracking_code || ord.consignment_id, ord.id)}
                            style={{
                              padding: '3px 6px',
                              borderRadius: '4px',
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              fontSize: '10px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              color: '#334155',
                            }}
                          >
                            <i className="fa-solid fa-rotate"></i> Status
                          </button>
                          <a
                            href={`https://steadfast.com.bd/t/${ord.tracking_code || ord.consignment_id}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '3px 6px',
                              borderRadius: '4px',
                              background: '#FEF3C7',
                              border: '1px solid #FDE68A',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: '#B45309',
                              textDecoration: 'none',
                            }}
                          >
                            Track ↗
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => openSendToSteadfast(ord)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#FF6600',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(255, 102, 0, 0.25)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <i className="fa-solid fa-truck-fast"></i> Send to Courier
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(ord)}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            fontSize: '10px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            color: '#475569',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'center',
                          }}
                        >
                          <i className="fa-solid fa-pen"></i> Add Courier ID
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        onClick={() => setSelectedInvoice(ord)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: '#0F172A',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <i className="fa-solid fa-print"></i> Memo
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(ord.id, ord.order_number)}
                        title="Delete Order"
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

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div
          className="invoice-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            className="invoice-modal-dialog"
            style={{
              width: '90%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              borderRadius: '16px',
              padding: '30px',
            }}
          >
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#FF6600',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="fa-solid fa-print"></i> Print Invoice
                </button>
                <button
                  onClick={() => handleDeleteOrder(selectedInvoice.id, selectedInvoice.order_number)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-trash"></i> Delete Order
                </button>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                aria-label="Close"
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Editable Courier ID Section */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#FF6600',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-solid fa-truck-fast"></i>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                    Courier ID / Tracking Consignment
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {selectedInvoice.consignment_id || selectedInvoice.tracking_code ? (
                      <>Current ID: <b style={{ color: '#FF6600' }}>{selectedInvoice.consignment_id || selectedInvoice.tracking_code}</b></>
                    ) : (
                      'No courier tracking ID assigned yet'
                    )}
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveCourierId(selectedInvoice.id);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
              >
                <input
                  type="text"
                  placeholder="Enter Courier ID / Tracking Code"
                  value={editingCourierId}
                  onChange={(e) => setEditingCourierId(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: '600',
                    minWidth: '220px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  disabled={courierSaving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#FF6600',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: courierSaving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: courierSaving ? 0.7 : 1,
                  }}
                >
                  {courierSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> Save Courier ID
                    </>
                  )}
                </button>
              </form>

              {courierSaveMsg && (
                <div
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    background: courierSaveMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                    color: courierSaveMsg.type === 'success' ? '#15803D' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className={`fa-solid ${courierSaveMsg.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                  {courierSaveMsg.text}
                </div>
              )}
            </div>

            {/* Printable Memo Component */}
            <div id="printableInvoice" style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '15px', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Jawali Telecom</h2>
                <p style={{ margin: '3px 0', fontSize: '13px' }}>বাইপাস রোড, রামগঞ্জ টাওয়ারের সামনে, রামগঞ্জ, লক্ষ্মীপুর | Phone: 01339893391</p>
                <span style={{ fontSize: '12px', fontWeight: '700', border: '1px solid #000', padding: '2px 8px', borderRadius: '4px' }}>OFFICIAL INVOICE / CASH MEMO</span>
              </div>

              {/* Order Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '15px' }}>
                <div>
                  <div>Order #: <b>{selectedInvoice.order_number}</b></div>
                  <div>Date: <b>{new Date(selectedInvoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</b></div>
                  <div>Courier ID: <b style={{ color: selectedInvoice.consignment_id || selectedInvoice.tracking_code ? '#FF6600' : 'inherit' }}>{selectedInvoice.consignment_id || selectedInvoice.tracking_code || 'Not Assigned'}</b></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Customer: <b>{selectedInvoice.customer_name}</b></div>
                  <div>Phone: <b>{selectedInvoice.customer_phone}</b></div>
                  <div>Address: {selectedInvoice.customer_address}</div>
                  {selectedInvoice.notes && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: '#B45309' }}>
                      Note: <b>{selectedInvoice.notes}</b>
                    </div>
                  )}
                  {selectedInvoice.ip_address && (
                    <div style={{ fontSize: '11px', color: '#1D4ED8', marginTop: '3px' }}>
                      <i className="fa-solid fa-network-wired" style={{ marginRight: '4px' }}></i> IP: <b>{selectedInvoice.ip_address}</b>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000', background: '#F8FAFC' }}>
                    <th style={{ textAlign: 'left', padding: '6px' }}>Description</th>
                    <th style={{ textAlign: 'center', padding: '6px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '6px' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', padding: '6px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items && selectedInvoice.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px dashed #E2E8F0' }}>
                      <td style={{ padding: '8px 6px' }}>{it.product_title}</td>
                      <td style={{ textAlign: 'center', padding: '8px 6px' }}>{it.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '8px 6px' }}>৳{Number(it.price).toLocaleString('en-US')}</td>
                      <td style={{ textAlign: 'right', padding: '8px 6px', fontWeight: '600' }}>৳{Number(it.total).toLocaleString('en-US')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div style={{ borderTop: '1px solid #000', paddingTop: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                <div>Subtotal: ৳{Number(selectedInvoice.subtotal).toLocaleString('en-US')}</div>
                <div>Shipping Fee: ৳{Number(selectedInvoice.delivery_charge || 60).toLocaleString('en-US')}</div>
                {selectedInvoice.coupon_discount > 0 && (
                  <div style={{ color: '#059669', fontWeight: '600' }}>
                    Coupon Discount ({selectedInvoice.coupon_code || ''}): -৳{Number(selectedInvoice.coupon_discount).toLocaleString('en-US')}
                  </div>
                )}
                <div style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px', borderTop: '1px dashed #000', paddingTop: '6px' }}>
                  Total Payable: ৳{Number(selectedInvoice.total_amount).toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  Payment Method: <b>{selectedInvoice.payment_method === 'cod' ? 'Cash on Delivery' : `Transfer (TrxID: ${selectedInvoice.trx_id || 'N/A'})`}</b>
                </div>
                {(selectedInvoice.consignment_id || selectedInvoice.tracking_code) && (
                  <div style={{ fontSize: '12px', marginTop: '2px', color: '#1E40AF', fontWeight: '700' }}>
                    Courier / Consignment ID: {selectedInvoice.consignment_id || selectedInvoice.tracking_code}
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '11px', color: '#64748B', borderTop: '1px dashed #CBD5E1', paddingTop: '10px' }}>
                Thank you for choosing Jawali Telecom! Please retain this invoice for any warranty claims.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Steadfast Courier Booking Modal */}
      {courierModalOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FF6600 0%, #EA580C 100%)',
                color: '#FFFFFF',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-truck-fast" style={{ fontSize: '20px' }}></i>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    Send to Steadfast Courier
                  </h3>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>
                    Order #{courierModalOrder.order_number}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCourierModalOrder(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSendToSteadfast} style={{ padding: '24px' }}>
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '14px',
                  marginBottom: '18px',
                  fontSize: '13px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>Recipient: </span>
                  <strong style={{ color: '#0F172A' }}>{courierModalOrder.customer_name}</strong>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#64748B' }}>Phone: </span>
                  <strong style={{ color: '#0F172A' }}>{courierModalOrder.customer_phone}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Address: </span>
                  <strong style={{ color: '#0F172A' }}>{courierModalOrder.customer_address}</strong>
                </div>
                {courierModalOrder.notes && (
                  <div style={{ marginTop: '6px', fontSize: '12px', background: '#FEF3C7', color: '#92400E', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                    <strong>Customer Note:</strong> {courierModalOrder.notes}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  COD Amount (৳)
                </label>
                <input
                  type="number"
                  required
                  value={courierCod}
                  onChange={(e) => setCourierCod(e.target.value)}
                  placeholder="Enter Cash on Delivery amount"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    fontWeight: '700',
                    color: '#0F172A',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                  Total order value is ৳{Number(courierModalOrder.total_amount).toLocaleString('en-US')}. If already paid online, set 0.
                </span>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '6px',
                  }}
                >
                  Delivery Note / Instructions
                </label>
                <textarea
                  rows="2"
                  value={courierNote}
                  onChange={(e) => setCourierNote(e.target.value)}
                  placeholder="e.g. Handle with care, check product before payment..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {courierMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    background: courierMsg.success ? '#DCFCE7' : '#FEE2E2',
                    color: courierMsg.success ? '#15803D' : '#B91C1C',
                    border: `1px solid ${courierMsg.success ? '#86EFAC' : '#FCA5A5'}`,
                  }}
                >
                  {courierMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCourierModalOrder(null)}
                  disabled={courierSending}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={courierSending}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#FF6600',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: courierSending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {courierSending ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Sending Parcel...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Confirm & Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Steadfast Live Tracking Modal */}
      {liveTrackModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: '#FF6600' }}></i>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                  Steadfast Live Parcel Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLiveTrackModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {liveTrackModal.loading ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#FF6600', marginBottom: '12px' }}></i>
                  <div>Checking live status from Steadfast servers...</div>
                </div>
              ) : liveTrackModal.error ? (
                <div style={{ padding: '16px', borderRadius: '10px', background: '#FEE2E2', color: '#B91C1C', fontSize: '13px' }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
                  {liveTrackModal.error}
                </div>
              ) : (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Tracking Code</span>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#FF6600', letterSpacing: '1px' }}>
                      {liveTrackModal.trackingCode}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                      <span style={{ color: '#64748B' }}>Courier Status:</span>
                      <strong style={{ color: '#0F172A', textTransform: 'capitalize' }}>
                        {liveTrackModal.data?.delivery_status || 'Pending / In Review'}
                      </strong>
                    </div>
                    {liveTrackModal.data?.raw?.updated_at && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: '#64748B' }}>Last Updated:</span>
                        <span style={{ color: '#334155' }}>{new Date(liveTrackModal.data.raw.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                      href={`https://steadfast.com.bd/t/${liveTrackModal.trackingCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#FF6600',
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Open Steadfast Portal
                    </a>
                    <button
                      type="button"
                      onClick={() => setLiveTrackModal(null)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        color: '#475569',
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printableInvoice, #printableInvoice * {
            visibility: visible;
          }
          #printableInvoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
