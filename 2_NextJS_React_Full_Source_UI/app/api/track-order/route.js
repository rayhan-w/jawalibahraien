import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim().toLowerCase();

    if (!query) {
      return NextResponse.json({ success: false, message: 'Please enter an order number or phone number' });
    }

    // Dynamic mock response for order tracking
    const isMatched = query.includes('jaw') || query.includes('973') || query.includes('013') || query.length >= 4;

    if (!isMatched) {
      return NextResponse.json({ success: false, message: 'No matching order found for this number' });
    }

    const orderNumber = query.toUpperCase().startsWith('JAW') ? query.toUpperCase() : 'JAW-1001';

    return NextResponse.json({
      success: true,
      data: {
        order_number: orderNumber,
        customer_name: 'Ahmed Al-Khalifa',
        customer_phone: '+973 3988 1234',
        status: 'in_courier', // 'pending', 'confirmed', 'in_courier', 'delivered'
        courier_name: 'Bahrain Express / Steadfast',
        tracking_code: 'BHR-EXP-7721',
        total_price: '496.500 BHD',
        delivery_address: 'Villa 12, Road 402, Block 324, Adliya, Manama, Bahrain',
        payment_method: 'BenefitPay',
        payment_status: 'Paid / Verified',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        timeline: [
          { title: 'Order Placed', title_ar: 'تم تقديم الطلب', time: '10:00 AM', completed: true },
          { title: 'Order Confirmed', title_ar: 'تم تأكيد الطلب', time: '10:30 AM', completed: true },
          { title: 'Handed Over to Courier', title_ar: 'تم التسليم لشركة الشحن', time: '01:15 PM', completed: true },
          { title: 'Out for Delivery', title_ar: 'جاري التوصيل الآن', time: 'Pending', completed: false },
          { title: 'Delivered', title_ar: 'تم الاستلام بنجاح', time: 'Pending', completed: false },
        ]
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
