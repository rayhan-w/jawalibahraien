'use client';

import React, { useState, useEffect } from 'react';

export default function ProductCommentsSection({ productId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    comment: '',
  });

  const fetchComments = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.reviews)) {
        setComments(data.reviews);
      }
    } catch (e) {
      console.error('Error fetching comments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!form.name.trim() || !form.comment.trim()) {
      setFeedback({ type: 'error', message: 'অনুগ্রহ করে আপনার নাম এবং মন্তব্য লিখুন।' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          review_text: form.comment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: 'ধন্যবাদ! আপনার মন্তব্যটি সফলভাবে জমা হয়েছে। অ্যাডমিন পর্যালোচনার পর এটি প্রদর্শিত হবে।',
        });
        setForm({ name: '', phone: '', comment: '' });
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। আবার চেষ্টা করুন।',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="product-comments-section"
      style={{
        marginTop: '35px',
        background: 'var(--card-bg)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '24px',
        }}
      >
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
              fontSize: '16px',
            }}
          >
            <i className="fa-solid fa-comments"></i>
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
              Customer Comments & Feedback ({comments.length})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              পণ্য সম্পর্কে আপনার প্রশ্ন বা মতামত জানান
            </span>
          </div>
        </div>
      </div>

      {/* Submission Feedback Banner */}
      {feedback.message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: feedback.type === 'success' ? '#065F46' : '#991B1B',
            border: `1px solid ${feedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          }}
        >
          <i className={`fa-solid ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-color)' }}>
              Your Name / আপনার নাম <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahim Ahmed"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--search-bg)',
                color: 'var(--text-color)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-color)' }}>
              Phone Number / মোবাইল নম্বর <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '400' }}>(ঐচ্ছিক)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 01700000000"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--search-bg)',
                color: 'var(--text-color)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-color)' }}>
            Your Comment / আপনার মন্তব্য <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <textarea
            name="comment"
            required
            rows="3"
            value={form.comment}
            onChange={handleChange}
            placeholder="পণ্য সম্পর্কে বিস্তারিত মতামত লিখুন..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--search-bg)',
              color: 'var(--text-color)',
              fontSize: '13px',
              outline: 'none',
              resize: 'vertical',
            }}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            background: '#FF6600',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>জমা হচ্ছে...</span>
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane"></i>
              <span>মন্তব্য পোস্ট করুন</span>
            </>
          )}
        </button>
      </form>

      {/* Approved Comments List */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-color)' }}>
          অনুমোদিত মন্তব্যসমূহ
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: '#FF6600', marginRight: '6px' }}></i>
            মন্তব্য লোড হচ্ছে...
          </div>
        ) : comments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '30px 20px',
              background: 'var(--search-bg)',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <i className="fa-regular fa-comment-dots" style={{ fontSize: '24px', color: '#94A3B8', marginBottom: '8px', display: 'block' }}></i>
            <span style={{ fontSize: '13px' }}>
              এখনও কোনো মন্তব্য জমা পড়েনি। আপনি প্রথম মন্তব্যকারী হতে পারেন!
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {comments.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: 'var(--search-bg)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255,102,0,0.12)',
                        color: '#FF6600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '13px',
                      }}
                    >
                      {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: 'var(--text-color)' }}>
                        {rev.customer_name || 'Customer'}
                      </strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(rev.created_at).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-color)', whiteSpace: 'pre-wrap' }}>
                  {rev.review_text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
