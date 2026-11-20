import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // Return sample order matching ID or default
    return NextResponse.json({
      success: true,
      data: {
        id: id || 1001,
        order_number: `JAW-${id || 1001}`,
        customer_name: 'Ahmed Al-Khalifa',
        customer_phone: '+973 3988 1234',
        address: 'Villa 12, Road 402, Block 324',
        city: 'Adliya, Manama',
        district: 'Capital Governorate',
        country: 'Bahrain',
        subtotal: 495.000,
        delivery_charge: 1.500,
        discount_amount: 0,
        total_price: 496.500,
        currency: 'BHD',
        payment_method: 'benefitpay',
        payment_status: 'verified',
        trx_id: 'BNF-99382103',
        status: 'confirmed',
        courier_tracking_code: 'BHR-EXP-7721',
        courier_name: 'Bahrain Express Courier',
        notes: 'Deliver to receptionist if unavailable.',
        created_at: new Date().toISOString(),
        items: [
          {
            id: 990001,
            title: 'Apple iPhone 16 Pro Max 256GB - Desert Titanium',
            price: 495.000,
            quantity: 1,
            image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/eeae4c8e-025e-49cc-8e56-5e0633fc0c58.jpg',
          }
        ]
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: `Order #${id} updated successfully`,
      data: body,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
