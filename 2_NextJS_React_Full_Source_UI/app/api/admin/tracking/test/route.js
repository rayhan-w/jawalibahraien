import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: 'Meta Conversions API (CAPI) event dispatched successfully',
      event: body.eventName || 'ViewContent',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
