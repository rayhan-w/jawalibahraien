import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const filter = searchParams.get('filter');
    const sort = searchParams.get('sort');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const mock = db.getMockDb();

    let items = [...mock.products];

    // Search filter
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const keywords = q.split(/\s+/).filter(Boolean);
      items = items.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const titleAr = (p.title_ar || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        const cat = (p.sub_category || '').toLowerCase();
        const combined = `${title} ${titleAr} ${brand} ${cat}`;
        return keywords.every((kw) => combined.includes(kw));
      });
    }

    // Category filter
    if (category) {
      items = items.filter(
        (p) =>
          p.sub_category === category ||
          p.category_id?.toString() === category
      );
    }

    // Tab Filters
    if (filter === 'new_arrivals') {
      items = items.filter((p) => p.is_new === 1);
    } else if (filter === 'offers') {
      items = items.filter((p) => p.old_price && p.old_price > p.price);
    } else if (filter === 'bestsellers') {
      items = items.filter((p) => p.is_bestseller === 1);
    }

    // Sorting
    if (sort === 'price_low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_high') {
      items.sort((a, b) => b.price - a.price);
    } else {
      items.sort((a, b) => (a.sort_order || 999) - (b.sort_order || 999));
    }

    return NextResponse.json({
      success: true,
      data: items.slice(0, limit),
      total: items.length,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const mock = db.getMockDb();
    const newProduct = {
      id: body.id || Date.now(),
      title: body.title,
      title_ar: body.title_ar || body.title,
      brand: body.brand || 'Jawali',
      price: Number(body.price || 0),
      old_price: body.old_price ? Number(body.old_price) : null,
      stock: Number(body.stock || 10),
      badge: body.badge || '',
      image: body.image || '/logo.PNG',
      rating: 4.8,
      reviews_count: 0,
      category_id: body.category_id || 1,
      sub_category: body.sub_category || '',
      is_featured: body.is_featured ? 1 : 0,
      is_bestseller: body.is_bestseller ? 1 : 0,
      is_new: body.is_new ? 1 : 0,
      sort_order: body.sort_order || 1,
      views: 1,
      description: body.description || '',
      description_ar: body.description_ar || body.description || '',
    };
    mock.products.unshift(newProduct);
    return NextResponse.json({ success: true, data: newProduct });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
