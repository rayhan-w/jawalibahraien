'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function ProductsClient({
  initialProducts = [],
  initialCategories = [],
  initialSubCategories = [],
}) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory') || searchParams.get('sub_category');
  const searchParam = searchParams.get('search');

  const [products, setProducts] = useState(initialProducts);
  const [catalogProducts, setCatalogProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [subcategories, setSubcategories] = useState(initialSubCategories);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [selectedSubCategory, setSelectedSubCategory] = useState(subcategoryParam || 'all');
  const [searchTerm, setSearchTerm] = useState(searchParam || '');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const isFirstMount = useRef(true);

  // Sync with URL parameters if user navigated via link or back/forward
  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (subcategoryParam) setSelectedSubCategory(subcategoryParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [categoryParam, subcategoryParam, searchParam]);

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        setSelectedCategory(params.get('category') || 'all');
        setSelectedSubCategory(params.get('subcategory') || params.get('sub_category') || 'all');
        if (params.get('search')) setSearchTerm(params.get('search'));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure full catalog products are loaded for accurate live counts
  useEffect(() => {
    if (catalogProducts.length === 0) {
      fetch('/api/products?all=true')
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) setCatalogProducts(json.data);
        })
        .catch((err) => console.error('Error fetching catalog products for counts:', err));
    }
  }, [catalogProducts.length]);

  // Load categories if not provided from server
  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setCategories(json.data || []);
        })
        .catch((err) => console.error(err));
    }
  }, [categories.length]);

  // Load subcategories if not provided from server
  useEffect(() => {
    if (subcategories.length === 0) {
      fetch('/api/categories/sub')
        .then((res) => res.json())
        .then((json) => {
          if (json.success) setSubcategories(json.data || []);
        })
        .catch((err) => console.error(err));
    }
  }, [subcategories.length]);

  // Sync state changes with URL query parameters
  const updateUrlParams = (cat, sub) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (!cat || cat === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', cat);
    }
    if (!sub || sub === 'all') {
      url.searchParams.delete('subcategory');
      url.searchParams.delete('sub_category');
    } else {
      url.searchParams.set('subcategory', sub);
    }
    window.history.pushState(null, '', url.pathname + url.search);
  };

  const handleSelectCategory = (catSlug) => {
    setSelectedCategory(catSlug);
    setSelectedSubCategory('all');
    updateUrlParams(catSlug, 'all');
  };

  const handleSelectSubCategory = (subSlug) => {
    setSelectedSubCategory(subSlug);
    updateUrlParams(selectedCategory, subSlug);
  };

  // Derive counts dynamically from real catalog dataset
  const getCategoryCount = (c) => {
    if (c === 'all') return catalogProducts.length;
    return catalogProducts.filter((p) => {
      if (p.category_id && Number(p.category_id) === Number(c.id)) return true;
      if (p.category_slug && p.category_slug.toLowerCase() === c.slug.toLowerCase()) return true;
      if (p.category_name && p.category_name.toLowerCase() === c.name.toLowerCase()) return true;
      return false;
    }).length;
  };

  const activeCategoryObj =
    selectedCategory !== 'all'
      ? categories.find(
          (c) =>
            c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
            c.name.toLowerCase() === selectedCategory.toLowerCase() ||
            String(c.id) === String(selectedCategory)
        )
      : null;

  const activeCategorySubcategories = activeCategoryObj
    ? subcategories.filter((s) => Number(s.category_id) === Number(activeCategoryObj.id))
    : [];

  const getSubCategoryCount = (sub) => {
    return catalogProducts.filter((p) => {
      const matchCat =
        (activeCategoryObj && p.category_id && Number(p.category_id) === Number(activeCategoryObj.id)) ||
        (activeCategoryObj && p.category_slug && p.category_slug.toLowerCase() === activeCategoryObj.slug.toLowerCase()) ||
        (activeCategoryObj && p.category_name && p.category_name.toLowerCase() === activeCategoryObj.name.toLowerCase());
      if (!matchCat) return false;
      const pSub = p.sub_category ? String(p.sub_category).toLowerCase() : '';
      return pSub === sub.slug.toLowerCase() || pSub === sub.name.toLowerCase();
    }).length;
  };

  // Load products based on filters
  useEffect(() => {
    // If it's the very first mount, and default state with initial server products, skip redundant client fetch
    if (
      isFirstMount.current &&
      initialProducts.length > 0 &&
      selectedCategory === 'all' &&
      selectedSubCategory === 'all' &&
      !searchTerm.trim() &&
      sortBy === 'popular'
    ) {
      isFirstMount.current = false;
      return;
    }
    isFirstMount.current = false;

    setLoading(true);
    let url = `/api/products?`;
    if (selectedCategory && selectedCategory !== 'all') {
      url += `category=${encodeURIComponent(selectedCategory)}&`;
    }
    if (selectedSubCategory && selectedSubCategory !== 'all') {
      url += `subcategory=${encodeURIComponent(selectedSubCategory)}&`;
    }
    if (searchTerm.trim()) {
      url += `search=${encodeURIComponent(searchTerm.trim())}&`;
    }
    if (sortBy === 'price_asc') {
      url += `sort=price_asc&`;
    } else if (sortBy === 'price_desc') {
      url += `sort=price_desc&`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setProducts(json.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSubCategory, searchTerm, sortBy, initialProducts.length]);

  // Filter products by price range client-side
  const filteredProducts = products.filter((p) => {
    const price = Number(p.price);
    if (selectedPriceRange === '0-5000') return price <= 5000;
    if (selectedPriceRange === '5000-10000') return price > 5000 && price <= 10000;
    if (selectedPriceRange === '10000-20000') return price > 10000 && price <= 20000;
    if (selectedPriceRange === '20000+') return price > 20000;
    return true;
  });

  // Dynamic Real Pagination (12 items per page default - 3 full rows x 4 columns on desktop)
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const effectivePerPage = itemsPerPage === 'all' ? Math.max(filteredProducts.length, 1) : Number(itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / effectivePerPage));

  // Reset to page 1 whenever any filter or pagination limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedPriceRange, selectedRating, searchTerm, sortBy, itemsPerPage]);

  // Sliced products for current page
  const startIndex = (currentPage - 1) * effectivePerPage;
  const paginatedProducts = itemsPerPage === 'all' ? filteredProducts : filteredProducts.slice(startIndex, startIndex + effectivePerPage);

  const handlePageChange = (newPage) => {
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const clearFilters = () => {
    handleSelectCategory('all');
    handleSelectSubCategory('all');
    setSelectedPriceRange('all');
    setSelectedBrand('all');
    setSelectedRating('all');
    setSearchTerm('');
    setSortBy('popular');
    setCurrentPage(1);
  };

  const currentCategoryTitle =
    selectedCategory !== 'all'
      ? selectedSubCategory !== 'all'
        ? `${categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.name.toLowerCase() === selectedCategory.toLowerCase())?.name || 'Category'} > ${subcategories.find((s) => s.slug.toLowerCase() === selectedSubCategory.toLowerCase() || s.name.toLowerCase() === selectedSubCategory.toLowerCase())?.name || selectedSubCategory}`
        : categories.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase() || c.name.toLowerCase() === selectedCategory.toLowerCase())?.name || 'Category'
      : searchTerm
      ? `Search: "${searchTerm}"`
      : 'All Products';

  const isAnyFilterActive =
    selectedCategory !== 'all' ||
    selectedSubCategory !== 'all' ||
    selectedPriceRange !== 'all' ||
    selectedRating !== 'all' ||
    searchTerm.trim() !== '';

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubCategory !== 'all' ? 1 : 0) +
    (selectedPriceRange !== 'all' ? 1 : 0) +
    (selectedRating !== 'all' ? 1 : 0);

  const renderFilterContent = (isMobile = false) => (
    <div>
      {/* Filter Header with Clear All */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-sliders" style={{ color: '#FF6600', fontSize: '15px' }}></i>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
            Filter
          </h3>
        </div>
        <button
          type="button"
          onClick={clearFilters}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6600',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Clear All
        </button>
      </div>

      {/* Section: Category Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '12px' }}>
          Category
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            className={`category-filter-option ${selectedCategory === 'all' ? 'selected' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: selectedCategory === 'all' ? '#FFFFFF' : 'transparent',
              border: `1px solid ${selectedCategory === 'all' ? '#FF6600' : 'transparent'}`,
              color: selectedCategory === 'all' ? '#FF6600' : 'var(--text-color)',
              fontWeight: selectedCategory === 'all' ? '700' : '500',
              boxShadow: selectedCategory === 'all' ? '0 2px 6px rgba(255, 102, 0, 0.12)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="radio"
              name={isMobile ? 'cat_filter_mobile' : 'cat_filter'}
              checked={selectedCategory === 'all'}
              onChange={() => handleSelectCategory('all')}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: selectedCategory === 'all' ? '2px solid #FF6600' : '2px solid #CBD5E1',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
            >
              {selectedCategory === 'all' && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#FF6600',
                  }}
                />
              )}
            </span>
            <span style={{ flex: 1 }}>All Categories ({getCategoryCount('all')})</span>
          </label>
          {categories.map((c) => (
            <label
              key={c.id}
              className={`category-filter-option ${selectedCategory === c.slug ? 'selected' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedCategory === c.slug ? '#FFFFFF' : 'transparent',
                border: `1px solid ${selectedCategory === c.slug ? '#FF6600' : 'transparent'}`,
                color: selectedCategory === c.slug ? '#FF6600' : 'var(--text-color)',
                fontWeight: selectedCategory === c.slug ? '700' : '500',
                boxShadow: selectedCategory === c.slug ? '0 2px 6px rgba(255, 102, 0, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="radio"
                name={isMobile ? 'cat_filter_mobile' : 'cat_filter'}
                checked={selectedCategory === c.slug}
                onChange={() => handleSelectCategory(c.slug)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: selectedCategory === c.slug ? '2px solid #FF6600' : '2px solid #CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                }}
              >
                {selectedCategory === c.slug && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#FF6600',
                    }}
                  />
                )}
              </span>
              <span style={{ flex: 1 }}>{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section: Price Range */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '12px' }}>
          Price Range
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { val: 'all', label: 'All Prices' },
            { val: '0-5000', label: '৳0 - ৳5,000' },
            { val: '5000-10000', label: '৳5,000 - ৳10,000' },
            { val: '10000-20000', label: '৳10,000 - ৳20,000' },
            { val: '20000+', label: '৳20,000+' },
          ].map((p) => (
            <label
              key={p.val}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: selectedPriceRange === p.val ? '#FF6600' : 'var(--text-color)',
                fontWeight: selectedPriceRange === p.val ? '700' : '500',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                background: selectedPriceRange === p.val ? '#FFFFFF' : 'transparent',
                border: `1px solid ${selectedPriceRange === p.val ? '#FF6600' : 'transparent'}`,
                boxShadow: selectedPriceRange === p.val ? '0 2px 6px rgba(255, 102, 0, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="radio"
                name={isMobile ? 'price_filter_mobile' : 'price_filter'}
                checked={selectedPriceRange === p.val}
                onChange={() => setSelectedPriceRange(p.val)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: selectedPriceRange === p.val ? '2px solid #FF6600' : '2px solid #CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                }}
              >
                {selectedPriceRange === p.val && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#FF6600',
                    }}
                  />
                )}
              </span>
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section: Rating */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '12px' }}>
          Customer Rating
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { val: '4', label: '4★ & above' },
            { val: '3', label: '3★ & above' },
            { val: 'all', label: 'All Ratings' },
          ].map((r) => (
            <label
              key={r.val}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                cursor: 'pointer',
                color: selectedRating === r.val ? '#FF6600' : 'var(--text-color)',
                fontWeight: selectedRating === r.val ? '700' : '500',
                padding: '6px 12px',
                borderRadius: '8px',
                background: selectedRating === r.val ? '#FFFFFF' : 'transparent',
                border: `1px solid ${selectedRating === r.val ? '#FF6600' : 'transparent'}`,
                boxShadow: selectedRating === r.val ? '0 2px 6px rgba(255, 102, 0, 0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="radio"
                name={isMobile ? 'rating_filter_mobile' : 'rating_filter'}
                checked={selectedRating === r.val}
                onChange={() => setSelectedRating(r.val)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
              />
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: selectedRating === r.val ? '2px solid #FF6600' : '2px solid #CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  transition: 'all 0.15s ease',
                }}
              >
                {selectedRating === r.val && (
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#FF6600',
                    }}
                  />
                )}
              </span>
              <span style={{ color: '#F59E0B' }}>★</span>
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 15px 70px 15px' }}>
      <div
        className="catalog-layout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '30px',
          alignItems: 'start',
        }}
      >
        {/* Left Filter Sidebar matching mockup (Desktop) */}
        <aside
          style={{
            background: '#FFF5EA',
            border: '1.5px solid #FFD8B3',
            borderRadius: '16px',
            padding: '24px 20px',
            boxShadow: '0 4px 16px rgba(255, 102, 0, 0.06)',
          }}
          className="pc-only filter-sidebar-box"
        >
          {renderFilterContent(false)}
        </aside>

        {/* Right Product Listing Area */}
        <div>


          {/* Header Row: Category Name + Total Count, Mobile Filter Button, & Sort Dropdown */}
          <div
            className="catalog-header-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-color)', margin: '0 0 4px 0' }}>
                {currentCategoryTitle}
              </h1>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#FF6600' }}>
                Total: {filteredProducts.length} products
              </div>
            </div>

            {/* Right Controls: Mobile Filter Button + Sort by dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Mobile Filter Button */}
              <button
                type="button"
                className="mobile-filter-trigger-btn"
                onClick={() => setIsMobileFilterOpen(true)}
                aria-label="Open Filters"
              >
                <i className="fa-solid fa-sliders"></i>
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="mobile-filter-badge-count">{activeFilterCount}</span>
                )}
              </button>

              {/* Sort by dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pc-only" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  <option value="popular">Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Show items per page */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pc-only" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                  Show:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    fontSize: '13px',
                    outline: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips / Badges on Mobile */}
          {activeFilterCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                Active Filters:
              </span>
              {selectedCategory !== 'all' && (
                <span className="filter-chip">
                  {categories.find((c) => c.slug?.toLowerCase() === selectedCategory.toLowerCase() || String(c.id) === String(selectedCategory))?.name || selectedCategory}
                  <button type="button" onClick={() => handleSelectCategory('all')}>×</button>
                </span>
              )}
              {selectedPriceRange !== 'all' && (
                <span className="filter-chip">
                  ৳{selectedPriceRange}
                  <button type="button" onClick={() => setSelectedPriceRange('all')}>×</button>
                </span>
              )}
              {selectedRating !== 'all' && (
                <span className="filter-chip">
                  {selectedRating}★ & above
                  <button type="button" onClick={() => setSelectedRating('all')}>×</button>
                </span>
              )}

              {/* Subcategories under the active category shown before Clear All */}
              {selectedCategory !== 'all' && activeCategorySubcategories.length > 0 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '4px' }}>
                    Subcategories:
                  </span>
                  {activeCategorySubcategories.map((sub) => {
                    const isSelected =
                      selectedSubCategory.toLowerCase() === sub.slug.toLowerCase() ||
                      selectedSubCategory.toLowerCase() === sub.name.toLowerCase();
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelectSubCategory(isSelected ? 'all' : sub.slug)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '14px',
                          fontSize: '12px',
                          fontWeight: isSelected ? '700' : '600',
                          cursor: 'pointer',
                          border: isSelected ? '1.5px solid #FF6600' : '1px solid var(--border-color, #CBD5E1)',
                          background: isSelected ? '#FF6600' : 'var(--card-bg, #FFFFFF)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-color, #334155)',
                          transition: 'all 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: isSelected ? '0 2px 6px rgba(255, 102, 0, 0.2)' : 'none',
                        }}
                      >
                        <span>{sub.name}</span>
                        {isSelected && <span style={{ fontSize: '10px' }}>✕</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FF6600',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  marginLeft: '4px',
                }}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {loading && products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#FF6600', marginBottom: '10px' }}></i>
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--card-bg)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
              }}
            >
              <i className="fa-solid fa-box-open" style={{ fontSize: '36px', color: '#CBD5E1', marginBottom: '12px' }}></i>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-color)' }}>
                {selectedCategory !== 'all' ? 'No products in this category' : 'No products found'}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {selectedCategory !== 'all'
                  ? 'There are currently no products available in this category.'
                  : 'Try adjusting your filters or search keywords.'}
              </p>
              <button
                onClick={clearFilters}
                style={{
                  marginTop: '12px',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#FF6600',
                  color: '#fff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {paginatedProducts.length > 0 ? (
                <div
                  className="product-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '16px',
                    marginBottom: '35px',
                    opacity: loading ? 0.6 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '50px 20px',
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '35px',
                  }}
                >
                  <i className="fa-solid fa-box-open" style={{ fontSize: '36px', color: '#CBD5E1', marginBottom: '12px' }}></i>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '8px' }}>
                    Page {currentPage}-এ কোনো প্রোডাক্ট পাওয়া যায়নি
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    অ্যাডমিন প্যানেল থেকে আরও প্রোডাক্ট যোগ করলে স্বয়ংক্রিয়ভাবে এই পেজে চলে আসবে।
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    style={{
                      padding: '8px 20px',
                      background: '#FF6600',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    ১ম পেজে ফিরে যান
                  </button>
                </div>
              )}

              {/* Numbered Pagination: Dynamic full range */}
              {itemsPerPage !== 'all' && totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '35px' }}>
                  {currentPage > 1 && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      aria-label="Previous page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                    </button>
                  )}

                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? (
                      <span
                        key={`dots-${idx}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '28px',
                          height: '38px',
                          color: 'var(--text-muted)',
                          fontSize: '14px',
                          fontWeight: '700',
                          userSelect: 'none',
                        }}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          border: page === currentPage ? 'none' : '1px solid var(--border-color)',
                          background: page === currentPage ? '#FF6600' : 'var(--card-bg)',
                          color: page === currentPage ? '#FFFFFF' : 'var(--text-color)',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: page === currentPage ? '0 2px 8px rgba(255, 102, 0, 0.25)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {page}
                      </button>
                    )
                  )}

                  {currentPage < totalPages && (
                    <button
                      type="button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      aria-label="Next page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {isMobileFilterOpen && (
        <div className="mobile-filter-drawer-overlay" onClick={() => setIsMobileFilterOpen(false)}>
          <div
            className="mobile-filter-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-filter-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-sliders" style={{ color: '#FF6600', fontSize: '16px' }}></i>
                <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-color)' }}>
                  Filter
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF6600',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="mobile-filter-close-btn"
                  aria-label="Close Filter"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <div className="mobile-filter-drawer-body">
              {renderFilterContent(true)}
            </div>

            <div className="mobile-filter-drawer-footer">
              <button
                type="button"
                className="mobile-filter-apply-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters ({filteredProducts.length} Products)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
