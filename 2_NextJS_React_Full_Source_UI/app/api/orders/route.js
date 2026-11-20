import { NextResponse } from 'next/server';

let mockOrders = [
  {
    id: 1001,
    order_number: 'JAW-1001',
    customer_name: 'Ahmed Al-Khalifa',
    customer_phone: '+973 3988 1234',
    address: 'Villa 12, Road 402, Block 324',
    city: 'Adliya, Manama',
    district: 'Capital Governorate',
    country: 'Bahrain',
    total_price: 496.500,
    subtotal: 495.000,
    delivery_charge: 1.500,
    currency: 'BHD',
    payment_method: 'benefitpay',
    payment_status: 'verified',
    trx_id: 'BNF-99382103',
    status: 'confirmed',
    courier_tracking_code: 'BHR-EXP-7721',
    notes: 'Please call before arrival.',
    items: [
      {
        id: 990001,
        title: 'Apple iPhone 16 Pro Max 256GB - Desert Titanium',
        price: 495.000,
        quantity: 1,
        image: 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/eeae4c8e-025e-49cc-8e56-5e0633fc0c58.jpg'
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 1002,
    order_number: 'JAW-1002',
    customer_name: 'Salman Rashid',
    customer_phone: '+973 3456 7890',
    address: 'Building 88, Road 1205, Block 212',
    city: 'Muharraq',
    district: 'Muharraq Governorate',
    country: 'Bahrain',
    total_price: 20.000,
    subtotal: 18.500,
    delivery_charge: 1.500,
    currency: 'BHD',
    payment_method: 'benefitpay',
    payment_status: 'pending',
    trx_id: 'BNF-77401924',
    status: 'pending',
    courier_tracking_code: '',
    notes: '',
    items: [
      {
        id: 900023,
        title: 'Coolshark Cooling Game Controller for Mobile (JK02)',
        price: 18.500,
        quantity: 1,
        image: 'https://jawalitelecombd.com/api/products/900023/image'
      }
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 1003,
    order_number: 'JAW-1003',
    customer_name: 'Rashid Khan',
    customer_phone: '01339893391',
    address: 'House 45, Bypass Road',
    city: 'Ramganj',
    district: 'Lakshmipur',
    country: 'Bangladesh',
    total_price: 5218,
    subtotal: 5158,
    delivery_charge: 60,
    currency: 'BDT',
    payment_method: 'bdt_wallet',
    payment_status: 'pending',
    trx_id: 'BK99X8771A',
    status: 'pending',
    courier_tracking_code: 'STF-882910',
    notes: 'Please pack carefully.',
    items: [
      {
        id: 900023,
        title: 'Coolshark Cooling Game Controller for Mobile (JK02)',
        price: 5158,
        quantity: 1,
        image: 'https://jawalitelecombd.com/api/products/900023/image'
      }
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  }
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    let list = [...mockOrders];
    if (status && status !== 'all') {
      list = list.filter((o) => o.status === status);
    }
    return NextResponse.json({ success: true, data: list });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const orderNum = `JAW-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: Date.now(),
      order_number: orderNum,
      customer_name: body.customer_name || body.name || 'Guest Customer',
      customer_phone: body.customer_phone || body.phone,
      address: body.address || '',
      city: body.city || '',
      district: body.district || 'Capital Governorate',
      country: body.country || 'Bahrain',
      total_price: Number(body.total_price || body.total || 0),
      subtotal: Number(body.subtotal || 0),
      delivery_charge: Number(body.delivery_charge || 0),
      currency: body.currency || 'BHD',
      payment_method: body.payment_method || body.paymentMethod || 'cod',
      payment_status: body.payment_status || (body.payment_method === 'cod' ? 'unpaid' : 'pending'),
      trx_id: body.trx_id || body.trxId || '',
      status: 'pending',
      courier_tracking_code: `BHR-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: body.notes || '',
      items: body.items || [],
      created_at: new Date().toISOString(),
    };

    mockOrders.unshift(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: newOrder,
      orderNumber: newOrder.order_number,
      orderId: newOrder.id,
      phone: newOrder.customer_phone,
      items: newOrder.items,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
