import { NextResponse } from 'next/server';

const mockSubCategories = [
  { id: 1, category_id: 1, name: 'iPhone & iOS', name_ar: 'آيفون و آي أو إس', slug: 'iphone' },
  { id: 2, category_id: 1, name: 'Samsung Galaxy', name_ar: 'سامسونج جالكسي', slug: 'samsung' },
  { id: 3, category_id: 2, name: 'TWS Wireless Earbuds', name_ar: 'سماعات بلوتوث لاسلكية', slug: 'earbuds-audio' },
  { id: 4, category_id: 4, name: 'Solar & Heavy Power Banks', name_ar: 'شواحن شمسية وسعات ضخمة', slug: 'solar-power-banks' },
  { id: 5, category_id: 5, name: 'Fast PD Wall Chargers', name_ar: 'شواحن جدارية سريعة', slug: 'wall-chargers' },
  { id: 6, category_id: 8, name: 'MagSafe Car Mounts', name_ar: 'حوامل سيارات ماج سيف', slug: 'magsafe-car-holders' },
  { id: 7, category_id: 10, name: 'Gaming Mobile Triggers & Coolers', name_ar: 'أزرار ومبردات ألعاب الجوال', slug: 'gaming-accessories' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockSubCategories });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newSub = {
      id: Date.now(),
      category_id: body.category_id || 1,
      name: body.name,
      name_ar: body.name_ar || body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
    };
    mockSubCategories.push(newSub);
    return NextResponse.json({ success: true, data: newSub });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
