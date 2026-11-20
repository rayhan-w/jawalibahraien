'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', slug: '', icon: 'fa-box' });

  // Subcategory Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeParentCat, setActiveParentCat] = useState(null);
  const [editSubcategory, setEditSubcategory] = useState(null);
  const [subForm, setSubForm] = useState({ name: '', slug: '', category_id: '' });

  const loadData = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/categories/sub'),
      ]);

      const catJson = await catRes.json();
      const subJson = await subRes.json();

      if (catJson.success) setCategories(catJson.data || []);
      if (subJson.success) {
        const sortedSubs = (subJson.data || []).sort((a, b) => {
          if (Number(a.category_id) !== Number(b.category_id)) {
            return Number(a.category_id) - Number(b.category_id);
          }
          return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id);
        });
        setSubcategories(sortedSubs);
      }
    } catch (e) {
      console.error('Error loading category data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Category Actions
  const openAddCategory = () => {
    setEditCategory(null);
    setCatForm({ name: '', slug: '', icon: 'fa-box' });
    setIsCatModalOpen(true);
  };

  const openEditCategory = (c) => {
    setEditCategory(c);
    setCatForm({ name: c.name, slug: c.slug, icon: c.icon || 'fa-box' });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editCategory ? `/api/categories/${editCategory.id}` : '/api/categories';
      const method = editCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsCatModalOpen(false);
        loadData();
      } else {
        alert(json.message || 'Operation failed');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.message || 'Failed to delete category');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleMoveCategory = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);

    // Optimistically update state
    setCategories(newCategories);
    setReordering(true);

    try {
      const payload = newCategories.map((c, i) => ({
        id: c.id,
        sort_order: i + 1,
      }));

      const res = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.message || 'Failed to save new order');
        loadData();
      }
    } catch (err) {
      alert('Error updating category order');
      loadData();
    } finally {
      setReordering(false);
    }
  };

  // Subcategory Actions
  const openAddSubcategory = (category = null) => {
    const parent = category || (categories.length > 0 ? categories[0] : null);
    setActiveParentCat(parent);
    setEditSubcategory(null);
    setSubForm({ name: '', slug: '', category_id: parent ? parent.id : '', sort_order: '' });
    setIsSubModalOpen(true);
  };

  const openEditSubcategory = (category, sub) => {
    setActiveParentCat(category);
    setEditSubcategory(sub);
    setSubForm({
      name: sub.name,
      slug: sub.slug,
      category_id: category.id,
      sort_order: sub.sort_order !== undefined && sub.sort_order !== null ? String(sub.sort_order) : '',
      id: sub.id,
    });
    setIsSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    try {
      const parentId = parseInt(subForm.category_id || activeParentCat?.id, 10);
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
        setIsSubModalOpen(false);
        loadData();
      } else {
        alert(json.message || 'Subcategory operation failed');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  const handleMoveSubcategory = async (sub, direction) => {
    // 1. Get subcategories of this category, sorted by sort_order
    const catSubs = subcategories
      .filter((s) => Number(s.category_id) === Number(sub.category_id))
      .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id));

    const currentIndex = catSubs.findIndex((s) => Number(s.id) === Number(sub.id));
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= catSubs.length) return;

    // 2. Physically swap adjacent items
    const newCatSubs = [...catSubs];
    const temp = newCatSubs[currentIndex];
    newCatSubs[currentIndex] = newCatSubs[targetIndex];
    newCatSubs[targetIndex] = temp;

    // 3. Assign 1..N sort_order
    const updatedWithOrder = newCatSubs.map((s, i) => ({
      ...s,
      sort_order: i + 1,
    }));

    // 4. Update global subcategories array with the new items sorted
    const updatedMap = new Map(updatedWithOrder.map((s) => [s.id, s]));
    const newSubcategories = subcategories
      .map((s) => (updatedMap.has(s.id) ? updatedMap.get(s.id) : s))
      .sort((a, b) => {
        if (Number(a.category_id) !== Number(b.category_id)) {
          return Number(a.category_id) - Number(b.category_id);
        }
        return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id);
      });

    setSubcategories(newSubcategories);
    setReordering(true);

    try {
      const payload = updatedWithOrder.map((s) => ({
        id: s.id,
        sort_order: s.sort_order,
      }));

      const res = await fetch('/api/categories/sub/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: sub.category_id, items: payload }),
      });

      const json = await res.json();
      if (!json.success) {
        alert(json.message || 'Failed to save subcategory order');
        loadData();
      }
    } catch (err) {
      alert('Error updating subcategory order');
      loadData();
    } finally {
      setReordering(false);
    }
  };

  const handleDeleteSubCategory = async (subId) => {
    if (!confirm('Are you sure you want to delete this subcategory? Associated products will retain their category and their subcategory will be set to None.')) return;
    try {
      const res = await fetch(`/api/categories/sub?id=${subId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        loadData();
      } else {
        alert(json.message || 'Failed to delete subcategory');
      }
    } catch (err) {
      alert('Server error occurred');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Categories & Subcategories
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Organize and manage parent categories and their nested subcategories
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => openAddSubcategory(null)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: '#0F172A',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(15,23,42,0.15)',
            }}
          >
            <i className="fa-solid fa-folder-plus"></i> + Add Subcategory
          </button>
          <button
            onClick={openAddCategory}
            style={{
              padding: '10px 18px',
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
            <i className="fa-solid fa-plus"></i> + Add New Category
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#0F172A' }}>
            All Categories ({categories.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Order</th>
                <th style={{ width: '60px' }}>Icon</th>
                <th style={{ width: '220px' }}>Category</th>
                <th>Subcategories (Nested)</th>
                <th style={{ width: '130px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading categories...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    No categories created yet.
                  </td>
                </tr>
              ) : (
                categories.map((c, index) => {
                  const catSubs = subcategories
                    .filter((s) => Number(s.category_id) === Number(c.id))
                    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id));

                  return (
                    <tr key={c.id}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', minWidth: '24px' }}>
                            #{index + 1}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              type="button"
                              disabled={index === 0 || reordering}
                              onClick={() => handleMoveCategory(index, -1)}
                              title="Move Up"
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
                              disabled={index === categories.length - 1 || reordering}
                              onClick={() => handleMoveCategory(index, 1)}
                              title="Move Down"
                              style={{
                                border: '1px solid #CBD5E1',
                                background: index === categories.length - 1 ? '#F1F5F9' : '#FFFFFF',
                                color: index === categories.length - 1 ? '#CBD5E1' : '#0F172A',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                fontSize: '10px',
                                cursor: index === categories.length - 1 || reordering ? 'not-allowed' : 'pointer',
                                lineHeight: '1',
                              }}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: '#FFF7ED',
                            color: '#FF6600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                          }}
                        >
                          <i className={`fa-solid ${c.icon || 'fa-box'}`}></i>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>{c.name}</div>
                        <div style={{ color: '#64748B', fontSize: '12px' }}>/{c.slug}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          {catSubs.length === 0 ? (
                            <span style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                              No subcategories
                            </span>
                          ) : (
                            catSubs.map((sub, subIndex) => (
                              <div
                                key={sub.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  background: '#F1F5F9',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                }}
                              >
                                <span style={{ fontSize: '10px', fontWeight: '800', color: '#FF6600', background: '#FFF7ED', padding: '1px 5px', borderRadius: '10px' }}>
                                  #{subIndex + 1}
                                </span>
                                <span style={{ fontWeight: '600', color: '#1E293B' }}>{sub.name}</span>
                                <span style={{ color: '#64748B', fontSize: '11px' }}>({sub.slug})</span>

                                {/* Reorder Buttons right inside the badge */}
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#E2E8F0', borderRadius: '4px', padding: '1px 3px' }}>
                                  <button
                                    type="button"
                                    disabled={subIndex === 0 || reordering}
                                    onClick={() => handleMoveSubcategory(sub, -1)}
                                    title="আগে নিন (Move Left)"
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      color: subIndex === 0 ? '#94A3B8' : '#0F172A',
                                      cursor: subIndex === 0 || reordering ? 'not-allowed' : 'pointer',
                                      padding: '0 2px',
                                      fontSize: '9px',
                                      lineHeight: '1',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    ◀
                                  </button>
                                  <button
                                    type="button"
                                    disabled={subIndex === catSubs.length - 1 || reordering}
                                    onClick={() => handleMoveSubcategory(sub, 1)}
                                    title="পরে নিন (Move Right)"
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      color: subIndex === catSubs.length - 1 ? '#94A3B8' : '#0F172A',
                                      cursor: subIndex === catSubs.length - 1 || reordering ? 'not-allowed' : 'pointer',
                                      padding: '0 2px',
                                      fontSize: '9px',
                                      lineHeight: '1',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    ▶
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openEditSubcategory(c, sub)}
                                  title="Edit Subcategory"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    fontSize: '11px',
                                  }}
                                >
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubCategory(sub.id)}
                                  title="Delete Subcategory"
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#EF4444',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    fontSize: '11px',
                                  }}
                                >
                                  <i className="fa-solid fa-xmark"></i>
                                </button>
                              </div>
                            ))
                          )}
                          <button
                            type="button"
                            onClick={() => openAddSubcategory(c)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#FFF7ED',
                              border: '1px dashed #FF6600',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#FF6600',
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fa-solid fa-plus" style={{ fontSize: '10px' }}></i> Add Sub
                          </button>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditCategory(c)}
                            title="Edit Category"
                            aria-label="Edit Category"
                            style={{ background: '#E2E8F0', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            title="Delete Category"
                            aria-label="Delete Category"
                            style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subcategories Directory Section */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0', color: '#0F172A' }}>
              All Subcategories ({subcategories.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Complete list of all subcategories across categories
              </span>
              <Link
                href="/admin/subcategories"
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#FF6600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>ক্যাটাগরি ভিত্তিক গ্রুপ ও রিরিডার পেজ</span>
                <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
              </Link>
            </div>
          </div>

          <button
            onClick={() => openAddSubcategory(null)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0F172A',
              color: '#fff',
              border: 'none',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-plus"></i> + Add Subcategory
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Order</th>
                <th style={{ width: '220px' }}>Subcategory Name</th>
                <th style={{ width: '180px' }}>Slug (URL)</th>
                <th>Parent Category</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '25px' }}>Loading subcategories...</td>
                </tr>
              ) : subcategories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#64748B' }}>
                    No subcategories created yet. Click &quot;+ Add Subcategory&quot; to create one!
                  </td>
                </tr>
              ) : (
                subcategories.map((sub) => {
                  const parentCat = categories.find((c) => Number(c.id) === Number(sub.category_id));
                  const catSubs = subcategories
                    .filter((s) => Number(s.category_id) === Number(sub.category_id))
                    .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0) || Number(a.id) - Number(b.id));
                  const catIndex = catSubs.findIndex((s) => Number(s.id) === Number(sub.id));
                  const isFirst = catIndex === 0;
                  const isLast = catIndex === catSubs.length - 1;

                  return (
                    <tr key={sub.id}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', minWidth: '24px' }}>
                            #{catIndex !== -1 ? catIndex + 1 : 1}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              type="button"
                              disabled={isFirst || reordering}
                              onClick={() => handleMoveSubcategory(sub, -1)}
                              title="Move Up"
                              style={{
                                border: '1px solid #CBD5E1',
                                background: isFirst ? '#F1F5F9' : '#FFFFFF',
                                color: isFirst ? '#CBD5E1' : '#0F172A',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                fontSize: '10px',
                                cursor: isFirst || reordering ? 'not-allowed' : 'pointer',
                                lineHeight: '1',
                              }}
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={isLast || reordering}
                              onClick={() => handleMoveSubcategory(sub, 1)}
                              title="Move Down"
                              style={{
                                border: '1px solid #CBD5E1',
                                background: isLast ? '#F1F5F9' : '#FFFFFF',
                                color: isLast ? '#CBD5E1' : '#0F172A',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                fontSize: '10px',
                                cursor: isLast || reordering ? 'not-allowed' : 'pointer',
                                lineHeight: '1',
                              }}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>
                        {sub.name}
                      </td>
                      <td style={{ color: '#64748B', fontSize: '13px' }}>
                        /{sub.slug}
                      </td>
                      <td>
                        {parentCat ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              background: '#FFF7ED',
                              border: '1px solid #FFEDD5',
                              color: '#FF6600',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            <i className={`fa-solid ${parentCat.icon || 'fa-folder'}`} style={{ fontSize: '11px' }}></i>
                            {parentCat.name}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: '12px' }}>Unknown</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditSubcategory(parentCat || { id: sub.category_id, name: 'Category' }, sub)}
                            title="Edit Subcategory"
                            aria-label="Edit Subcategory"
                            style={{ background: '#E2E8F0', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(sub.id)}
                            title="Delete Subcategory"
                            aria-label="Delete Subcategory"
                            style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Add/Edit Modal */}
      {isCatModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: '480px', background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                {editCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Phone"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Slug (URL Identifier) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smart-phone"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>FontAwesome Icon Class</label>
                <input
                  type="text"
                  placeholder="fa-mobile, fa-headphones, fa-box"
                  value={catForm.icon}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#FF6600', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  style={{ padding: '12px 18px', borderRadius: '8px', background: '#E2E8F0', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Add/Edit Modal */}
      {isSubModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '90%', maxWidth: '440px', background: '#fff', borderRadius: '16px', padding: '25px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                  {editSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Assign to a parent category
                </span>
              </div>
              <button onClick={() => setIsSubModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Parent Category *
                </label>
                <select
                  value={activeParentCat?.id || subForm.category_id || ''}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                    const parent = categories.find((c) => Number(c.id) === selectedId);
                    setActiveParentCat(parent || null);
                    setSubForm((prev) => ({ ...prev, category_id: selectedId }));
                  }}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', background: '#fff' }}
                >
                  <option value="" disabled>-- Select Parent Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Subcategory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone, Android, Earbuds"
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
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Subcategory Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iphone"
                  value={subForm.slug}
                  onChange={(e) => setSubForm({ ...subForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Must be unique within selected parent category.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Sort Order (ক্রম নম্বর)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1, 2, 3 (Optional)"
                  value={subForm.sort_order || ''}
                  onChange={(e) => setSubForm({ ...subForm, sort_order: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Lower numbers appear first. You can also reorder using ▲ and ▼ buttons in the table.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#FF6600', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  {editSubcategory ? 'Update Subcategory' : 'Save Subcategory'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  style={{ padding: '12px 18px', borderRadius: '8px', background: '#E2E8F0', border: 'none', fontWeight: '600', cursor: 'pointer' }}
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
