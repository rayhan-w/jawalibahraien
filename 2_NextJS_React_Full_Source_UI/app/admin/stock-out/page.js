'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StockOutProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [restockQuantities, setRestockQuantities] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState('');

  // Edit Modal State
  const [editProduct, setEditProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category_id: '',
    sub_category: '',
    sku: '',
    brand: 'Jawali',
    price: '',
    old_price: '',
    stock: '10',
    badge: 'New',
    condition: 'New',
    image: '/logo.png',
    gallery_images: '',
    description: '',
    is_featured: false,
    is_bestseller: false,
    is_new: true,
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?all=1'),
        fetch('/api/categories'),
      ]);
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (prodJson.success && Array.isArray(prodJson.data)) {
        // Filter ONLY products whose stock <= 0 (derived strictly from stock)
        const stockOutList = prodJson.data.filter(
          (p) => Number(p.stock ?? 0) <= 0
        );
        setProducts(stockOutList);
      }
      if (catJson.success) {
        setCategories(catJson.data || []);
      }
    } catch (e) {
      console.error('Failed to load stock-out products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestockQtyChange = (productId, val) => {
    setRestockQuantities((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  // Quick Restock Action: Instantly update stock in DB > 0
  const handleQuickRestock = async (product) => {
    const qtyVal = parseInt(restockQuantities[product.id] || 10, 10);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      alert('Please enter a valid restock quantity greater than 0.');
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [product.id]: true }));
      const newBadge = product.badge === 'Stock Out' ? 'New' : product.badge;

      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: qtyVal,
          badge: newBadge,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage(`Successfully restocked "${product.title}" with ${qtyVal} units!`);
        setTimeout(() => setMessage(''), 3500);
        // Reload data: will automatically remove product from stock-out list
        loadData();
      } else {
        alert(json.message || 'Failed to restock product.');
      }
    } catch (err) {
      alert('Network error while restocking.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const openEditModal = (p) => {
    setEditProduct(p);
    setForm({
      title: p.title || '',
      category_id: p.category_id || '',
      sub_category: p.sub_category || '',
      sku: p.sku || '',
      brand: p.brand || 'Jawali',
      price: p.price || '',
      old_price: p.old_price || '',
      stock: String(p.stock ?? 0),
      badge: p.badge === 'Stock Out' ? 'New' : (p.badge || 'New'),
      condition: p.condition || 'New',
      image: p.image || '/logo.png',
      gallery_images: p.gallery_images
        ? typeof p.gallery_images === 'string'
          ? p.gallery_images
          : JSON.stringify(p.gallery_images)
        : '',
      description: p.description || '',
      is_featured: Boolean(p.is_featured),
      is_bestseller: Boolean(p.is_bestseller),
      is_new: Boolean(p.is_new !== 0),
      is_active: Boolean(p.is_active !== 0),
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProduct) return;

    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setMessage(`Product "${form.title}" updated successfully!`);
        setTimeout(() => setMessage(''), 3500);
        loadData();
      } else {
        alert(json.message || 'Update failed');
      }
    } catch (err) {
      alert('Error updating product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#FEE2E2',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                Stock Out Products
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Separate inventory section for out-of-stock items (Stock ≤ 0). Restocking immediately activates them on the storefront.
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadData}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#fff',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
          <Link
            href="/admin/products"
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: '#0F172A',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-box-archive"></i> Regular Products List
          </Link>
        </div>
      </div>

      {/* Success notification banner */}
      {message && (
        <div
          style={{
            background: '#D1FAE5',
            color: '#065F46',
            padding: '12px 18px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <i className="fa-solid fa-circle-check"></i>
          <span>{message}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '25px',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Total Stock Out Items
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#DC2626' }}>
              {products.length}
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
              Storefront Protection
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>
              <i className="fa-solid fa-check"></i> Customers cannot purchase these
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table Box */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
            ></i>
            <input
              type="text"
              placeholder="Search stock out products by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '28px', color: '#FF6600', marginBottom: '10px' }}></i>
            <p>Loading stock out products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                marginBottom: '15px',
              }}
            >
              <i className="fa-solid fa-check"></i>
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0F172A' }}>
              {products.length === 0 ? 'All products are currently well-stocked!' : 'No matching products found'}
            </h4>
            <p style={{ margin: 0, fontSize: '13px' }}>
              {products.length === 0
                ? 'No items currently have zero or negative stock. When a product runs out of stock, it will automatically appear here.'
                : 'Try adjusting your search terms.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B', fontWeight: '700' }}>
                  <th style={{ padding: '12px 14px' }}>Product</th>
                  <th style={{ padding: '12px 14px' }}>Category / SKU</th>
                  <th style={{ padding: '12px 14px' }}>Price</th>
                  <th style={{ padding: '12px 14px' }}>Stock Status</th>
                  <th style={{ padding: '12px 14px' }}>Quick Restock Action</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const defaultQty = restockQuantities[p.id] !== undefined ? restockQuantities[p.id] : 10;
                  const isUpdating = actionLoading[p.id];

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.2s',
                      }}
                    >
                      {/* Product Thumbnail & Name */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image || '/logo.png'}
                            alt={p.title}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1px solid #E2E8F0',
                              background: '#F8FAFC',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>
                              {p.title}
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              ID: #{p.id} {p.brand ? `• ${p.brand}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & SKU */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600', color: '#334155' }}>
                          {p.category_name || 'Uncategorized'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                          SKU: {p.sku || 'N/A'}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px', fontWeight: '700', color: '#FF6600', fontSize: '14px' }}>
                        ৳{Number(p.price).toLocaleString('en-US')}
                      </td>

                      {/* Stock Status */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#FEE2E2',
                            color: '#B91C1C',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontWeight: '700',
                            fontSize: '11px',
                          }}
                        >
                          <i className="fa-solid fa-circle-xmark"></i>
                          <span>0 In Stock (Out of Stock)</span>
                        </span>
                      </td>

                      {/* Quick Restock Input & Button */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number"
                            min="1"
                            max="9999"
                            value={defaultQty}
                            onChange={(e) => handleRestockQtyChange(p.id, e.target.value)}
                            style={{
                              width: '70px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              fontSize: '13px',
                              textAlign: 'center',
                              fontWeight: '600',
                            }}
                          />
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleQuickRestock(p)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              background: '#059669',
                              color: '#fff',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s',
                            }}
                          >
                            {isUpdating ? (
                              <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa-solid fa-plus"></i>
                            )}
                            Restock
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            title="Edit Product Details"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              background: '#fff',
                              color: '#334155',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className="fa-solid fa-pen"></i> Edit
                          </button>
                          <a
                            href={`/product/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Storefront"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              background: '#F8FAFC',
                              color: '#64748B',
                              textDecoration: 'none',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square"></i>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                Edit & Restock Product
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Product Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Regular Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Stock Quantity (Restock)</label>
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="Enter new stock (e.g. 15)"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '2px solid #FF6600',
                      fontSize: '14px',
                      fontWeight: '700',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#059669', marginTop: '4px', display: 'block' }}>
                    Setting stock &gt; 0 will automatically move this item back to active stock!
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Category</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>SKU Code</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#FF6600', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
