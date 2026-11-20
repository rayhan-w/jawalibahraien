import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const mock = db.getMockDb();
    const sorted = [...mock.categories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return NextResponse.json({ success: true, data: sorted });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const mock = db.getMockDb();
    const newCat = {
      id: body.id || Date.now(),
      name: body.name,
      name_ar: body.name_ar || body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      icon: body.icon || 'fa-tag',
      sort_order: body.sort_order || mock.categories.length + 1,
    };
    mock.categories.push(newCat);
    return NextResponse.json({ success: true, data: newCat });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
