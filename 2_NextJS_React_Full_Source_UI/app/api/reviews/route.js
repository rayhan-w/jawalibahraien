import { NextResponse } from 'next/server';

let mockReviews = [
  {
    id: 1,
    product_id: 990001,
    customer_name: 'Abdullah M.',
    customer_phone: '+973 3944****',
    rating: 5,
    comment: 'Authentic 100% genuine iPhone with official warranty. Extremely fast 2-hour delivery in Manama!',
    comment_ar: 'هاتف أصلي ١٠٠٪ مع ضمان رسمي. توصيل سريع جداً خلال ساعتين في المنامة!',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    product_id: 900023,
    customer_name: 'Tariq H.',
    customer_phone: '+973 3611****',
    rating: 5,
    comment: 'Coolshark controller keeps my phone icy cold during PUBG tournaments. Best gaming gadget in Bahrain.',
    comment_ar: 'مقبض كول شارك ممتاز جداً في تبريد الجوال أثناء لعب ببجي. أفضل أداة ألعاب في البحرين.',
    status: 'approved',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    product_id: 870019,
    customer_name: 'Fahad K.',
    customer_phone: '+973 3822****',
    rating: 5,
    comment: 'The solar panels and hand crank work perfectly for camping in Sakhir desert!',
    comment_ar: 'الألواح الشمسية والشحن اليدوي يعملون بكفاءة عالية لرحلات التخييم في بر الصخير!',
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    let approved = mockReviews.filter((r) => r.status === 'approved');
    if (productId) {
      approved = approved.filter((r) => r.product_id?.toString() === productId?.toString());
    }
    return NextResponse.json({ success: true, data: approved });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newRev = {
      id: Date.now(),
      product_id: body.product_id || 1,
      customer_name: body.customer_name || 'Verified Customer',
      customer_phone: body.customer_phone || '',
      rating: body.rating || 5,
      comment: body.review_text || body.comment || '',
      status: 'pending', // Moderation: stays pending until admin approves
      created_at: new Date().toISOString(),
    };
    mockReviews.unshift(newRev);
    return NextResponse.json({
      success: true,
      message: 'Review submitted and pending moderation by admin',
      data: newRev,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
