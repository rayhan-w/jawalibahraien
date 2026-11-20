'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function AdminSubcategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentFilter, setSelectedParentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reordering, setReordering] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSubcategory, setEditSubcategory] = useState(null);
  const [subForm, setSubForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    sort_order: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, subRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/categories/sub'),
        fetch('/api/products?all=1'),
      ]);
      const catJson = await catRes.json();
      const subJson = await subRes.json();
      const prodJson = await prodRes.json();

      if (catJson.success) setCategories(catJson.data || []);
      if (subJson.success) {
        const sorted = (subJson.data || []).sort((a, b) => {
          if (Number(a.category_id) !== Number(b.category_id)) {
            return Number(a.category_id) - Number(b.category_id);
          }
          return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id);
        });
        setSubcategories(sorted);
      }
      if (prodJson.success) setProducts(prodJson.data || []);
    } catch (e) {
      console.error(e);
      alert('তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (defaultCatId = null) => {
    const parentId = defaultCatId || (categories.length > 0 ? categories[0].id : '');
    setEditSubcategory(null);
    setSubForm({
      name: '',
      slug: '',
      category_id: parentId,
      sort_order: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditSubcategory(sub);
    setSubForm({
      name: sub.name,
      slug: sub.slug,
      category_id: sub.category_id,
      sort_order: sub.sort_order !== undefined && sub.sort_order !== null ? String(sub.sort_order) : '',
      id: sub.id,
    });
    setIsModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    try {
      const parentId = parseInt(subForm.category_id, 10);
      if (!parentId) {
        alert('অনুগ্রহ করে প্যারেন্ট ক্যাটাগরি সিলেক্ট করুন।');
        return;
      }
      const method = editSubcategory ? 'PUT' : 'POST';
      const res = await fetch('/api/categories/sub', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subForm,
          category_id: parentId,
          sort_order: subForm.sort_order !== '' ? parseInt(subForm.sort_order, 10) : undefined,
          id: editSubcategory?.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        loadData();
      } else {
        alert(json.message || 'সাব-ক্যাটাগরি অপারেশন ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      alert('সার্ভার সমস্যা হয়েছে।');
    }
  };

  // Reorder strictly within the parent category
  const handleMoveSubcategory = async (categoryId, indexInCat, direction) => {
    // 1. Get current subcategories of this category sorted by sort_order
    const catSubs = subcategories
      .filter((s) => Number(s.category_id) === Number(categoryId))
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id));

    const targetIndex = indexInCat + direction;
    if (targetIndex < 0 || targetIndex >= catSubs.length) return;

    // 2. Physically swap adjacent items in that category's array
    const newCatSubs = [...catSubs];
    const temp = newCatSubs[indexInCat];
    newCatSubs[indexInCat] = newCatSubs[targetIndex];
    newCatSubs[targetIndex] = temp;

    // 3. Assign 1..N sort_order to newCatSubs
    const updatedWithOrder = newCatSubs.map((sub, i) => ({
      ...sub,
      sort_order: i + 1,
    }));

    // 4. Update global subcategories array with the newly ordered items
    const updatedMap = new Map(updatedWithOrder.map((item) => [item.id, item]));
    const newSubcategories = subcategories
      .map((s) => (updatedMap.has(s.id) ? updatedMap.get(s.id) : s))
      .sort((a, b) => {
        if (Number(a.category_id) !== Number(b.category_id)) {
          return Number(a.category_id) - Number(b.category_id);
        }
        return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id);
      });

    // Optimistic update
    setSubcategories(newSubcategories);
    setReordering(true);

    try {
      const payload = updatedWithOrder.map((sub) => ({
        id: sub.id,
        sort_order: sub.sort_order,
      }));

      const res = await fetch('/api/categories/sub/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId, items: payload }),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.message || 'সাব-ক্যাটাগরির ক্রম সংরক্ষণ ব্যর্থ হয়েছে।');
        loadData();
      }
    } catch (err) {
      alert('সাব-ক্যাটাগরির ক্রম পরিবর্তন করতে সমস্যা হয়েছে।');
      loadData();
    } finally {
      setReordering(false);
    }
  };

  const handleDeleteSubcategory = async (subId) => {
    if (!confirm('আপনি কি নিশ্চিত এই সাব-ক্যাটাগরি মুছে ফেলতে চান? এতে যুক্ত থাকা প্রোডাক্টগুলোর ক্যাটাগরি ঠিক থাকবে, শুধু সাব-ক্যাটাগরি রিমুভ হবে।')) return;
    try {
      const res = await fetch(`/api/categories/sub?id=${subId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.message || 'সাব-ক্যাটাগরি মুছে ফেলা যায়নি।');
      }
    } catch (err) {
      alert('সার্ভার সমস্যা হয়েছে।');
    }
  };

  // Grouped by Category with search filtering
  const groupedCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (selectedParentFilter !== 'all' && String(cat.id) !== String(selectedParentFilter)) {
          return false;
        }
        return true;
      })
      .map((cat) => {
        const catSubs = subcategories
          .filter((s) => Number(s.category_id) === Number(cat.id))
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id));
        const filteredSubs = catSubs.filter((sub) => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase().trim();
          const matchesName = sub.name && sub.name.toLowerCase().includes(q);
          const matchesSlug = sub.slug && sub.slug.toLowerCase().includes(q);
          const matchesParent = cat.name && cat.name.toLowerCase().includes(q);
          return matchesName || matchesSlug || matchesParent;
        });

        return {
          category: cat,
          subcategories: filteredSubs,
          totalCount: catSubs.length,
        };
      })
      .filter((group) => {
        if (searchQuery.trim()) {
          return group.subcategories.length > 0;
        }
        return true;
      });
  }, [categories, subcategories, selectedParentFilter, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return groupedCategories.reduce((acc, g) => acc + g.subcategories.length, 0);
  }, [groupedCategories]);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link href="/admin/categories" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>
              Categories
            </Link>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '10px', color: '#94A3B8' }}></i>
            <span style={{ fontSize: '13px', color: '#FF6600', fontWeight: '700' }}>Subcategories</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Subcategories Management (সাব-ক্যাটাগরি ব্যবস্থাপনা)
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            প্রতিটি ক্যাটাগরির নিজস্ব সাব-ক্যাটাগরি গ্রুপ অনুযায়ী সাজানো রয়েছে। প্রতিটি গ্রুপের ভেতরে ▲ বাটন দিয়ে খুব সহজে ওপর-নিচ করতে পারবেন।
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => openAddModal(selectedParentFilter !== 'all' ? selectedParentFilter : null)}
            style={{
              padding: '11px 22px',
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
              boxShadow: '0 3px 12px rgba(255,102,0,0.25)',
            }}
          >
            <i className="fa-solid fa-plus"></i> + Add New Subcategory
          </button>
        </div>
      </div>

      {/* Filter and Quick Category Pills Bar */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px 20px', marginBottom: '22px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E293B' }}>
              ক্যাটাগরি ফিল্টার:
            </span>
            <select
              value={selectedParentFilter}
              onChange={(e) => setSelectedParentFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                background: '#fff',
                outline: 'none',
                minWidth: '220px',
                fontWeight: '600',
                color: '#0F172A',
              }}
            >
              <option value="all">সব ক্যাটাগরি একসাথে ({categories.length} টি)</option>
              {categories.map((c) => {
                const count = subcategories.filter((s) => Number(s.category_id) === Number(c.id)).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} subs)
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '10px', color: '#94A3B8', fontSize: '13px' }}></i>
            <input
              type="text"
              placeholder="সাব-ক্যাটাগরি খুঁজুন (যেমন: iPhone, iPad)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Category Quick Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setSelectedParentFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedParentFilter === 'all' ? '1px solid #FF6600' : '1px solid #E2E8F0',
              background: selectedParentFilter === 'all' ? '#FFF7ED' : '#F8FAFC',
              color: selectedParentFilter === 'all' ? '#FF6600' : '#475569',
              fontSize: '12px',
              fontWeight: selectedParentFilter === 'all' ? '700' : '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>সব ক্যাটাগরি</span>
            <span style={{ fontSize: '11px', background: selectedParentFilter === 'all' ? '#FF6600' : '#CBD5E1', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>
              {subcategories.length}
            </span>
          </button>

          {categories.map((c) => {
            const count = subcategories.filter((s) => Number(s.category_id) === Number(c.id)).length;
            const isSelected = String(selectedParentFilter) === String(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedParentFilter(isSelected ? 'all' : String(c.id))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid #FF6600' : '1px solid #E2E8F0',
                  background: isSelected ? '#FFF7ED' : '#F8FAFC',
                  color: isSelected ? '#FF6600' : '#475569',
                  fontSize: '12px',
                  fontWeight: isSelected ? '700' : '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className={`fa-solid ${c.icon || 'fa-folder'}`} style={{ fontSize: '11px' }}></i>
                <span>{c.name}</span>
                <span style={{ fontSize: '11px', background: isSelected ? '#FF6600' : '#CBD5E1', color: '#fff', padding: '1px 6px', borderRadius: '10px' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content: Category-Grouped Sections */}
      {loading ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px', textAlign: 'center', color: '#64748B' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '24px', color: '#FF6600', marginBottom: '10px', display: 'block' }}></i>
          সাব-ক্যাটাগরি ডাটা লোড হচ্ছে...
        </div>
      ) : groupedCategories.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px', color: '#CBD5E1' }}>
            <i className="fa-solid fa-folder-open"></i>
          </div>
          <p style={{ fontWeight: '600', marginBottom: '12px' }}>কোনো সাব-ক্যাটাগরি পাওয়া যায়নি।</p>
          <button
            onClick={() => openAddModal()}
            style={{
              padding: '8px 16px',
              background: '#FF6600',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            + নতুন সাব-ক্যাটাগরি যুক্ত করুন
          </button>
        </div>
      ) : (
        groupedCategories.map(({ category: c, subcategories: catSubs, totalCount }) => (
          <div
            key={c.id}
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
              boxShadow: '0 3px 12px rgba(0,0,0,0.02)',
              overflow: 'hidden',
            }}
          >
            {/* Category Card Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#FFF7ED',
                    color: '#FF6600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  <i className={`fa-solid ${c.icon || 'fa-folder'}`}></i>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                      {c.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: '#FFEDD5',
                        color: '#C2410C',
                      }}
                    >
                      {totalCount}টি সাব-ক্যাটাগরি
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Slug: /{c.slug}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => openAddModal(c.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    background: '#FF6600',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-plus"></i> + Add to {c.name}
                </button>
              </div>
            </div>

            {/* Subcategories Table for this category */}
            {catSubs.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                এই ক্যাটাগরিতে এখনো কোনো সাব-ক্যাটাগরি যুক্ত করা হয়নি।
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table" style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#FFFFFF' }}>
                      <th style={{ width: '90px', textAlign: 'center' }}>ক্রম (Order)</th>
                      <th style={{ width: '240px' }}>Subcategory Name</th>
                      <th style={{ width: '200px' }}>Slug (URL Identifier)</th>
                      <th style={{ width: '130px' }}>Products Count</th>
                      <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catSubs.map((sub, index) => {
                      const productCount = products.filter(
                        (p) => Number(p.category_id) === Number(c.id) && (p.sub_category === sub.slug || p.sub_category === sub.name)
                      ).length;

                      return (
                        <tr key={sub.id}>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', minWidth: '24px' }}>
                                #{index + 1}
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <button
                                  type="button"
                                  disabled={index === 0 || reordering}
                                  onClick={() => handleMoveSubcategory(c.id, index, -1)}
                                  title="উপরে নিন (Move Up)"
                                  aria-label="Move Up"
                                  style={{
                                    border: '1px solid #CBD5E1',
                                    background: index === 0 ? '#F1F5F9' : '#FFFFFF',
                                    color: index === 0 ? '#CBD5E1' : '#0F172A',
                                    borderRadius: '4px',
                                    padding: '1px 5px',
                                    fontSize: '10px',
                                    cursor: index === 0 || reordering ? 'not-allowed' : 'pointer',
                                    lineHeight: '1',
                                  }}
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={index === catSubs.length - 1 || reordering}
                                  onClick={() => handleMoveSubcategory(c.id, index, 1)}
                                  title="নিচে নিন (Move Down)"
                                  aria-label="Move Down"
                                  style={{
                                    border: '1px solid #CBD5E1',
                                    background: index === catSubs.length - 1 ? '#F1F5F9' : '#FFFFFF',
                                    color: index === catSubs.length - 1 ? '#CBD5E1' : '#0F172A',
                                    borderRadius: '4px',
                                    padding: '1px 5px',
                                    fontSize: '10px',
                                    cursor: index === catSubs.length - 1 || reordering ? 'not-allowed' : 'pointer',
                                    lineHeight: '1',
                                  }}
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{sub.name}</div>
                          </td>
                          <td>
                            <code style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', color: '#475569' }}>
                              /{sub.slug}
                            </code>
                          </td>
                          <td>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: productCount > 0 ? '#0F172A' : '#94A3B8' }}>
                              {productCount} items
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => openEditModal(sub)}
                                title="Edit Subcategory"
                                style={{ background: '#E2E8F0', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                title="Delete Subcategory"
                                style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
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
        ))
      )}

      {/* Add / Edit Subcategory Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: '460px', background: '#fff', borderRadius: '16px', padding: '26px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                  {editSubcategory ? 'Edit Subcategory' : 'Add New Subcategory (নতুন সাব-ক্যাটাগরি)'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  ক্যাটাগরি সিলেক্ট করুন ও সাব-ক্যাটাগরির নাম দিন
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#1E293B' }}>
                  Parent Category * (মূল ক্যাটাগরি)
                </label>
                <select
                  value={subForm.category_id}
                  onChange={(e) => setSubForm({ ...subForm, category_id: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#fff' }}
                >
                  <option value="" disabled>-- মূল ক্যাটাগরি সিলেক্ট করুন --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#1E293B' }}>
                  Subcategory Name * (সাব-ক্যাটাগরির নাম)
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: iPhone, Samsung, Earbuds"
                  value={subForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSlug = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
                    setSubForm({
                      ...subForm,
                      name,
                      slug: editSubcategory ? subForm.slug : autoSlug,
                    });
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#1E293B' }}>
                  Subcategory Slug * (URL Identifier)
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: iphone, samsung"
                  value={subForm.slug}
                  onChange={(e) => setSubForm({ ...subForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', display: 'block' }}>
                  এই ক্যাটাগরির অধীনে স্লাগটি ইউনিক হতে হবে।
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: '#1E293B' }}>
                  Sort Order (ক্রম নম্বর)
                </label>
                <input
                  type="number"
                  placeholder="যেমন: ১, ২, ৩ (ফাঁকা রাখলে গ্রুপের শেষে বসবে)"
                  value={subForm.sort_order}
                  onChange={(e) => setSubForm({ ...subForm, sort_order: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', display: 'block' }}>
                  ছোট সংখ্যা আগে দেখাবে। কার্ডের ভেতরে ▲ বা ▼ বাটনে ক্লিক করেও খুব সহজে ওপর-নিচ করা যায়।
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#FF6600', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
                >
                  {editSubcategory ? 'Update Subcategory' : 'Save Subcategory'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px 18px', borderRadius: '8px', background: '#E2E8F0', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
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
