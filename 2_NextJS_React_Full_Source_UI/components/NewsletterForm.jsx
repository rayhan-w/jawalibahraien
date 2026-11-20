'use client';

import React, { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flex: '1', maxWidth: '420px', width: '100%', flexWrap: 'wrap' }}>
      <input
        type="email"
        placeholder="Enter your email address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          flex: '1 1 200px',
          minWidth: 0,
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          background: 'var(--search-bg)',
          color: 'var(--text-color)',
          fontSize: '13px',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          background: subscribed ? '#059669' : '#FF6600',
          color: '#FFFFFF',
          border: 'none',
          fontWeight: '700',
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
      >
        {subscribed ? 'Subscribed!' : 'Subscribe'}
      </button>
    </form>
  );
}
