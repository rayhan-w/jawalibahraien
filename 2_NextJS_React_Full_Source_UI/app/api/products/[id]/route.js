import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const mock = db.getMockDb();
    const product = mock.products.find((p) => p.id?.toString() === id?.toString());
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const mock = db.getMockDb();
    const idx = mock.products.findIndex((p) => p.id?.toString() === id?.toString());
    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }
    mock.products[idx] = { ...mock.products[idx], ...body };
    return NextResponse.json({ success: true, data: mock.products[idx] });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const mock = db.getMockDb();
    mock.products = mock.products.filter((p) => p.id?.toString() !== id?.toString());
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
