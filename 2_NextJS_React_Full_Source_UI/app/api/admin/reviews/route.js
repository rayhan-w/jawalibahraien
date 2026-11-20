import { NextResponse } from 'next/server';

let adminReviews = [
  {
    id: 1,
    product_id: 990001,
    product_title: 'Apple iPhone 16 Pro Max 256GB - Desert Titanium',
    customer_name: 'Abdullah M.',
    customer_phone: '+973 39441234',
    rating: 5,
    comment: 'Authentic 100% genuine iPhone with official warranty. Extremely fast 2-hour delivery in Manama!',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    product_id: 900023,
    product_title: 'Coolshark Cooling Game Controller for Mobile (JK02)',
    customer_name: 'Tariq H.',
    customer_phone: '+973 36115678',
    rating: 5,
    comment: 'Coolshark controller keeps my phone icy cold during PUBG tournaments.',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    product_id: 960148,
    product_title: 'BRAVE MagSafe Car Phone Holder with Vacuum Suction',
    customer_name: 'Hassan Ali',
    customer_phone: '+973 33129900',
    rating: 5,
    comment: 'Is this suction holder compatible with curved windshields?',
    status: 'pending',
    created_at: new Date().toISOString(),
  }
];

export async function GET() {
  return NextResponse.json({ success: true, data: adminReviews });
}

export async function POST(req) {
  try {
    const { id, status } = await req.json();
    const item = adminReviews.find((r) => r.id === id);
    if (item) {
      item.status = status;
      return NextResponse.json({ success: true, message: `Review status changed to ${status}` });
    }
    return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '0', 10);
    adminReviews = adminReviews.filter((r) => r.id !== id);
    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
