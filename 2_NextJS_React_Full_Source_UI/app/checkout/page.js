'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { trackClientAndServer } from '@/lib/trackClient';
import { BAHRAIN_GOVERNORATES, BAHRAIN_CITIES, BANGLADESH_DISTRICTS } from '@/lib/districts';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, showToast, lang, t } = useCart();

  const [settings, setSettings] = useState({
    delivery_inside: '1.500',
    delivery_outside: '2.500',
    currency: 'BHD',
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Bahrain'); // 'Bahrain' or 'Bangladesh'

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    district: 'Capital Governorate (Manama)',
    city: 'Manama',
    deliveryZone: 'inside', // 'inside' or 'outside'
    paymentMethod: 'benefitpay',
    trxId: '',
    notes: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Review states post-checkout
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // 1. Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSettings((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => {});

    // 2. Fetch active dynamic payment systems
    fetch('/api/payment-methods')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPaymentMethods(json.data);
          // Set default selected method to first active
          setFormData((prev) => ({
            ...prev,
            paymentMethod: json.data[0].code || 'benefitpay',
          }));
        }
      })
      .catch(() => {});

    // 3. Trigger Facebook CAPI & Pixel InitiateCheckout
    if (cart && cart.length > 0) {
      trackClientAndServer('InitiateCheckout', {
        num_items: cart.length,
        value: subtotal,
        currency: selectedCountry === 'Bahrain' ? 'BHD' : 'BDT',
        content_ids: cart.map((i) => String(i.id || '')),
      });
    }
  }, []);

  const insideFee = selectedCountry === 'Bahrain' ? parseFloat(settings.delivery_inside || '1.500') : 60;
  const outsideFee = selectedCountry === 'Bahrain' ? parseFloat(settings.delivery_outside || '2.500') : 120;
  const deliveryCharge = formData.deliveryZone === 'inside' ? insideFee : outsideFee;

  const currentCurrency = selectedCountry === 'Bahrain' ? (lang === 'ar' ? 'د.ب' : 'BHD') : '৳';
  const grandTotal = Math.max(0, subtotal + deliveryCharge - couponDiscount);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim())}&total=${subtotal}`);
      const json = await res.json();
      if (json.success) {
        setCouponDiscount(json.discount || 0);
        setCouponApplied(json.coupon.code);
        showToast(lang === 'ar' ? 'تم تطبيق كود الخصم بنجاح!' : 'Coupon applied successfully!');
      } else {
        setCouponError(json.message || 'Invalid coupon code.');
        setCouponDiscount(0);
        setCouponApplied(null);
      }
    } catch (err) {
      setCouponError('Error verifying coupon.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) {
      alert(lang === 'ar' ? 'سلة المشتريات فارغة!' : 'Your cart is empty! Please add products first.');
      return;
    }

    if (!formData.name.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة الاسم بالكامل.' : 'Please enter your full name.');
      return;
    }

    if (!formData.phone.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة رقم الهاتف / الجوال.' : 'Please enter your mobile phone number.');
      return;
    }

    if (!formData.address.trim()) {
      alert(lang === 'ar' ? 'يرجى كتابة العنوان التفصيلي للتوصيل.' : 'Please enter your detailed delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.district}`,
        city: formData.city,
        district: formData.district,
        country: selectedCountry,
        deliveryZone: formData.deliveryZone,
        delivery_charge: deliveryCharge,
        payment_method: formData.paymentMethod,
        trx_id: formData.trxId,
        coupon_code: couponApplied,
        coupon_discount: couponDiscount,
        subtotal: subtotal,
        total: grandTotal,
        currency: selectedCountry === 'Bahrain' ? 'BHD' : 'BDT',
        notes: formData.notes,
        items: cart,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setOrderSuccess({
          orderNumber: json.orderNumber,
          phone: formData.phone,
          total: grandTotal,
          currency: currentCurrency,
          items: [...cart],
        });

        // Trigger Purchase event via Meta Pixel & CAPI
        trackClientAndServer('Purchase', {
          currency: selectedCountry === 'Bahrain' ? 'BHD' : 'BDT',
          value: grandTotal,
          content_type: 'product',
          content_ids: cart.map((i) => String(i.id || '')),
          num_items: cart.length,
          order_id: json.orderNumber,
        });

        clearCart();
        showToast(lang === 'ar' ? 'تم تسجيل طلبك بنجاح!' : 'Order placed successfully!');
      } else {
        alert(json.message || 'Failed to place order.');
      }
    } catch (err) {
      alert('Server error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!orderSuccess || !reviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: orderSuccess.items && orderSuccess.items[0]?.id ? orderSuccess.items[0].id : 990001,
          customer_name: formData.name,
          customer_phone: orderSuccess.phone,
          rating: reviewRating,
          comment: reviewText.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setReviewSubmitted(true);
        showToast(lang === 'ar' ? 'شكراً لك! تم استلام تقييمك للمراجعة.' : 'Thank you! Your review has been submitted for moderation.');
      }
    } catch (e) {
      alert('Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 15px' }}>
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '40px 30px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 20px auto',
            }}
          >
            <i className="fa-solid fa-check"></i>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 10px 0', color: 'var(--text-color)' }}>
            {t('order_success_title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 25px auto', lineHeight: '1.6' }}>
            {t('thank_you')}
          </p>

          <div
            style={{
              background: 'var(--search-bg)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '20px',
              marginBottom: '30px',
              textAlign: lang === 'ar' ? 'right' : 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('order_number')}:</span>
              <span style={{ fontWeight: '800', color: '#FF6600', fontSize: '16px' }}>{orderSuccess.orderNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('phone_number')}:</span>
              <span style={{ fontWeight: '600' }}>{orderSuccess.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t('total')}:</span>
              <span style={{ fontWeight: '800', fontSize: '16px', color: '#FF6600' }}>
                {orderSuccess.currency} {Number(orderSuccess.total).toFixed(3)}
              </span>
            </div>
          </div>

          {/* Feedback & Review Form */}
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              border: '1.5px solid #FF6600',
              padding: '24px',
              marginBottom: '30px',
              textAlign: lang === 'ar' ? 'right' : 'left',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: 'var(--text-color)' }}>
              {t('write_a_review')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              {lang === 'ar' ? 'شاركنا تجربتك ورأيك بالمنتجات وسرعة التوصيل' : 'Share your feedback or questions about your purchase.'}
            </p>

            {reviewSubmitted ? (
              <div style={{ padding: '12px', borderRadius: '8px', background: '#ECFDF5', color: '#059669', fontWeight: '700', fontSize: '13px' }}>
                ✓ {lang === 'ar' ? 'شكراً لك! تم استلام تقييمك وسيظهر في الموقع فور اعتماده.' : 'Thank you! Your feedback has been received and will appear after moderation.'}
              </div>
            ) : (
              <form onSubmit={handlePostReview}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: star <= reviewRating ? '#F59E0B' : '#CBD5E1',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder={lang === 'ar' ? 'اكتب رأيك هنا...' : 'Write your comment or review here...'}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                    marginBottom: '12px',
                  }}
                />
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#FF6600',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {reviewSubmitting ? '...' : t('submit_review')}
                </button>
              </form>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              href={`/track-order?query=${orderSuccess.orderNumber}`}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                background: '#FF6600',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              {t('track_order')}
            </Link>
            <Link
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                background: 'var(--search-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                fontWeight: '700',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              {t('home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeMethodObj = paymentMethods.find((m) => m.code === formData.paymentMethod);

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 15px' }}>
      <div style={{ marginBottom: '30px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-color)' }}>
          {t('checkout_title')}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          {t('checkout_subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'flex-start' }}>
        {/* Left Form */}
        <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Customer Details Box */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 18px 0', color: 'var(--text-color)' }}>
              1. {t('customer_info')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Country Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('select_country')} *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountry('Bahrain');
                      setFormData((prev) => ({
                        ...prev,
                        district: 'Capital Governorate (Manama)',
                        city: 'Manama',
                        deliveryZone: 'inside',
                      }));
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: selectedCountry === 'Bahrain' ? '2px solid #FF6600' : '1px solid var(--border-color)',
                      background: selectedCountry === 'Bahrain' ? 'rgba(255,102,0,0.08)' : 'var(--search-bg)',
                      color: selectedCountry === 'Bahrain' ? '#FF6600' : 'var(--text-color)',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    🇧🇭 Bahrain (مملكة البحرين)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCountry('Bangladesh');
                      setFormData((prev) => ({
                        ...prev,
                        district: 'Dhaka',
                        city: 'Dhaka City',
                        deliveryZone: 'inside',
                      }));
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: selectedCountry === 'Bangladesh' ? '2px solid #FF6600' : '1px solid var(--border-color)',
                      background: selectedCountry === 'Bangladesh' ? 'rgba(255,102,0,0.08)' : 'var(--search-bg)',
                      color: selectedCountry === 'Bangladesh' ? '#FF6600' : 'var(--text-color)',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    🇧🇩 Bangladesh Branch
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('full_name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder={lang === 'ar' ? 'مثال: أحمد عبد الله الخليفة' : 'e.g. Ahmed Al-Khalifa'}
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('phone_number')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder={selectedCountry === 'Bahrain' ? '+973 3988 1234' : '01339893391'}
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    {t('select_governorate')} *
                  </label>
                  {selectedCountry === 'Bahrain' ? (
                    <select
                      name="district"
                      value={formData.district}
                      onChange={(e) => {
                        const dist = e.target.value;
                        const gov = BAHRAIN_GOVERNORATES.find((g) => g.name_en === dist || g.id === dist);
                        setFormData((prev) => ({
                          ...prev,
                          district: dist,
                          deliveryZone: gov?.zone || 'inside',
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--search-bg)',
                        color: 'var(--text-color)',
                        fontSize: '13px',
                      }}
                    >
                      {BAHRAIN_GOVERNORATES.map((g) => (
                        <option key={g.id} value={g.name_en}>
                          {lang === 'ar' ? g.name_ar : g.name_en}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      name="district"
                      value={formData.district}
                      onChange={(e) => {
                        const dist = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          district: dist,
                          deliveryZone: dist === 'Dhaka' ? 'inside' : 'outside',
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--search-bg)',
                        color: 'var(--text-color)',
                        fontSize: '13px',
                      }}
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                    {t('city_area')} *
                  </label>
                  {selectedCountry === 'Bahrain' ? (
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--search-bg)',
                        color: 'var(--text-color)',
                        fontSize: '13px',
                      }}
                    >
                      {BAHRAIN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Ramganj / Gulshan"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--search-bg)',
                        color: 'var(--text-color)',
                        fontSize: '13px',
                      }}
                    />
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('detailed_address')} *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder={lang === 'ar' ? 'رقم المبنى، الطريق، المجمع السكني...' : 'Building, Road, Block, Apartment No.'}
                  value={formData.address}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                  {t('special_notes')}
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder={lang === 'ar' ? 'أي تعليمات خاصة بالاستلام أو وقت التسليم...' : 'Any special delivery instructions...'}
                  value={formData.notes}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--search-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Payment Systems Selection */}
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 18px 0', color: 'var(--text-color)' }}>
              2. {t('payment_method')}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentMethods.map((m) => {
                const isSelected = formData.paymentMethod === m.code;
                const methodName = lang === 'ar' && m.name_ar ? m.name_ar : m.name;
                const methodInstructions = lang === 'ar' && m.instructions_ar ? m.instructions_ar : m.instructions;

                return (
                  <div
                    key={m.id}
                    style={{
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #FF6600' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(255, 102, 0, 0.04)' : 'var(--search-bg)',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 18px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.code}
                          checked={isSelected}
                          onChange={handleInputChange}
                          style={{ accentColor: '#FF6600', width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-color)' }}>
                            {methodName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {methodInstructions || (m.code === 'cod' ? t('cash_on_delivery_guarantee') : 'Instant & secure payment')}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FF6600',
                          fontSize: '18px',
                        }}
                      >
                        <i className={`fa-solid ${m.icon || 'fa-credit-card'}`}></i>
                      </div>
                    </label>

                    {/* Additional Payment Info if Selected and Needs TrxID or Account */}
                    {isSelected && (m.account_number || m.iban || m.type === 'mobile_wallet') && (
                      <div style={{ padding: '0 18px 18px', borderTop: '1px dashed #FED7AA', marginTop: '4px', paddingTop: '14px' }}>
                        <div style={{ background: 'rgba(255,102,0,0.06)', padding: '12px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
                          {m.account_number && (
                            <div style={{ fontWeight: '700', color: '#C2410C', marginBottom: '4px' }}>
                              <i className="fa-solid fa-mobile-screen" style={{ marginRight: '6px' }}></i>
                              {m.name}: <span style={{ fontFamily: 'monospace', fontSize: '14px' }}>{m.account_number}</span>
                            </div>
                          )}
                          {m.iban && (
                            <div style={{ fontSize: '12px', color: '#9A3412', fontFamily: 'monospace' }}>
                              IBAN: {m.iban}
                            </div>
                          )}
                          <div style={{ fontSize: '12px', color: '#9A3412', marginTop: '4px' }}>
                            {methodInstructions}
                          </div>
                        </div>

                        <input
                          type="text"
                          name="trxId"
                          placeholder={lang === 'ar' ? 'أدخل رقم المعاملة أو المرجع (Reference / TrxID)' : 'Enter Reference / Transaction ID (TrxID)'}
                          value={formData.trxId}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: '1px solid #FED7AA',
                            background: '#FFFFFF',
                            fontSize: '13px',
                            color: '#0F172A',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button on Mobile & Desktop */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: '#FF6600',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '16px',
              fontWeight: '800',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 15px rgba(255, 102, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <i className="fa-solid fa-lock"></i>
            <span>{submitting ? t('order_processing') : t('place_order')}</span>
          </button>
        </form>

        {/* Right Order Summary & Cart Items */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 18px 0', color: 'var(--text-color)' }}>
              {t('shopping_cart')} ({cart.length})
            </h2>

            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img
                    src={item.image || '/logo.PNG'}
                    alt={item.title}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lang === 'ar' && item.title_ar ? item.title_ar : item.title}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {item.quantity} × {currentCurrency} {Number(item.price).toFixed(3)}
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '13px' }}>
                    {currentCurrency} {(Number(item.price) * (item.quantity || 1)).toFixed(3)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                placeholder={t('coupon_code')}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--search-bg)',
                  color: 'var(--text-color)',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                disabled={couponLoading}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {couponLoading ? '...' : t('apply_coupon')}
              </button>
            </form>

            {couponError && (
              <div style={{ color: '#DC2626', fontSize: '12px', marginBottom: '12px' }}>{couponError}</div>
            )}
            {couponApplied && (
              <div style={{ color: '#059669', fontSize: '12px', marginBottom: '12px', fontWeight: '700' }}>
                ✓ {couponApplied}: -{currentCurrency} {couponDiscount.toFixed(3)}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>{t('subtotal')}</span>
                <span>{currentCurrency} {subtotal.toFixed(3)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>{t('delivery_charge')}</span>
                <span>{currentCurrency} {deliveryCharge.toFixed(3)}</span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                  <span>{t('coupon_code')}</span>
                  <span>-{currentCurrency} {couponDiscount.toFixed(3)}</span>
                </div>
              )}
              <div
                style={{
                  borderTop: '2px solid var(--border-color)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: '800',
                  fontSize: '18px',
                  color: '#FF6600',
                }}
              >
                <span>{t('total')}</span>
                <span>{currentCurrency} {grandTotal.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
