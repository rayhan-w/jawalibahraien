'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerateStatus = async (reviewId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_id: reviewId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`মন্তব্য #${reviewId} সফলভাবে ${newStatus === 'approved' ? 'অনুমোদন (Approved)' : newStatus === 'rejected' ? 'প্রত্যাখ্যান (Rejected)' : newStatus} করা হয়েছে।`);
        setTimeout(() => setMessage(''), 4000);
        loadReviews();
      } else {
        alert(json.message || 'Action failed');
      }
    } catch (e) {
      alert('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm(`Are you sure you want to permanently delete Comment #${reviewId}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`মন্তব্য #${reviewId} মুছে ফেলা হয়েছে।`);
        setTimeout(() => setMessage(''), 4000);
        loadReviews();
      } else {
        alert(json.message || 'Failed to delete');
      }
    } catch (e) {
      alert('Network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Customer Comments & Feedback (গ্রাহক মন্তব্য)
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Review, approve, or reject customer feedback and questions submitted on product pages
          </span>
        </div>

        {/* Filter Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: filterStatus === 'all' ? '2px solid #FF6600' : '1px solid #E2E8F0',
              background: filterStatus === 'all' ? '#FFF7ED' : '#FFFFFF',
              color: filterStatus === 'all' ? '#FF6600' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: filterStatus === 'pending' ? '2px solid #D97706' : '1px solid #E2E8F0',
              background: filterStatus === 'pending' ? '#FEF3C7' : '#FFFFFF',
              color: filterStatus === 'pending' ? '#B45309' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: filterStatus === 'approved' ? '2px solid #059669' : '1px solid #E2E8F0',
              background: filterStatus === 'approved' ? '#ECFDF5' : '#FFFFFF',
              color: filterStatus === 'approved' ? '#047857' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: filterStatus === 'rejected' ? '2px solid #DC2626' : '1px solid #E2E8F0',
              background: filterStatus === 'rejected' ? '#FEF2F2' : '#FFFFFF',
              color: filterStatus === 'rejected' ? '#B91C1C' : '#475569',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Rejected ({rejectedCount})
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 18px',
            background: '#ECFDF5',
            color: '#065F46',
            borderRadius: '10px',
            border: '1px solid #A7F3D0',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fa-solid fa-circle-check"></i>
          <span>{message}</span>
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Product</th>
                <th style={{ width: '180px' }}>Customer Info</th>
                <th>Comment / Feedback</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ color: '#FF6600', marginRight: '8px' }}></i>
                    Loading comments...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No customer comments found in this view.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '13px' }}>
                        {r.product_title || `Product #${r.product_id}`}
                      </div>
                      <Link
                        href={`/product/${r.product_id}`}
                        target="_blank"
                        style={{ fontSize: '11px', color: '#FF6600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                      >
                        View Product <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '9px' }}></i>
                      </Link>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0F172A' }}>{r.customer_name}</div>
                      {r.customer_phone ? (
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{r.customer_phone}</div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>No phone</span>
                      )}
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                        {new Date(r.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>

                    <td style={{ maxWidth: '340px' }}>
                      <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#334155', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                        {r.review_text}
                      </p>
                    </td>

                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px',
                          background:
                            r.status === 'approved' ? '#ECFDF5' : r.status === 'rejected' ? '#FEF2F2' : '#FEF3C7',
                          color:
                            r.status === 'approved' ? '#047857' : r.status === 'rejected' ? '#B91C1C' : '#B45309',
                          border: `1px solid ${
                            r.status === 'approved' ? '#A7F3D0' : r.status === 'rejected' ? '#FECACA' : '#FDE68A'
                          }`,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {r.status !== 'approved' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleModerateStatus(r.id, 'approved')}
                            title="Approve Comment"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #10B981',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Approve
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleModerateStatus(r.id, 'rejected')}
                            title="Reject Comment"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#FEF3C7',
                              color: '#D97706',
                              border: '1px solid #F59E0B',
                              fontSize: '11px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleDeleteReview(r.id)}
                          title="Delete Comment"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #EF4444',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          <i className="fa-solid fa-trash"></i>
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
    </div>
  );
}
