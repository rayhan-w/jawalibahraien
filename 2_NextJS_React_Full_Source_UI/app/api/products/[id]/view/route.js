import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const mock = db.getMockDb();
    const product = mock.products.find((p) => p.id?.toString() === id?.toString());
    if (product) {
      product.views = (product.views || 10) + 1;
      return NextResponse.json({ success: true, views: product.views });
    }
    return NextResponse.json({ success: true, views: 24 });
  } catch (err) {
    return NextResponse.json({ success: true, views: 25 });
  }
}
