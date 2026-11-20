'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminTrackingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/settings#tracking');
  }, [router]);

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#4F46E5', marginBottom: '14px' }}></i>
      <p style={{ fontSize: '14px', fontWeight: '600' }}>Redirecting to Tracking & Analytics Settings...</p>
    </div>
  );
}
