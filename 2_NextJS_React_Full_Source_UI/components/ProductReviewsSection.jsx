'use client';

import React, { useState, useEffect } from 'react';

export default function ProductReviewsSection({ productId, initialRating = 4.8, initialReviewsCount = 0 }) {
  const [reviewsData, setReviewsData] = useState({
    averageRating: initialRating,
    totalReviews: initialReviewsCount,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentage: { 5: 75, 4: 20, 3: 5, 2: 0, 1: 0 },
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    rating: 5,
    order_number: '',
    customer_phone: '',
    review_text: '',
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const json = await res.json();
      if (json.success) {
        setReviewsData({
          averageRating: json.averageRating || initialRating,
          totalReviews: json.totalReviews !== undefined ? json.totalReviews : initialReviewsCount,
          distribution: json.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          percentage: json.percentage || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          reviews: json.reviews || [],
        });
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          order_number: form.order_number,
          customer_phone: form.customer_phone,
          rating: form.rating,
          review_text: form.review_text,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: 'success',
          message: json.message || 'Thank you! Your verified review has been submitted.',
        });
        setForm({
          rating: 5,
          order_number: '',
          customer_phone: '',
          review_text: '',
        });
        fetchReviews();
        setTimeout(() => {
          setIsFormOpen(false);
          setFeedback({ type: '', message: '' });
        }, 3000);
      } else {
        setFeedback({
          type: 'error',
          message: json.message || 'Failed to submit review. Please verify your order details.',
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'An error occurred while submitting your review. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Top Summary Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '25px',
          background: 'var(--bg-color)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          marginBottom: '30px',
        }}
      >
        {/* Left: Big Average Star Box */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', fontWeight: '900', color: '#FF6600', lineHeight: 1 }}>
            {reviewsData.averageRating}
          </div>
          <div style={{ display: 'flex', gap: '4px', color: '#F59E0B', fontSize: '18px', margin: '8px 0 4px 0' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <i
                key={star}
                className={`fa-star ${star <= Math.round(reviewsData.averageRating) ? 'fa-solid' : 'fa-regular'}`}
              ></i>
            ))}
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Based on {reviewsData.totalReviews} verified {reviewsData.totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Center: Rating Breakdown Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = reviewsData.percentage[star] || 0;
            const count = reviewsData.distribution[star] || 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span style={{ width: '45px', color: 'var(--text-color)', fontWeight: '600' }}>
                  {star} Star
                </span>
                <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: star >= 4 ? '#FF6600' : star === 3 ? '#F59E0B' : '#EF4444',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  ></div>
                </div>
                <span style={{ width: '32px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Write Review Trigger */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-color)' }}>
            Bought this product?
          </h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '240px' }}>
            Share your authentic purchase experience with other shoppers.
          </p>
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: 'none',
              background: '#FF6600',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(255,102,0,0.25)',
            }}
          >
            <i className={`fa-solid ${isFormOpen ? 'fa-xmark' : 'fa-pen-to-square'}`}></i>
            {isFormOpen ? 'Close Form' : 'Write a Review'}
          </button>
        </div>
      </div>

      {/* Review Submission Form Modal / Box */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'var(--card-bg)',
            border: '2px solid #FF6600',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(255,102,0,0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text-color)' }}>
              <i className="fa-solid fa-certificate" style={{ color: '#FF6600', marginRight: '8px' }}></i>
              Verified Customer Review
            </h4>
            <span style={{ fontSize: '12px', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
              Order Verification Required
            </span>
          </div>

          {feedback.message && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '16px',
                background: feedback.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                color: feedback.type === 'success' ? '#065F46' : '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className={`fa-solid ${feedback.type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Star Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '6px' }}>
              Your Overall Rating *
            </label>
            <div style={{ display: 'flex', gap: '8px', fontSize: '24px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <i
                  key={star}
                  className={`fa-star ${star <= (hoverRating || form.rating) ? 'fa-solid' : 'fa-regular'}`}
                  style={{ color: '#F59E0B' }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setForm({ ...form, rating: star })}
                ></i>
              ))}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px', alignSelf: 'center', fontWeight: '600' }}>
                {form.rating === 5 ? '5 Stars - Excellent' : form.rating === 4 ? '4 Stars - Good' : form.rating === 3 ? '3 Stars - Average' : form.rating === 2 ? '2 Stars - Poor' : '1 Star - Terrible'}
              </span>
            </div>
          </div>

          {/* Order Number & Phone for Purchase Verification */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-color)', marginBottom: '6px' }}>
                Order Number (Invoice ID) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. JWL-2610-1234"
                value={form.order_number}
                onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  fontSize: '13px',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                Found on your order confirmation SMS or receipt
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-color)', marginBottom: '6px' }}>
                Order Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 017XXXXXXXX"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-color)',
                  fontSize: '13px',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                Mobile number used during checkout
              </span>
            </div>
          </div>

          {/* Text Review */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-color)', marginBottom: '6px' }}>
              Your Review & Feedback *
            </label>
            <textarea
              rows="4"
              required
              placeholder="What did you like or dislike about this product? How was the build quality and performance?"
              value={form.review_text}
              onChange={(e) => setForm({ ...form, review_text: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: '13px',
                lineHeight: '1.5',
              }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-color)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#FF6600',
                color: '#fff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Verifying & Submitting...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-color)', margin: '0 0 4px 0' }}>
          Customer Feedback ({reviewsData.reviews.length})
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ color: '#FF6600', fontSize: '20px', marginBottom: '8px' }}></i>
            <p style={{ margin: 0, fontSize: '13px' }}>Loading reviews...</p>
          </div>
        ) : reviewsData.reviews.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'var(--bg-color)',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            <i className="fa-regular fa-comment-dots" style={{ fontSize: '28px', color: '#94A3B8', marginBottom: '8px' }}></i>
            <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-color)' }}>
              No customer reviews yet
            </h5>
            <p style={{ margin: 0, fontSize: '13px' }}>
              Be the first verified buyer to leave a review for this product!
            </p>
          </div>
        ) : (
          reviewsData.reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: 'var(--bg-color)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255,102,0,0.1)',
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
                    <strong style={{ fontSize: '14px', color: 'var(--text-color)' }}>
                      {rev.customer_name || 'Verified Customer'}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <i className="fa-solid fa-circle-check"></i> Verified Purchase
                      </span>
                      {rev.is_demo === 1 && (
                        <span style={{ fontSize: '10px', color: '#64748B', background: '#E2E8F0', padding: '1px 6px', borderRadius: '8px' }}>
                          [Demo/Test]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#F59E0B', fontSize: '13px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i key={s} className={`fa-star ${s <= rev.rating ? 'fa-solid' : 'fa-regular'}`}></i>
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <p style={{ margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-color)' }}>
                {rev.review_text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
