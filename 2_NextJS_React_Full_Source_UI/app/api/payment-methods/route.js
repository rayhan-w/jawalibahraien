import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const mock = db.getMockDb();
    const active = (mock.paymentMethods || []).filter((m) => m.is_active);
    return NextResponse.json({ success: true, data: active });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
