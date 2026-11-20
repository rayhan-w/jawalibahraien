import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
  try {
    const { items } = await req.json();
    const mock = db.getMockDb();
    if (Array.isArray(items)) {
      items.forEach((it, index) => {
        const found = mock.categories.find((c) => c.id?.toString() === it.id?.toString());
        if (found) found.sort_order = index + 1;
      });
    }
    return NextResponse.json({ success: true, message: 'Categories reordered successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
