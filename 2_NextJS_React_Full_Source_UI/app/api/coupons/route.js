import { NextResponse } from 'next/server';

const mockCoupons = [
  { id: 1, code: 'JAWALI10', discount_type: 'percentage', discount_value: 10, min_spend: 10, is_active: 1 },
  { id: 2, code: 'BAHRAIN5', discount_type: 'flat', discount_value: 5, min_spend: 25, is_active: 1 },
  { id: 3, code: 'WELCOME', discount_type: 'flat', discount_value: 2, min_spend: 5, is_active: 1 },
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const total = parseFloat(searchParams.get('total') || '0');

    if (code) {
      const match = mockCoupons.find(
        (c) => c.code.toLowerCase() === code.trim().toLowerCase() && c.is_active
      );
      if (!match) {
        return NextResponse.json({ success: false, message: 'Invalid or expired coupon code' });
      }
      if (total < match.min_spend) {
        return NextResponse.json({
          success: false,
          message: `Minimum order amount of ${match.min_spend} is required for this coupon`,
        });
      }
      let discountAmount = 0;
      if (match.discount_type === 'percentage') {
        discountAmount = (total * match.discount_value) / 100;
      } else {
        discountAmount = match.discount_value;
      }
      return NextResponse.json({
        success: true,
        discount: discountAmount,
        coupon: match,
      });
    }

    return NextResponse.json({ success: true, data: mockCoupons });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newCoupon = {
      id: Date.now(),
      code: body.code.toUpperCase(),
      discount_type: body.discount_type || 'flat',
      discount_value: Number(body.discount_value || 0),
      min_spend: Number(body.min_spend || 0),
      is_active: 1,
    };
    mockCoupons.push(newCoupon);
    return NextResponse.json({ success: true, data: newCoupon });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
