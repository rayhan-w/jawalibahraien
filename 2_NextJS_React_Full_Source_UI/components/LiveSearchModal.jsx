'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const POPULAR_SUGGESTIONS = [
  { label: '⚡ 45W Charger', query: '45w' },
  { label: '📱 iPhone', query: 'iphone' },
  { label: '🔌 Type-C Cable', query: 'type c' },
  { label: '🎧 Earbuds', query: 'earbuds' },
  { label: '🔋 Power Bank', query: 'power bank' },
  { label: '⌚ Smart Watch', query: 'smart watch' },
  { label: 'Samsung', query: 'samsung' },
  { label: 'Baseus', query: 'baseus' },
];

export default function LiveSearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Load recent searches on mount / open
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('jawali_recent_searches');
        if (stored) {
          setRecentSearches(JSON.parse(stored).slice(0, 5));
        }
      } catch (e) {}
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const saveRecentSearch = (text) => {
    if (!text || !text.trim()) return;
    try {
      const q = text.trim();
      const updated = [q, ...recentSearches.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('jawali_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleFullSearch = (searchTerm) => {
    const q = (searchTerm || query).trim();
    if (!q) return;
    saveRecentSearch(q);
    onClose();
    router.push(`/products?search=${encodeURIComponent(q)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFullSearch(query);
  };

  // Instant live search with fast debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=10`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [query]);

  // Highlight matching tokens in titles
  const renderHighlightedTitle = (title, searchQuery) => {
    if (!searchQuery || !title) return title;
    const words = searchQuery
      .trim()
      .toLowerCase()
      .split(/[\s\-_/]+/)
      .filter((w) => w.length > 0);

    if (words.length === 0) return title;

    try {
      const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
      const regex = new RegExp(`(${escaped})`, 'gi');
      const parts = title.split(regex);

      return parts.map((part, i) =>
        words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            style={{
              background: '#FFEDD5',
              color: '#EA580C',
              fontWeight: '800',
              borderRadius: '2px',
              padding: '0 2px',
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch (e) {
      return title;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="live-search-overlay" onClick={onClose}>
      <div className="live-search-card" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="live-search-header" style={{ position: 'relative' }}>
          <i className="fa-solid fa-magnifying-glass" style={{ color: '#FF6600', fontSize: '18px' }}></i>
          <input
            ref={inputRef}
            type="text"
            className="live-search-input"
            placeholder="যেকোনো ডিভাইসের নাম বা মডেল লিখুন (যেমন: 45w, iPhone, Type-C, Buds...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ fontSize: '15px' }}
          />

          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear text"
              style={{
                background: '#E2E8F0',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                cursor: 'pointer',
                color: '#64748B',
                marginRight: '6px',
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '4px',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </form>

        {/* Suggestion Chips & Recent Searches (shown when query is empty) */}
        {!query.trim() && (
          <div style={{ padding: '16px 20px', background: '#FAFAFA', borderBottom: '1px solid var(--border-color)' }}>
            {recentSearches.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '11px' }}></i> সাম্প্রতিক সার্চ (Recent)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('jawali_recent_searches');
                    }}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '11px', cursor: 'pointer' }}
                  >
                    মুছে ফেলুন
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {recentSearches.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(item)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                <i className="fa-solid fa-fire" style={{ color: '#FF6600', fontSize: '11px' }}></i> জনপ্রিয় গ্যাজেট ও ডিভাইস (Popular)
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(s.query)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '20px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#0F172A',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="live-search-results">
          {loading && (
            <div style={{ textAlign: 'center', padding: '28px', color: '#64748B', fontSize: '14px' }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px', color: '#FF6600' }}></i> ডিভাইস ও প্রোডাক্ট খোঁজা হচ্ছে...
            </div>
          )}

          {!loading && query.trim() !== '' && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: '36px', color: '#CBD5E1', marginBottom: '12px', display: 'block' }}></i>
              <p style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#334155' }}>
                "{query}" দিয়ে কোনো প্রোডাক্ট পাওয়া যায়নি
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                বানানটি চেক করুন বা ডিভাইসের সংক্ষিপ্ত নাম লিখুন (যেমন: 45w, Type-C, Samsung, Earbuds)
              </p>
            </div>
          )}

          {results.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="search-result-row"
              onClick={() => {
                saveRecentSearch(query);
                onClose();
              }}
              style={{ padding: '10px 18px', borderBottom: '1px solid #F1F5F9' }}
            >
              <img
                src={p.image || '/logo.PNG'}
                alt={p.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.PNG';
                }}
                style={{
                  width: '48px',
                  height: '48px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '3px',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {renderHighlightedTitle(p.title, query)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{p.brand}</span>
                  {p.category_name && <span>• {p.category_name}</span>}
                  {p.stock > 0 ? (
                    <span style={{ color: '#16A34A', fontSize: '11px', fontWeight: '700' }}>● ইন-স্টক</span>
                  ) : (
                    <span style={{ color: '#DC2626', fontSize: '11px', fontWeight: '700' }}>● স্টক আউট</span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#FF6600', flexShrink: 0, textAlign: 'right' }}>
                ৳{Number(p.price).toLocaleString('en-US')}
              </div>
            </Link>
          ))}
        </div>

        {/* View All Search Results Footer */}
        {results.length > 0 && query.trim() && (
          <div
            style={{
              padding: '10px 18px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC',
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
              {results.length} টি প্রোডাক্ট পাওয়া গেছে
            </span>
            <button
              type="button"
              onClick={() => handleFullSearch(query)}
              style={{
                background: '#FF6600',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              সকল ফলাফল দেখুন <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
