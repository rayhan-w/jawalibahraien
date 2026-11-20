import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const mock = db.getMockDb();
    return NextResponse.json({ success: true, data: mock.banners });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const mock = db.getMockDb();
    const newBanner = {
      id: Date.now(),
      title: body.title,
      title_ar: body.title_ar || body.title,
      subtitle: body.subtitle,
      subtitle_ar: body.subtitle_ar || body.subtitle,
      badge: body.badge || 'Promo',
      badge_ar: body.badge_ar || 'عرض خاص',
      image: body.image || '/logo.PNG',
      link: body.link || '/products',
      button_text: body.button_text || 'Shop Now',
      button_text_ar: body.button_text_ar || 'تسوق الآن',
      is_active: 1,
      sort_order: 1,
    };
    mock.banners.push(newBanner);
    return NextResponse.json({ success: true, data: newBanner });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
