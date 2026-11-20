'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function AboutPage() {
  const { lang, t } = useCart();

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 15px 70px 15px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)', margin: '0 0 10px 0' }}>
          {lang === 'ar' ? 'من نحن • جوالي تليكوم' : 'About Jawali Telecom'}
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
          {lang === 'ar'
            ? 'الجودة التي لا تقبل المساومة والأصالة المعتمدة ١٠٠٪ هي جوهر رسالتنا في مملكة البحرين والخليج العربي.'
            : 'Uncompromising quality, authentic products, and customer satisfaction in Bahrain & GCC.'}
        </p>
      </div>

      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          padding: '35px',
          marginBottom: '30px',
          lineHeight: '1.8',
          fontSize: '15px',
          color: 'var(--text-color)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FF6600', marginBottom: '12px' }}>
          {lang === 'ar' ? 'قصتنا ورسالتنا' : 'Our Story & Commitment'}
        </h3>
        <p>
          {lang === 'ar'
            ? 'تعد شركة جوالي تليكوم (Jawali Telecom) وجهة رائدة وموثوقة لبيع وتوزيع أحدث الهواتف الذكية الأصلية (آبل، سامسونج، شاومي)، النظارات الذكية، أجهزة الصوت اللاسلكية، بنوك الطاقة وشواحن MagSafe المعتمدة في مملكة البحرين والمنطقة.'
            : 'Jawali Telecom is a renowned, trusted premium mobile phones and tech gadgets retailer based in Bahrain and Bangladesh. We provide authentic, official smartphones, audio accessories, smartwatches, and high-performance charging gear from leading global brands like Apple, Samsung, Anker, Porodo, and Green Lion.'}
        </p>
        <p>
          {lang === 'ar'
            ? 'نحن نؤمن بالشفافية المطلقة مع عملائنا: نوفر خيارات الدفع عند الاستلام (COD) مع حق معاينة المنتج قبل الاستلام، بوابات الدفع الوطنية بنفت بي (BenefitPay)، البطاقات البنكية، وضمانات رسمية معتمدة مع خدمة توصيل فائقة السرعة.'
            : 'We believe in customer-first transparency: offering multiple payment systems including BenefitPay, Cash on Delivery, Credit Cards, STC Pay, verified warranties, and rapid express delivery across Bahrain & GCC.'}
        </p>

        <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FF6600', marginTop: '30px', marginBottom: '12px' }}>
          {lang === 'ar' ? 'فروعنا ومعارضنا' : 'Our Showrooms & Branches'}
        </h3>
        <ul style={{ paddingRight: lang === 'ar' ? '20px' : 0, paddingLeft: lang === 'ar' ? 0 : '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li>
            <strong>🇧🇭 {lang === 'ar' ? 'الفرع الرئيسي - مملكة البحرين:' : 'Bahrain Main Branch:'}</strong>{' '}
            {lang === 'ar' ? 'محل ١٤، الحي التجاري، المنامة، مملكة البحرين | هاتف / واتساب: 33989339 973+' : 'Shop 14, Commercial District, Manama, Kingdom of Bahrain | Phone / WhatsApp: +973 3398 9339'}
          </li>
          <li>
            <strong>🇧🇩 {lang === 'ar' ? 'فرع بنغلاديش:' : 'Bangladesh Branch:'}</strong>{' '}
            {lang === 'ar' ? 'طريق البايباس، أمام برج رامغانج، لاكشميبور، بنغلاديش | هاتف: 01339893391' : 'Bypass Road, In Front of Ramganj Tower, Ramganj, Lakshmipur, Bangladesh | Phone: 01339893391'}
          </li>
        </ul>

        <div style={{ marginTop: '35px', textAlign: 'center' }}>
          <Link
            href="/products"
            style={{
              padding: '12px 28px',
              borderRadius: '25px',
              background: '#FF6600',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)',
            }}
          >
            {t('all_products')}
          </Link>
        </div>
      </div>
    </div>
  );
}
