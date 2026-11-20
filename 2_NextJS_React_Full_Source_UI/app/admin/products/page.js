'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const PAGE_SIZE = 25;

  const [form, setForm] = useState({
    title: '',
    category_id: '',
    sub_category: '',
    sku: '',
    brand: 'Jawali',
    price: '',
    old_price: '',
    stock: '10',
    badge: '',
    condition: 'New',
    image: '/logo.png',
    gallery_images: '',
    description: '',
    short_description: '',
    features: '',
    warranty: '',
    colors: '',
    sizes: '',
    rating: '4.8',
    reviews_count: '120',
    is_featured: false,
    is_bestseller: false,
    is_new: false,
    is_active: true,
    sort_order: '',
  });

  const [imageSourceType, setImageSourceType] = useState('device'); // 'device' | 'link'
  const [isUploading, setIsUploading] = useState(false);

  // Compress image on device (phone/PC) before storing
  const compressImage = (file, maxWidth = 900, quality = 0.82) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleDeviceImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      alert('Failed to load image from device.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeviceGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setIsUploading(true);
      const compressedList = await Promise.all(files.map((f) => compressImage(f, 800, 0.8)));
      
      let existing = [];
      if (form.gallery_images) {
        try {
          existing = typeof form.gallery_images === 'string' 
            ? (form.gallery_images.startsWith('[') ? JSON.parse(form.gallery_images) : form.gallery_images.split(',').map(s => s.trim()).filter(Boolean))
            : form.gallery_images;
        } catch {
          existing = form.gallery_images.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      const combined = [...existing, ...compressedList];
      setForm((prev) => ({ ...prev, gallery_images: JSON.stringify(combined) }));
    } catch (err) {
      alert('Failed to process gallery images.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeGalleryImage = (idx) => {
    try {
      let list = [];
      if (typeof form.gallery_images === 'string' && form.gallery_images.startsWith('[')) {
        list = JSON.parse(form.gallery_images);
      } else {
        list = form.gallery_images.split(',').map(s => s.trim()).filter(Boolean);
      }
      list.splice(idx, 1);
      setForm((prev) => ({ ...prev, gallery_images: JSON.stringify(list) }));
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        fetch('/api/products?all=1'),
        fetch('/api/categories'),
        fetch('/api/categories/sub'),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();
      const subJson = await subRes.json();

      if (prodJson.success) setProducts(prodJson.data || []);
      if (catJson.success) setCategories(catJson.data || []);
      if (subJson.success) setSubcategories(subJson.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setForm({
      title: '',
      category_id: categories[0]?.id || '',
      sub_category: '',
      sku: `JWL-${Math.floor(1000 + Math.random() * 9000)}`,
      brand: 'Jawali',
      price: '',
      old_price: '',
      stock: '10',
      badge: '',
      condition: 'New',
      image: '/logo.png',
      gallery_images: '',
      description: '',
      short_description: '',
      features: '',
      warranty: '1 Year Official Warranty',
      colors: '',
      sizes: '',
      rating: '4.8',
      reviews_count: '120',
      is_featured: false,
      is_bestseller: false,
      is_new: false,
      is_active: true,
      sort_order: '1',
    });
    setIsModalOpen(true);
    setImageSourceType('device');
  };

  const openEditModal = async (p) => {
    setEditProduct(p);
    setImageSourceType(p.image && p.image.startsWith('data:') ? 'device' : 'link');
    setForm({
      title: p.title || '',
      category_id: p.category_id || '',
      sub_category: p.sub_category || '',
      sku: p.sku || '',
      brand: p.brand || 'Jawali',
      price: p.price || '',
      old_price: p.old_price || '',
      stock: String(p.stock !== undefined ? p.stock : 10),
      badge: p.badge || '',
      condition: p.condition || 'New',
      image: p.image || '/logo.png',
      gallery_images: p.gallery_images ? (typeof p.gallery_images === 'string' ? p.gallery_images : JSON.stringify(p.gallery_images)) : '',
      description: p.description || '',
      short_description: p.short_description || '',
      features: p.features || '',
      warranty: p.warranty || '',
      colors: p.colors || '',
      sizes: p.sizes || '',
      rating: String(p.rating || '4.8'),
      reviews_count: String(p.reviews_count || '120'),
      is_featured: Boolean(p.is_featured === 1 || p.is_featured === true),
      is_bestseller: Boolean(p.is_bestseller === 1 || p.is_bestseller === true),
      is_new: Boolean(p.is_new === 1 || p.is_new === true),
      is_active: Boolean(p.is_active !== 0),
      sort_order: p.sort_order ? String(p.sort_order) : '',
    });
    setIsModalOpen(true);

    // If gallery_images or full description was not in the light list, fetch single product full payload
    if (!p.description || p.gallery_images === undefined) {
      try {
        const res = await fetch(`/api/products/${p.id}`);
        const json = await res.json();
        if (json.success && json.data) {
          const full = json.data;
          setForm((prev) => ({
            ...prev,
            description: full.description || prev.description,
            short_description: full.short_description || prev.short_description,
            features: full.features || prev.features,
            warranty: full.warranty || prev.warranty,
            colors: full.colors || prev.colors,
            sizes: full.sizes || prev.sizes,
            gallery_images: full.gallery_images ? (typeof full.gallery_images === 'string' ? full.gallery_images : JSON.stringify(full.gallery_images)) : prev.gallery_images,
          }));
        }
      } catch (err) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্টটি চিরতরে মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.message || 'প্রোডাক্ট ডিলিট করা সম্ভব হয়নি।');
      }
    } catch (e) {
      console.error(e);
      alert('সার্ভার সমস্যা হয়েছে।');
    }
  };

  const toggleStatus = async (p, field) => {
    try {
      const updatedVal = !p[field];
      await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: updatedVal }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleMoveProduct = async (visibleIndex, direction) => {
    const globalIndex = (currentPage - 1) * PAGE_SIZE + visibleIndex;
    const targetGlobalIndex = globalIndex + direction;

    if (targetGlobalIndex < 0 || targetGlobalIndex >= filteredProducts.length) return;

    const currentProd = filteredProducts[globalIndex];
    const targetProd = filteredProducts[targetGlobalIndex];

    if (!currentProd || !targetProd) return;

    setReordering(true);

    // Optimistically update products in state
    setProducts((prev) => {
      const copy = [...prev];
      const idx1 = copy.findIndex((p) => p.id === currentProd.id);
      const idx2 = copy.findIndex((p) => p.id === targetProd.id);
      if (idx1 !== -1 && idx2 !== -1) {
        const tempOrder = copy[idx1].sort_order;
        copy[idx1] = { ...copy[idx1], sort_order: copy[idx2].sort_order };
        copy[idx2] = { ...copy[idx2], sort_order: tempOrder };
      }
      return copy;
    });

    try {
      const res = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'swap',
          id: currentProd.id,
          target_id: targetProd.id,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message || 'ক্রম পরিবর্তন ব্যর্থ হয়েছে।');
        loadData();
      }
    } catch (err) {
      alert('সার্ভার সমস্যা হয়েছে।');
      loadData();
    } finally {
      setReordering(false);
    }
  };

  const handlePinToTop = async (prod) => {
    if (!prod || !prod.id) return;
    setReordering(true);
    try {
      const res = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pin_to_top', id: prod.id }),
      });
      const json = await res.json();
      if (json.success) {
        await loadData();
        setCurrentPage(1);
      } else {
        alert(json.message || 'শীর্ষে পিন করা সম্ভব হয়নি।');
      }
    } catch (err) {
      alert('সার্ভার সমস্যা হয়েছে।');
    } finally {
      setReordering(false);
    }
  };

  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const catKey = p.category_id ? String(p.category_id) : 'uncategorized';
      counts[catKey] = (counts[catKey] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory !== 'all') {
        if (String(p.category_id) !== String(selectedCategory)) return false;
      }
      if (selectedSubcategory !== 'all') {
        const matchSub = (p.sub_category === selectedSubcategory) || 
                         (p.sub_category && p.sub_category.toLowerCase() === selectedSubcategory.toLowerCase());
        if (!matchSub) return false;
      }
      if (searchQuery.trim()) {
        const words = searchQuery.toLowerCase().trim().split(/[\s\-_/]+/).filter(Boolean);
        const searchable = `${p.title || ''} ${p.brand || ''} ${p.sku || ''} ${p.category_name || ''} ${p.sub_category || ''} ${p.short_description || ''}`.toLowerCase();
        const searchableClean = searchable.replace(/[-_]/g, ' ');
        return words.every((w) => searchable.includes(w) || searchableClean.includes(w));
      }
      return true;
    });

    if (sortBy === 'views_desc') {
      result = [...result].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    } else if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      // Default: sort by sort_order ASC, then id DESC
      result = [...result].sort((a, b) => {
        const orderA = a.sort_order > 0 ? a.sort_order : 999999;
        const orderB = b.sort_order > 0 ? b.sort_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return (b.id || 0) - (a.id || 0);
      });
    }

    return result;
  }, [products, selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  // Reset pagination when category, subcategory, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, searchQuery, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const activeCategoryObj = categories.find((c) => String(c.id) === selectedCategory);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Product Catalog Management
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#FF6600', fontWeight: '600' }}>
                <i className="fa-solid fa-spinner fa-spin"></i> Loading product catalog...
              </span>
            ) : selectedCategory === 'all' ? (
              `Showing ${filteredProducts.length} total products ${totalPages > 1 ? `(Page ${currentPage} of ${totalPages})` : ''}`
            ) : (
              `Showing ${filteredProducts.length} items in "${activeCategoryObj?.name || 'Category'}" (Total catalog: ${products.length})`
            )}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8', fontSize: '13px' }}></i>
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              background: '#fff',
              color: '#334155',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <option value="default">↕️ ক্রম অনুযায়ী (Sort Order)</option>
            <option value="views_desc">👁️ Most Viewed (সর্বাধিক ভিউ)</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>

          <button
            onClick={openAddModal}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#FF6600',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(255,102,0,0.2)',
            }}
          >
            <i className="fa-solid fa-plus"></i> Add Product
          </button>
        </div>
      </div>

      {/* Category Filter Chips Bar */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-layer-group" style={{ color: '#FF6600' }}></i>
            <span>Filter by Category & Product Counts:</span>
          </div>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#475569',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <i className="fa-solid fa-rotate-left" style={{ fontSize: '10px' }}></i> Reset (Show All {loading ? '...' : products.length})
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {/* All Products Chip */}
          <button
            type="button"
            onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('all'); }}
            style={{
              padding: '7px 14px',
              borderRadius: '24px',
              fontSize: '13px',
              fontWeight: selectedCategory === 'all' ? '700' : '500',
              cursor: 'pointer',
              border: selectedCategory === 'all' ? '2px solid #FF6600' : '1px solid #E2E8F0',
              background: selectedCategory === 'all' ? '#FFF7ED' : '#F8FAFC',
              color: selectedCategory === 'all' ? '#FF6600' : '#334155',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease-in-out',
            }}
          >
            <span>All Products</span>
            <span
              style={{
                background: selectedCategory === 'all' ? '#FF6600' : '#E2E8F0',
                color: selectedCategory === 'all' ? '#fff' : '#475569',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
              }}
            >
              {loading ? '...' : products.length}
            </span>
          </button>

          {/* Dynamic Category Chips */}
          {categories.map((c) => {
            const count = categoryCounts[String(c.id)] || 0;
            const isActive = selectedCategory === String(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(isActive ? 'all' : String(c.id));
                  setSelectedSubcategory('all');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '24px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  border: isActive ? '2px solid #FF6600' : '1px solid #E2E8F0',
                  background: isActive ? '#FFF7ED' : '#F8FAFC',
                  color: isActive ? '#FF6600' : '#334155',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                {c.icon && <i className={`fa-solid ${c.icon}`} style={{ fontSize: '12px', opacity: 0.85 }}></i>}
                <span>{c.name}</span>
                <span
                  style={{
                    background: isActive ? '#FF6600' : count > 0 ? '#E2E8F0' : '#F1F5F9',
                    color: isActive ? '#fff' : count > 0 ? '#475569' : '#94A3B8',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategories Filter Chips (if selected category has subcategories) */}
        {selectedCategory !== 'all' && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #E2E8F0' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Subcategories under {activeCategoryObj?.name}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedSubcategory('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: selectedSubcategory === 'all' ? '700' : '500',
                  cursor: 'pointer',
                  border: selectedSubcategory === 'all' ? '1px solid #FF6600' : '1px solid #CBD5E1',
                  background: selectedSubcategory === 'all' ? '#FF6600' : '#FFFFFF',
                  color: selectedSubcategory === 'all' ? '#FFFFFF' : '#475569',
                }}
              >
                All ({categoryCounts[selectedCategory] || 0})
              </button>
              {subcategories
                .filter((s) => String(s.category_id) === selectedCategory)
                .map((sub) => {
                  const isSubActive = selectedSubcategory === sub.slug;
                  const subCount = products.filter(
                    (p) => String(p.category_id) === selectedCategory && (p.sub_category === sub.slug || p.sub_category === sub.name)
                  ).length;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubcategory(isSubActive ? 'all' : sub.slug)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: isSubActive ? '700' : '500',
                        cursor: 'pointer',
                        border: isSubActive ? '1px solid #FF6600' : '1px solid #CBD5E1',
                        background: isSubActive ? '#FF6600' : '#FFFFFF',
                        color: isSubActive ? '#FFFFFF' : '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>{sub.name}</span>
                      <span style={{ fontSize: '10px', opacity: 0.9 }}>({subCount})</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '95px' }}>ক্রম (Order)</th>
              <th>Image</th>
              <th>Product Title & SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Views (ভিউ)</th>
              <th>Stock</th>
              <th>Badge & Status</th>
              <th>Features</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>Loading catalog...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((p, pIndex) => (
                <tr key={p.id}>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', minWidth: '24px' }}>
                          #{p.sort_order || (currentPage - 1) * PAGE_SIZE + pIndex + 1}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            disabled={(currentPage === 1 && pIndex === 0) || reordering}
                            onClick={() => handleMoveProduct(pIndex, -1)}
                            title="Move Up (উপরে নিন)"
                            style={{
                              border: '1px solid #CBD5E1',
                              background: (currentPage === 1 && pIndex === 0) ? '#F1F5F9' : '#FFFFFF',
                              color: (currentPage === 1 && pIndex === 0) ? '#CBD5E1' : '#0F172A',
                              borderRadius: '3px',
                              padding: '1px 5px',
                              fontSize: '9px',
                              cursor: (currentPage === 1 && pIndex === 0) || reordering ? 'not-allowed' : 'pointer',
                              lineHeight: '1',
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={(currentPage === totalPages && pIndex === paginatedProducts.length - 1) || reordering}
                            onClick={() => handleMoveProduct(pIndex, 1)}
                            title="Move Down (নিচে নিন)"
                            style={{
                              border: '1px solid #CBD5E1',
                              background: (currentPage === totalPages && pIndex === paginatedProducts.length - 1) ? '#F1F5F9' : '#FFFFFF',
                              color: (currentPage === totalPages && pIndex === paginatedProducts.length - 1) ? '#CBD5E1' : '#0F172A',
                              borderRadius: '3px',
                              padding: '1px 5px',
                              fontSize: '9px',
                              cursor: (currentPage === totalPages && pIndex === paginatedProducts.length - 1) || reordering ? 'not-allowed' : 'pointer',
                              lineHeight: '1',
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={reordering || (p.sort_order === 1 && currentPage === 1 && pIndex === 0)}
                        onClick={() => handlePinToTop(p)}
                        title="সবার উপরে (১ নম্বরে) নিয়ে আসুন"
                        style={{
                          border: '1px solid #BFDBFE',
                          background: '#EFF6FF',
                          color: '#1D4ED8',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: reordering ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        📌 শীর্ষে
                      </button>
                    </div>
                  </td>
                  <td>
                    <img
                      src={p.image || '/logo.png'}
                      alt=""
                      style={{ width: '45px', height: '45px', objectFit: 'contain', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#0F172A' }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      SKU: <span style={{ fontWeight: '600' }}>{p.sku || 'N/A'}</span> • {p.brand}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{p.category_name || '-'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#FF6600', fontSize: '14px' }}>
                      ৳{Number(p.price).toLocaleString('en-US')}
                    </div>
                    {p.old_price && Number(p.old_price) > 0 && (
                      <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        ৳{Number(p.old_price).toLocaleString('en-US')}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Number(p.live_viewers) > 0 ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#DCFCE7',
                            border: '1px solid #86EFAC',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            color: '#15803D',
                            fontWeight: '800',
                            fontSize: '12px',
                            width: 'fit-content',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#22C55E',
                              boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.4)',
                              display: 'inline-block',
                            }}
                          ></span>
                          {p.live_viewers} জন দেখছেন
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: '#94A3B8',
                            fontWeight: '600',
                          }}
                        >
                          <i className="fa-solid fa-user-clock" style={{ fontSize: '10px' }}></i>
                          ০ জন লাইভ
                        </span>
                      )}
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                        <span title="Past 24 hours views" style={{ color: p.views_24h > 0 ? '#D97706' : '#64748B', fontWeight: p.views_24h > 0 ? '700' : '500' }}>
                          {p.views_24h || 0} 24h
                        </span>
                        {' • '}
                        <span title="Total all-time views">
                          {(Number(p.views) || 0).toLocaleString('en-US')} total
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: p.stock <= 0 ? '#EF4444' : '#10B981' }}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', background: '#F1F5F9', display: 'inline-block' }}>
                        {p.badge}
                      </span>
                      <span
                        style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: String(p.condition).toLowerCase() === 'old' ? '#FEF3C7' : '#DCFCE7',
                          color: String(p.condition).toLowerCase() === 'old' ? '#B45309' : '#15803D',
                          display: 'inline-block',
                        }}
                      >
                        {String(p.condition).toUpperCase() === 'OLD' ? 'Old' : 'New'}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: p.is_active === 0 ? '#EF4444' : '#10B981',
                        }}
                      >
                        {p.is_active === 0 ? '● Inactive' : '● Active'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={() => toggleStatus(p, 'is_featured')}
                        style={{
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          background: p.is_featured ? '#FEF3C7' : '#F1F5F9',
                          color: p.is_featured ? '#B45309' : '#94A3B8',
                        }}
                      >
                        ★ Featured: {p.is_featured ? 'ON' : 'OFF'}
                      </button>

                      <button
                        onClick={() => toggleStatus(p, 'is_bestseller')}
                        style={{
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          background: p.is_bestseller ? '#DCFCE7' : '#F1F5F9',
                          color: p.is_bestseller ? '#15803D' : '#94A3B8',
                        }}
                      >
                        🔥 Top Seller: {p.is_bestseller ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Product"
                        aria-label="Edit Product"
                        style={{ background: '#E2E8F0', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        title="Delete Product"
                        aria-label="Delete Product"
                        style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
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

        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', color: '#64748B' }}>
              Showing{' '}
              <strong style={{ color: '#0F172A' }}>
                {(currentPage - 1) * PAGE_SIZE + 1}
              </strong>{' '}
              to{' '}
              <strong style={{ color: '#0F172A' }}>
                {Math.min(currentPage * PAGE_SIZE, filteredProducts.length)}
              </strong>{' '}
              of{' '}
              <strong style={{ color: '#0F172A' }}>
                {filteredProducts.length}
              </strong>{' '}
              products
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                    color: currentPage === 1 ? '#94A3B8' : '#334155',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <i className="fa-solid fa-chevron-left" style={{ fontSize: '10px' }}></i> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 2
                    );
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push(-1 * idx);
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) => {
                    if (p < 0) {
                      return (
                        <span key={`sep-${idx}`} style={{ padding: '0 4px', color: '#94A3B8', fontSize: '12px' }}>
                          ...
                        </span>
                      );
                    }
                    const isCur = p === currentPage;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          minWidth: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: isCur ? '1px solid #FF6600' : '1px solid #CBD5E1',
                          background: isCur ? '#FF6600' : '#FFFFFF',
                          color: isCur ? '#FFFFFF' : '#334155',
                          fontSize: '12px',
                          fontWeight: isCur ? '700' : '500',
                          cursor: 'pointer',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                    color: currentPage === totalPages ? '#94A3B8' : '#334155',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  Next <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px' }}></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '92%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro Max"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Category *</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value, sub_category: '' })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Subcategory</label>
                  <select
                    value={form.sub_category || ''}
                    onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  >
                    <option value="">None</option>
                    {subcategories
                      .filter((s) => Number(s.category_id) === Number(form.category_id))
                      .map((s) => (
                        <option key={s.id} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>SKU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. JWL-8921"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Brand Name</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Selling Price (৳) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1200"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Regular Price (৳)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={form.old_price}
                    onChange={(e) => setForm({ ...form, old_price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Stock Units</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Badge Label</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  >
                    <option value="">None (No Badge)</option>
                    <option value="Flash Sale">⚡ Flash Sale</option>
                    <option value="New">New</option>
                    <option value="Hot">Hot</option>
                    <option value="Sale">Sale</option>
                    <option value="Offer">Offer</option>
                    <option value="Stock Out">Stock Out</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#FF6600' }}>
                    Condition (Old / New) *
                  </label>
                  <select
                    value={form.condition || 'New'}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #FF6600', fontWeight: '700' }}
                  >
                    <option value="New">New (Brand New)</option>
                    <option value="Old">Old (Used / Pre-owned)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>
                    Sort Order / ক্রম (১ = সবার উপরে)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.sort_order || ''}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              {/* DUAL IMAGE UPLOAD SYSTEM: 1. Device (File/Camera) & 2. Link (URL) */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    Product Main Image *
                  </label>
                  
                  {/* Mode Switcher Tabs */}
                  <div style={{ display: 'inline-flex', background: '#E2E8F0', padding: '3px', borderRadius: '8px', gap: '3px' }}>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('device')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: imageSourceType === 'device' ? '#FF6600' : 'transparent',
                        color: imageSourceType === 'device' ? '#FFFFFF' : '#475569',
                        boxShadow: imageSourceType === 'device' ? '0 2px 6px rgba(255, 102, 0, 0.3)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-mobile-screen-button"></i> 1. Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceType('link')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: imageSourceType === 'link' ? '#FF6600' : 'transparent',
                        color: imageSourceType === 'link' ? '#FFFFFF' : '#475569',
                        boxShadow: imageSourceType === 'link' ? '0 2px 6px rgba(255, 102, 0, 0.3)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-link"></i> 2. Image Web Link
                    </button>
                  </div>
                </div>

                {/* Tab 1: Upload from Device */}
                {imageSourceType === 'device' ? (
                  <div>
                    <input
                      type="file"
                      id="main-device-image-input"
                      accept="image/*"
                      onChange={handleDeviceImageUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="main-device-image-input"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '24px 16px',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '32px', color: '#FF6600' }}></i>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', display: 'block' }}>
                          {isUploading ? 'Optimizing image...' : 'Choose image from device / gallery'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          Select from gallery, camera, or files (JPG, PNG, WebP)
                        </span>
                      </div>
                    </label>
                  </div>
                ) : (
                  /* Tab 2: Paste Web Link */
                  <div>
                    <input
                      type="text"
                      placeholder="https://example.com/product-image.jpg"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                      Paste any public web image URL.
                    </span>
                  </div>
                )}

                {/* Main Image Live Preview */}
                {form.image && form.image !== '/logo.png' && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#FFFFFF', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <img
                      src={form.image}
                      alt="Product Preview"
                      style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <span style={{ fontWeight: '700', color: '#16A34A', fontSize: '12px', display: 'block' }}>
                        ✓ Image Selected Successfully
                      </span>
                      <span style={{ color: '#64748B', fontSize: '11px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', display: 'block' }}>
                        {form.image.startsWith('data:') ? 'Uploaded from Device' : form.image}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '/logo.png' })}
                      style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Images with Device & Link support */}
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                    Additional Gallery Images (Optional)
                  </label>
                  <label
                    htmlFor="gallery-device-input"
                    style={{
                      background: '#FF6600',
                      color: '#FFFFFF',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <i className="fa-solid fa-camera"></i> Add from Device
                  </label>
                  <input
                    type="file"
                    id="gallery-device-input"
                    multiple
                    accept="image/*"
                    onChange={handleDeviceGalleryUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Or enter comma-separated URLs: https://img1.jpg, https://img2.jpg"
                  value={typeof form.gallery_images === 'string' && form.gallery_images.startsWith('[') ? '' : form.gallery_images}
                  onChange={(e) => setForm({ ...form, gallery_images: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '8px' }}
                />

                {/* Gallery Live Thumbnails List */}
                {(() => {
                  let list = [];
                  try {
                    if (typeof form.gallery_images === 'string' && form.gallery_images.startsWith('[')) {
                      list = JSON.parse(form.gallery_images);
                    } else if (typeof form.gallery_images === 'string' && form.gallery_images.trim() !== '') {
                      list = form.gallery_images.split(',').map(s => s.trim()).filter(Boolean);
                    } else if (Array.isArray(form.gallery_images)) {
                      list = form.gallery_images;
                    }
                  } catch (e) {
                    list = [];
                  }

                  if (list.length === 0) return null;

                  return (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {list.map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #CBD5E1', background: '#FFFFFF' }}>
                          <img src={imgUrl} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Warranty, Colors, Sizes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Warranty Info</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Year Official Warranty"
                    value={form.warranty}
                    onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Colors Available</label>
                  <input
                    type="text"
                    placeholder="e.g. Black, Silver, Navy Blue"
                    value={form.colors}
                    onChange={(e) => setForm({ ...form, colors: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Sizes / Variants</label>
                  <input
                    type="text"
                    placeholder="e.g. 40mm, 44mm / Free Size"
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Key Features Bullet Points */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>
                  Key Features / Specifications (এক লাইন করে লিখুন)
                </label>
                <textarea
                  rows="3"
                  placeholder={"প্রতি লাইনে একটি করে বৈশিষ্ট্য লিখুন, যেমন:\nBluetooth 5.3\nUp to 40 Hours Battery Life\nActive Noise Cancellation\nErgonomic Comfortable Fit"}
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', resize: 'vertical' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                  প্রোডাক্ট ডিটেইল পেজে এই বৈশিষ্ট্যগুলো সরাসরি টিকমার্ক ও আইকনসহ প্রদর্শিত হবে।
                </span>
              </div>

              {/* Ratings & Reviews Count */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Initial Rating (★ 1.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.8"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Reviews Count (সংখ্যা)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={form.reviews_count}
                    onChange={(e) => setForm({ ...form, reviews_count: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Short Description (সংক্ষিপ্ত এক লাইনের বিবরণ)</label>
                <input
                  type="text"
                  placeholder="e.g. Flagship performance with official warranty & fast delivery."
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '4px', color: '#0F172A' }}>Full Description & Details (বিস্তারিত বিবরণ)</label>
                <textarea
                  rows="3"
                  placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত তথ্য লিখুন..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  <span>Featured Product</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={form.is_bestseller}
                    onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
                  />
                  <span>Top Seller</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                  />
                  <span>New Arrival</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span>Active (Visible Online)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#FF6600', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 20px', borderRadius: '8px', background: '#E2E8F0', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
